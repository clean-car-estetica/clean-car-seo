// Sincronização com o GBR SAS (17/10/2026). Rodar: npx tsx tests/gbr-sync.test.ts
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://site.supabase.teste";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
process.env.SUPABASE_SERVICE_ROLE_KEY = "svc";

let ok = 0, falhas = 0;
const t = (nome: string, c: boolean) => { if (c) ok++; else { falhas++; console.log("FALHOU:", nome); } };

const SAS_SERV = [
  { id: "a1", nome: "🥉 Lavagem Bronze", preco: 50, duracao: "1h", destaque: false, ativo: true },
  { id: "a2", nome: "🥇 Lavagem Ouro", preco: 240, duracao: "3h 40min", destaque: false, ativo: true },
  { id: "a3", nome: "Higienização Interna", preco: 450, duracao: "8h", destaque: true, ativo: true },
  { id: "a4", nome: "Polimento", preco: 500, duracao: "6h", destaque: false, ativo: false },
  { id: "a5", nome: "Estofado", preco: null, duracao: null, destaque: false, ativo: true },
];
const FUNC = {
  configurado: true,
  semana: [
    { dia: "seg", nome: "Segunda", aberto: true, inicio: "09:00", fim: "18:00" }, { dia: "ter", nome: "Terça", aberto: true, inicio: "09:00", fim: "18:00" },
    { dia: "qua", nome: "Quarta", aberto: true, inicio: "09:00", fim: "18:00" }, { dia: "qui", nome: "Quinta", aberto: true, inicio: "09:00", fim: "18:00" },
    { dia: "sex", nome: "Sexta", aberto: true, inicio: "09:00", fim: "18:00" }, { dia: "sab", nome: "Sábado", aberto: true, inicio: "09:00", fim: "17:00" },
    { dia: "dom", nome: "Domingo", aberto: false, inicio: null, fim: null },
  ],
  hoje: { data: "2026-11-02", aberto: false, abertoAgora: false, inicio: null, fim: null, especial: true, motivo: "Finados", reabreAs: null },
  excecoes: [
    { tipo: "fechado", data: "2026-11-02", dataFim: null, inicio: null, fim: null, motivo: "Finados" },
    { tipo: "horario", data: "2026-11-15", dataFim: null, inicio: "10:00", fim: "14:00", motivo: "Proclamação da República" },
    { tipo: "pausa", data: "2026-11-20", dataFim: null, inicio: "14:00", fim: "16:00", motivo: "x" },
  ],
  levaTras: { disponivel: false },
};
let integracaoAtiva = true;
let vinculos: Record<string, string> = { "higienizacao": "a3", "estofados": "nenhum" };
let sasFora = false;
globalThis.fetch = (async (url: string | URL | Request) => {
  const u = String(url instanceof Request ? url.url : url);
  const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { "content-type": "application/json" } });
  if (u.includes("gbr_integracao")) return json(integracaoAtiva ? { api_url: "https://sas.teste/api/v1/", api_key: "k", ativo: true } : { ativo: false });
  if (u.includes("site_content")) return json({ data: vinculos });
  if (sasFora && u.startsWith("https://sas.teste")) throw new Error("ECONNREFUSED");
  if (u === "https://sas.teste/api/v1/servicos?todos=1") return json({ servicos: SAS_SERV });
  if (u === "https://sas.teste/api/v1/funcionamento") return json(FUNC);
  return json({}, 404);
}) as typeof fetch;

const G = await import("../lib/gbr-sync.ts");

t("normaliza nome com emoji e acento", G.normalizarNome("🥇 Lavagem Ouro") === "lavagem ouro" && G.normalizarNome("Higienização") === "higienizacao");
t("limpa emoji do nome", G.limparNome("🥉 Lavagem Bronze") === "Lavagem Bronze");
t("duração 3h 40min → 3h40", G.duracaoSite("3h 40min") === "3h40");
t("duração 45min", G.duracaoSite("45min") === "45min");
t("duração 2h", G.duracaoSite("2h") === "2h");
t("duração vazia", G.duracaoSite(null) === null && G.duracaoSite("abc") === null);

const site = [
  { slug: "lavagem-bronze", nome: "Lavagem Bronze", duracao: "45min", preco_desde: 45, tag: null, ativo: true },
  { slug: "lavagem-ouro", nome: "Lavagem Ouro", duracao: "3h", preco_desde: 220, tag: "Mais pedido", ativo: true },
  { slug: "higienizacao", nome: "Higienização Interna VIP", duracao: "8h", preco_desde: 420, tag: "Saúde da família", ativo: true },
  { slug: "polimento", nome: "Polimento", duracao: "6h", preco_desde: 400, tag: null, ativo: true },
  { slug: "estofados", nome: "Estofado", duracao: null, preco_desde: null, tag: "A domicílio", ativo: true },
  { slug: "faróis", nome: "Restauração de Faróis", duracao: "2h", preco_desde: 200, tag: null, ativo: true },
];
const r = await G.aplicarServicosSas(site);
const por = (slug: string) => r.find((s) => s.slug === slug);
t("preço e duração vêm do SAS", por("lavagem-bronze")?.preco_desde === 50 && por("lavagem-bronze")?.duracao === "1h");
t("vínculo escolhido no console vence o nome", por("higienizacao")?.preco_desde === 450 && por("higienizacao")?.nome === "Higienização Interna");
t("pausado no SAS some do site", !por("polimento"));
t("'não sincronizar' respeitado", por("estofados")?.preco_desde === null && por("estofados")?.sincronizadoSas !== true);
t("sem par no SAS fica como estava", por("faróis")?.preco_desde === 200 && !por("faróis")?.sincronizadoSas);
t("destaque do SAS tira 'Mais pedido' de quem não é destaque", por("lavagem-ouro")?.tag === null);
t("destaque não apaga outra etiqueta", por("higienizacao")?.tag === "Saúde da família");

sasFora = true;
const r2 = await G.aplicarServicosSas(site);
t("SAS fora do ar: site intacto", r2.length === site.length && r2[0].preco_desde === 45);
sasFora = false;
integracaoAtiva = false;
t("integração desligada: site intacto", (await G.aplicarServicosSas(site)).length === site.length);
integracaoAtiva = true;

t("semana agrupada", JSON.stringify(G.linhasSemana(FUNC.semana as never)) === JSON.stringify(["Segunda a sexta: 9h às 18h", "Sábado: 9h às 17h", "Domingo: fechado"]));
t("exceções em texto", G.linhasExcecoes(FUNC.excecoes as never)[1] === "15/11 (Proclamação da República): 10h às 14h");
t("aviso de hoje fechado", G.avisoHoje(FUNC as never) === "Hoje estamos fechados (Finados).");

const contato = { horarioSemana: "Seg a sex", horarioSabado: "Sáb", observacaoHorario: "Feriados sujeitos a alteração", levaETraz: true, outro: "x" };
const c = await G.aplicarFuncionamentoSas(contato);
t("leva e traz pausado no SAS desliga no site", c.levaETraz === false);
t("linhas de horário do SAS", c.horarioLinhas?.length === 3 && c.horarioSemana === "Segunda a sexta: 9h às 18h");
t("observação lista feriados (sem pausas)", c.observacaoHorario.includes("02/11 (Finados): fechado") && !c.observacaoHorario.includes("20/11"));
t("aviso hoje preenchido", c.horarioAvisoHoje === "Hoje estamos fechados (Finados).");
t("demais campos preservados", (c as typeof contato).outro === "x");

console.log(`gbr-sync: ${ok} ok, ${falhas} falhas`);
if (falhas) process.exit(1);
