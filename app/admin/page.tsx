import AvisoCampanha from "@/components/admin/AvisoCampanha";
import { getCampanhas } from "@/lib/campanhas-servidor";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Search, MousePointerClick, Users, MessageCircle, Plug, Lightbulb, Minus } from "lucide-react";
import { calcularPeriodo, carregarResultados, type Busca, type Resultados } from "@/lib/metricas";
import GraficoDiario from "@/components/admin/GraficoDiario";

const n = (v: number) => Math.round(v).toLocaleString("pt-BR");
const pct = (v: number) => `${(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
const dataBR = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const deslocarIso = (d: string, dias: number) => new Date(Date.parse(d + "T00:00:00Z") + dias * 86_400_000).toISOString().slice(0, 10);

function Variacao({ atual, antes, semComparacao }: { atual: number; antes: number; semComparacao?: boolean }) {
  if (semComparacao) return <span className="text-xs text-steel-line">parcial: o Google ainda está contando estes dias</span>;
  if (!antes && !atual) return <span className="text-xs text-steel-line">sem dados antes</span>;
  if (!antes) return <span className="text-xs text-verniz-shine font-bold">novo</span>;
  const d = (atual - antes) / antes;
  const igual = Math.abs(d) < 0.02;
  const Icone = igual ? Minus : d > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${igual ? "text-steel-line" : d > 0 ? "text-ok" : "text-warn"}`}>
      <Icone size={14} aria-hidden />
      {igual ? "igual" : `${d > 0 ? "+" : ""}${Math.round(d * 100)}%`}
      <span className="font-normal text-steel-line ml-1">vs. período anterior</span>
    </span>
  );
}

function Etapa({
  icone: Icone, titulo, valor, explicacao, atual, antes, taxa, indisponivel, nota, semComparacao, semVariacao,
}: {
  icone: typeof Search; titulo: string; valor: number; explicacao: string; atual: number; antes: number; taxa?: string; indisponivel?: string; nota?: string; semComparacao?: boolean; semVariacao?: boolean;
}) {
  return (
    <div className="relative bg-card border border-card-line rounded-2xl p-5 flex flex-col gap-2 min-w-0">
      <div className="flex items-center gap-2 text-steel-line">
        <Icone size={16} className="text-verniz-shine" aria-hidden />
        <span className="text-xs font-bold uppercase tracking-wide">{titulo}</span>
      </div>
      {indisponivel ? (
        <p className="text-sm text-steel-line py-2">{indisponivel}</p>
      ) : (
        <>
          <div className="font-display font-extrabold text-4xl text-steel tabular-nums leading-none">{n(valor)}</div>
          {!semVariacao && <Variacao atual={atual} antes={antes} semComparacao={semComparacao} />}
        </>
      )}
      <p className="text-xs text-steel-line leading-relaxed">{explicacao}</p>
      {nota && !indisponivel && <p className="text-[11px] text-cera leading-relaxed">{nota}</p>}
      {taxa && !indisponivel && (
        <span className="self-start mt-auto rounded-full bg-verniz/10 text-verniz-shine text-[11px] font-bold px-2.5 py-1">{taxa}</span>
      )}
    </div>
  );
}

function Cartao({ titulo, sub, children, className = "" }: { titulo: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-card border border-card-line rounded-2xl p-5 md:p-6 min-w-0 ${className}`}>
      <h2 className="font-display font-bold text-lg text-steel">{titulo}</h2>
      {sub && <p className="text-xs text-steel-line mt-0.5 mb-4">{sub}</p>}
      {!sub && <div className="mb-4" />}
      {children}
    </section>
  );
}

function ListaBarras({ itens, unidade }: { itens: { nome: string; valor: number; extra?: string }[]; unidade: string }) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  if (itens.length === 0) return <p className="text-sm text-steel-line">Sem dados neste período.</p>;
  return (
    <ul className="grid gap-2.5">
      {itens.map((i) => (
        <li key={i.nome} className="grid gap-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-steel truncate">{i.nome}</span>
            <span className="tabular-nums text-steel font-bold shrink-0">
              {n(i.valor)} <span className="font-normal text-steel-line text-xs">{unidade}{i.extra ? ` · ${i.extra}` : ""}</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-carbon overflow-hidden">
            <div className="h-full rounded-full bg-verniz" style={{ width: `${Math.max(2, (i.valor / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Posicao({ p }: { p: number }) {
  const [rotulo, classe] =
    p <= 3 ? ["Topo", "bg-ok/15 text-ok"] : p <= 10 ? ["1ª página", "bg-verniz/15 text-verniz-shine"] : p <= 20 ? ["2ª página", "bg-cera/15 text-cera"] : ["Longe", "bg-carbon text-steel-line"];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="tabular-nums text-steel">{p.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}</span>
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${classe}`}>{rotulo}</span>
    </span>
  );
}

function TabelaBuscas({ buscas }: { buscas: Busca[] }) {
  if (buscas.length === 0) return <p className="text-sm text-steel-line">O Google ainda não mostrou o site para nenhuma busca neste período.</p>;
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[440px]">
        <thead>
          <tr className="text-left text-steel-line text-[11px] uppercase tracking-wide">
            <th className="pb-2 px-1 font-bold">O que a pessoa digitou</th>
            <th className="pb-2 px-1 font-bold text-right">Apareceu</th>
            <th className="pb-2 px-1 font-bold text-right">Cliques</th>
            <th className="pb-2 px-1 font-bold text-right">Posição</th>
          </tr>
        </thead>
        <tbody>
          {buscas.map((b) => (
            <tr key={b.termo} className="border-t border-card-line">
              <td className="py-2 px-1 text-steel">{b.termo}</td>
              <td className="py-2 px-1 text-right tabular-nums text-steel-line">{n(b.aparicoes)}</td>
              <td className="py-2 px-1 text-right tabular-nums font-bold text-steel">{n(b.cliques)}</td>
              <td className="py-2 px-1 text-right"><Posicao p={b.posicao} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CORES_SECAO = {
  ok: { caixa: "border-ok/30 bg-ok/[0.04]", titulo: "text-ok" },
  verniz: { caixa: "border-verniz/30 bg-verniz/[0.04]", titulo: "text-verniz-shine" },
  cera: { caixa: "border-cera/30 bg-cera/[0.04]", titulo: "text-cera" },
  neutro: { caixa: "border-card-line bg-card/40", titulo: "text-steel" },
};

function Secao({ titulo, sub, cor, children }: { titulo: string; sub: string; cor: keyof typeof CORES_SECAO; children: React.ReactNode }) {
  return (
    <section className={`grid gap-5 rounded-3xl border p-4 md:p-6 ${CORES_SECAO[cor].caixa}`}>
      <div>
        <h2 className={`font-display font-extrabold text-2xl ${CORES_SECAO[cor].titulo}`}>{titulo}</h2>
        <p className="text-sm text-steel-line mt-1 max-w-3xl leading-relaxed">{sub}</p>
      </div>
      {children}
    </section>
  );
}

/** Resumo no topo: de onde vem cada número do painel. */
function DeOndeVem() {
  const linhas: [string, string, string][] = [
    ["Pessoas no site, páginas abertas", "Site", "na hora"],
    ["Cliques no WhatsApp e Agendar, formulários", "Site", "na hora"],
    ["De onde veio, páginas que geram contato, últimos cliques", "Site", "na hora"],
    ["Pessoas, páginas, cliques no WhatsApp, canais, cidades, aparelhos", "Analytics", "algumas horas depois"],
    ["Apareceu no Google, posição, o que pesquisaram", "Search Console", "2 a 3 dias depois"],
    ["Clicou no resultado do Google", "Search Console", "2 a 3 dias depois"],
  ];
  return (
    <details className="bg-card border border-card-line rounded-2xl p-5 group" open>
      <summary className="cursor-pointer font-display font-bold text-steel list-none flex items-center justify-between">
        De onde vem cada número
        <span className="text-xs text-steel-line font-sans group-open:hidden">mostrar</span>
      </summary>
      <div className="overflow-x-auto mt-3 -mx-1">
        <table className="w-full text-sm min-w-[360px]">
          <thead>
            <tr className="text-left text-steel-line text-[11px] uppercase tracking-wide">
              <th className="pb-2 px-1 font-bold">Número</th>
              <th className="pb-2 px-1 font-bold">Quem conta</th>
              <th className="pb-2 px-1 font-bold">Quando aparece</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map(([numero, fonte, quando]) => (
              <tr key={numero} className="border-t border-card-line align-top">
                <td className="py-2 px-1 text-steel">{numero}</td>
                <td className={`py-2 px-1 font-bold ${fonte === "Site" ? "text-ok" : fonte === "Analytics" ? "text-cera" : "text-verniz-shine"}`}>{fonte}</td>
                <td className="py-2 px-1 text-steel-line">{quando}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-steel-line mt-3">
        Exemplo: um cliente pesquisa no Google, entra no site e clica no WhatsApp. Na hora, a parte 1 (site) mostra a visita vinda do Google e o clique no WhatsApp. Em algumas horas o Analytics (parte 2) também conta. Dois ou três dias depois, o Search Console (parte 3) mostra o clique dele no resultado do Google. Na parte 4 você vê os três lado a lado.
      </p>
    </details>
  );
}

/** Quadro lado a lado: o mesmo assunto em cada fonte, mais a tabela dia a dia. */
function Comparacao({ r }: { r: Resultados }) {
  const { site: s, analytics: a, google: g } = r;
  const cliquesGoogle = g.porDia.reduce((t, d) => t + d.cliques, 0);
  const aparicoes = g.porDia.reduce((t, d) => t + d.aparicoes, 0);
  const semA = a.ok ? null : "não ligado";
  const semG = g.ok ? null : "não ligado";
  const parcialG = g.ok && g.parcial ? "*" : "";
  const linhas: { assunto: string; site: string; analytics: string; console: string; ajuda: string }[] = [
    { assunto: "Pessoas no site", site: n(s.pessoas), analytics: semA ?? n(a.pessoas), console: "—",
      ajuda: "Site e Analytics devem ficar próximos. Analytics menor: bloqueadores/cookies recusados." },
    { assunto: "Páginas abertas", site: n(s.visitas), analytics: semA ?? n(a.paginasVistas), console: "—", ajuda: "" },
    { assunto: "Vieram pelo Google", site: n(s.pessoasGoogle), analytics: semA ?? n(a.pessoasBuscaGoogle), console: semG ?? `${n(cliquesGoogle)}${parcialG}`,
      ajuda: "Site e Analytics contam pessoas; o Console conta cliques no resultado (os últimos dias chegam depois)." },
    { assunto: "Clicou no WhatsApp/Agendar", site: n(s.whatsapp + s.agendar), analytics: semA ?? n(a.cliquesWhats), console: "—",
      ajuda: "O Console não vê cliques dentro do site." },
    { assunto: "Formulários enviados", site: n(s.formularios), analytics: semA ?? n(a.formularios), console: "—", ajuda: "" },
    { assunto: "Apareceu no Google", site: "—", analytics: "—", console: semG ?? `${n(aparicoes)}${parcialG}`, ajuda: "Só o Console sabe disso." },
  ];
  const mapaA = new Map(a.porDia.map((d) => [d.data, d.pessoas]));
  const mapaG = new Map(g.porDia.map((d) => [d.data, d.cliques]));
  const dias = [...s.porDia].reverse();
  const col = "py-2 px-2 text-right tabular-nums";
  return (
    <div className="grid gap-6">
      <Cartao titulo="Mesmo assunto, três fontes" sub="Período escolhido no topo">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[420px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide">
                <th className="pb-2 px-2 font-bold text-steel-line">Assunto</th>
                <th className="pb-2 px-2 font-bold text-right text-ok">Site</th>
                <th className="pb-2 px-2 font-bold text-right text-cera">Analytics</th>
                <th className="pb-2 px-2 font-bold text-right text-verniz-shine">Console</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.assunto} className="border-t border-card-line align-top">
                  <td className="py-2 px-2 text-steel">
                    {l.assunto}
                    {l.ajuda && <span className="block text-[11px] text-steel-line leading-snug mt-0.5">{l.ajuda}</span>}
                  </td>
                  <td className={`${col} font-bold text-steel`}>{l.site}</td>
                  <td className={`${col} text-steel`}>{l.analytics}</td>
                  <td className={`${col} text-steel`}>{l.console}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {parcialG && <p className="text-[11px] text-steel-line mt-3">* Console ainda incompleto nos últimos 2 a 3 dias do período.</p>}
      </Cartao>

      <Cartao titulo="Dia a dia" sub="Pessoas segundo o site e o Analytics, quem veio do Google segundo o site, cliques no resultado do Google (Console) e cliques no WhatsApp (site)">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide">
                <th className="pb-2 px-2 font-bold text-left text-steel-line">Dia</th>
                <th className="pb-2 px-2 font-bold text-right text-ok">Pessoas · site</th>
                <th className="pb-2 px-2 font-bold text-right text-cera">Pessoas · Analytics</th>
                <th className="pb-2 px-2 font-bold text-right text-ok">Do Google · site</th>
                <th className="pb-2 px-2 font-bold text-right text-verniz-shine">Cliques · Console</th>
                <th className="pb-2 px-2 font-bold text-right text-ok">WhatsApp · site</th>
              </tr>
            </thead>
            <tbody>
              {dias.map((d) => {
                const recente = g.ok && d.data > g.completoAte;
                return (
                  <tr key={d.data} className="border-t border-card-line">
                    <td className="py-2 px-2 text-steel tabular-nums">{dataBR(d.data)}</td>
                    <td className={`${col} font-bold text-steel`}>{n(d.pessoas)}</td>
                    <td className={`${col} text-steel`}>{a.ok ? n(mapaA.get(d.data) ?? 0) : "—"}</td>
                    <td className={`${col} text-steel`}>{n(d.pessoasGoogle)}</td>
                    <td className={`${col} ${recente ? "text-steel-line" : "text-steel"}`}>{g.ok ? (recente ? `${n(mapaG.get(d.data) ?? 0)}*` : n(mapaG.get(d.data) ?? 0)) : "—"}</td>
                    <td className={`${col} text-steel`}>{n(d.contatos)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Cartao>
    </div>
  );
}

function AvisoConexao({ r }: { r: Resultados }) {
  const passos = [
    { ok: r.conexao.conta, texto: "Chave do Google na Vercel (GOOGLE_CLIENT_EMAIL e GOOGLE_PRIVATE_KEY)" },
    { ok: r.conexao.ga4, texto: "ID da propriedade do Analytics (GA4_PROPERTY_ID)" },
    { ok: r.google.ok, texto: "Acesso ao Search Console liberado para o e-mail da conta" },
    { ok: r.analytics.ok, texto: "Acesso ao Analytics liberado para o e-mail da conta" },
  ];
  if (passos.every((p) => p.ok)) return null;
  const erro = [r.google.erro, r.analytics.erro].find((e) => e && e !== "nao-configurado");
  return (
    <div className="bg-card border border-cera/40 rounded-2xl p-5 flex gap-4">
      <Plug className="text-cera shrink-0 mt-0.5" size={20} aria-hidden />
      <div className="min-w-0">
        <h2 className="font-display font-bold text-steel">Ligação com o Google incompleta</h2>
        <p className="text-sm text-steel-line mt-1">Os números do Google aparecem aqui assim que estes itens estiverem prontos. Os dados do próprio site já funcionam.</p>
        <ul className="mt-3 grid gap-1 text-sm">
          {passos.map((p) => (
            <li key={p.texto} className={p.ok ? "text-ok" : "text-steel-line"}>
              {p.ok ? "✓" : "○"} {p.texto}
            </li>
          ))}
        </ul>
        {r.conexao.email && <p className="text-xs text-steel-line mt-3 break-all">E-mail da conta: <code className="text-steel">{r.conexao.email}</code></p>}
        {erro && <p className="text-xs text-warn mt-2 break-words">Resposta do Google: {erro}</p>}
      </div>
    </div>
  );
}

export default async function Resultados({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; inicio?: string; fim?: string }>;
}) {
  const sp = await searchParams;
  const periodo = calcularPeriodo(sp.periodo || "30d", sp.inicio, sp.fim);
  const [r, campanhas] = await Promise.all([carregarResultados(periodo), getCampanhas()]);
  const { google: g, analytics: a, site: s } = r;
  const notaGoogle = !g.ok || !g.parcial ? undefined
    : g.semComparacao
      ? `Ainda incompleto: o Google só fecha estes dias até ${dataBR(deslocarIso(r.periodo.fim, 3))}.`
      : `Contado até ${dataBR(g.completoAte)} (o Google fecha os últimos dias com 2 a 3 dias de atraso), comparado com o mesmo número de dias antes.`;

  const oportunidades = g.buscas
    .filter((b) => b.posicao > 4 && b.posicao <= 25 && b.aparicoes >= 3)
    .sort((x, y) => y.aparicoes - x.aparicoes)
    .slice(0, 6);

  const periodos = [
    { valor: "1d", label: "Hoje" },
    { valor: "7d", label: "7 dias" },
    { valor: "30d", label: "30 dias" },
    { valor: "90d", label: "90 dias" },
    { valor: "mes", label: "Este mês" },
  ];

  return (
    <div className="grid gap-6 max-w-6xl">
      <AvisoCampanha lista={campanhas} compacto />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-steel">Resultados</h1>
          <p className="text-steel-line text-sm mt-1">
            {r.periodo.dias === 1
              ? `${dataBR(r.periodo.inicio)} · comparado ao dia anterior`
              : `${dataBR(r.periodo.inicio)} a ${dataBR(r.periodo.fim)} · comparado aos ${r.periodo.dias} dias anteriores`}
          </p>
          {periodo.chave === "1d" && (
            <p className="text-steel-line text-xs mt-1">Os números do Google chegam com 2 a 3 dias de atraso; os contatos do site e as visitas aparecem na hora.</p>
          )}
        </div>
        <nav className="flex flex-wrap items-center gap-2" aria-label="Período">
          {periodos.map((p) => (
            <Link
              key={p.valor}
              href={`/admin?periodo=${p.valor}`}
              className={`px-4 py-2 rounded-full text-sm font-bold ${periodo.chave === p.valor ? "bg-verniz text-carbon" : "bg-card border border-card-line text-steel-line hover:text-verniz-shine"}`}
            >
              {p.label}
            </Link>
          ))}
          <form method="GET" className="flex items-center gap-1.5">
            <input type="hidden" name="periodo" value="personalizado" />
            <label className="sr-only" htmlFor="per-ini">Início</label>
            <input id="per-ini" type="date" name="inicio" defaultValue={sp.inicio} className="px-2 py-2 rounded-lg bg-card border border-card-line text-steel text-xs" />
            <label className="sr-only" htmlFor="per-fim">Fim</label>
            <input id="per-fim" type="date" name="fim" defaultValue={sp.fim} className="px-2 py-2 rounded-lg bg-card border border-card-line text-steel text-xs" />
            <button type="submit" className={`px-3 py-2 rounded-lg text-xs font-bold ${periodo.chave === "personalizado" ? "bg-verniz text-carbon" : "bg-card border border-card-line text-steel-line hover:text-verniz-shine"}`}>Ver datas</button>
          </form>
        </nav>
      </header>

      <DeOndeVem />

      {/* ═════════ 1. CONTADO PELO PRÓPRIO SITE ═════════ */}
      <Secao
        cor="ok"
        titulo="1 · Contado pelo próprio site"
        sub="Aparece na hora. O site registra cada visita e cada clique, já sem robôs e sem as suas visitas (este navegador está marcado como seu). É o que mostra quem realmente chegou até você."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Etapa
            icone={Users}
            titulo="Pessoas no site"
            valor={s.pessoas}
            atual={s.pessoas}
            antes={s.pessoasAntes}
            explicacao="Pessoas diferentes que abriram o site, vindas de qualquer lugar (Google, Instagram, link direto). A mesma pessoa voltando conta uma vez."
          />
          <Etapa
            icone={MousePointerClick}
            titulo="Páginas abertas"
            valor={s.visitas}
            atual={s.visitas}
            antes={s.visitasAntes}
            explicacao="Total de páginas vistas. Uma pessoa que abre 3 páginas conta 3 aqui."
            taxa={s.pessoas ? `${(s.visitas / s.pessoas).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} páginas por pessoa` : undefined}
          />
          <Etapa
            icone={MessageCircle}
            titulo="Clicou no WhatsApp"
            valor={s.whatsapp + s.agendar}
            atual={s.whatsapp + s.agendar}
            antes={s.cliquesWhatsAntes}
            explicacao={`Cliques que abrem o WhatsApp com a mensagem pronta: botão WhatsApp (${n(s.whatsapp)}) e botão Agendar (${n(s.agendar)}). É o clique, não a mensagem: quem clicou e não enviou também conta. As que chegam começam com "Vim pelo site da Clean Car".`}
            taxa={s.pessoas ? `${pct((s.whatsapp + s.agendar) / s.pessoas)} das pessoas clicaram` : undefined}
          />
          <Etapa
            icone={MessageCircle}
            titulo="Formulários enviados"
            valor={s.formularios}
            atual={s.formularios}
            antes={s.formulariosAntes}
            explicacao="Formulários preenchidos e enviados no site (ex.: cupom de primeira visita)."
          />
        </div>
        {s.legado && (
          <p className="text-xs text-steel-line">
            Neste período ainda há só dados antigos, que contavam também robôs e as suas visitas. A contagem limpa começou em 08/10/2026.
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Cartao titulo="Pessoas no site por dia" sub="Contagem do próprio site">
            <GraficoDiario pontos={s.porDia.map((d) => ({ data: d.data, valor: d.pessoas }))} unidade="pessoas" />
          </Cartao>
          <Cartao titulo="Cliques para o WhatsApp por dia" sub="Botões WhatsApp e Agendar, mais formulários">
            <GraficoDiario pontos={s.porDia.map((d) => ({ data: d.data, valor: d.contatos }))} unidade="contatos" tipo="barras" cor="var(--cera)" />
          </Cartao>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Cartao titulo="De onde as pessoas vieram" sub="O site anota de onde cada visita chegou (Google, Instagram, link direto…) e quantas clicaram no WhatsApp">
            <ListaBarras unidade="visitas" itens={s.origens.map((o) => ({ nome: o.nome, valor: o.visitas, extra: `${n(o.contatos)} contatos` }))} />
          </Cartao>
          <Cartao titulo="Páginas que mais geram contato" sub="Visitas e cliques em WhatsApp/Agendar em cada página">
            {s.paginas.length === 0 ? (
              <p className="text-sm text-steel-line">Sem dados neste período.</p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[320px]">
                  <thead>
                    <tr className="text-left text-steel-line text-[11px] uppercase tracking-wide">
                      <th className="pb-2 px-1 font-bold">Página</th>
                      <th className="pb-2 px-1 font-bold text-right">Visitas</th>
                      <th className="pb-2 px-1 font-bold text-right">Contatos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.paginas.map((p) => (
                      <tr key={p.caminho} className="border-t border-card-line">
                        <td className="py-2 px-1 text-steel break-all">{p.caminho === "/" ? "Página inicial" : p.caminho}</td>
                        <td className="py-2 px-1 text-right tabular-nums text-steel-line">{n(p.visitas)}</td>
                        <td className="py-2 px-1 text-right tabular-nums font-bold text-steel">{n(p.contatos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Cartao>
        </div>

        <Cartao titulo="Últimos cliques para o WhatsApp" sub="Data e hora de cada clique, de onde a pessoa veio e em que página estava: compare com as conversas que começam com “Vim pelo site da Clean Car”">
          {s.recentes.length === 0 ? (
            <p className="text-sm text-steel-line">Nenhum contato neste período.</p>
          ) : (
            <ul className="divide-y divide-card-line">
              {s.recentes.map((e, i) => (
                <li key={i} className="py-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
                  <span className="tabular-nums text-steel-line text-xs w-24 shrink-0">
                    {new Date(e.quando).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}
                  </span>
                  <span className="font-bold text-steel w-20 shrink-0">{e.tipo}</span>
                  <span className="text-steel-line min-w-0 break-all flex-1">{e.caminho === "/" ? "Página inicial" : e.caminho}</span>
                  <span className="text-xs text-steel-line">veio de: {e.origem}</span>
                </li>
              ))}
            </ul>
          )}
        </Cartao>
      </Secao>

      {/* ═════════ 2. GOOGLE ANALYTICS ═════════ */}
      <Secao
        cor="cera"
        titulo="2 · Google Analytics"
        sub="Ferramenta do Google que também conta visitas e cliques do site, com o código do Analytics instalado nas páginas. Chega em algumas horas. Costuma dar um pouco diferente da parte 1: conta de outro jeito, e bloqueadores de anúncio e quem recusa cookies escondem algumas pessoas."
      >
        {!a.ok ? (
          <AvisoConexao r={r} />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Etapa icone={Users} titulo="Pessoas no site" valor={a.pessoas} atual={a.pessoas} antes={a.pessoasAntes}
                explicacao={`Pessoas ativas no site segundo o Analytics. ${n(a.novas)} delas entraram pela primeira vez.`} />
              <Etapa icone={MousePointerClick} titulo="Páginas abertas" valor={a.paginasVistas} atual={a.paginasVistas} antes={0} semVariacao
                explicacao="Páginas vistas segundo o Analytics." />
              <Etapa icone={MessageCircle} titulo="Clicou no WhatsApp" valor={a.cliquesWhats} atual={a.cliquesWhats} antes={0} semVariacao
                explicacao="Cliques nos botões WhatsApp e Agendar que o site também avisa ao Analytics." />
              <Etapa icone={Search} titulo="Vieram da busca do Google" valor={a.pessoasBuscaGoogle} atual={a.pessoasBuscaGoogle} antes={0} semVariacao
                explicacao="Pessoas que chegaram pela pesquisa orgânica do Google (canal Organic Search)." />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Cartao titulo="Pessoas por dia (Analytics)" sub="Contagem do Google Analytics">
                <GraficoDiario pontos={a.porDia.map((d) => ({ data: d.data, valor: d.pessoas }))} unidade="pessoas" cor="var(--cera)" />
              </Cartao>
              <Cartao titulo="De onde vieram (Analytics)" sub="Canais classificados pelo Google">
                <ListaBarras unidade="pessoas" itens={a.canais.map((c) => ({ nome: c.nome, valor: c.pessoas }))} />
              </Cartao>
              <Cartao titulo="Cidades dos visitantes" sub="Cidade aproximada">
                <ListaBarras unidade="pessoas" itens={a.cidades.map((c) => ({ nome: c.nome, valor: c.pessoas }))} />
              </Cartao>
              <Cartao titulo="Aparelho usado" sub="Celular ou computador">
                <ListaBarras unidade="pessoas" itens={a.aparelhos.map((c) => ({ nome: c.nome, valor: c.pessoas }))} />
              </Cartao>
            </div>
          </>
        )}
      </Secao>

      {/* ═════════ 3. SEARCH CONSOLE ═════════ */}
      <Secao
        cor="verniz"
        titulo="3 · Google Search Console"
        sub="Números que o próprio Google manda sobre as pesquisas: quantas vezes o site apareceu e quantas pessoas clicaram no resultado. Chegam com 2 a 3 dias de atraso, então os dias mais recentes ficam vazios ou incompletos. Serve para ver se o site está sendo encontrado."
      >
        {!g.ok && <AvisoConexao r={r} />}
        <div className="grid gap-3 sm:grid-cols-2">
          <Etapa
            icone={Search}
            titulo="Apareceu no Google"
            valor={g.aparicoes}
            atual={g.aparicoes}
            antes={g.aparicoesAntes}
            explicacao="Vezes que o site surgiu na tela de alguém que pesquisou no Google (mesmo sem clicar)."
            nota={notaGoogle}
            semComparacao={g.semComparacao}
            indisponivel={g.ok ? undefined : "Ligue o Search Console para ver."}
            taxa={g.ok && g.posicao ? `posição média ${g.posicao.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}` : undefined}
          />
          <Etapa
            icone={MousePointerClick}
            titulo="Clicou no resultado do Google"
            valor={g.cliques}
            atual={g.cliques}
            antes={g.cliquesAntes}
            explicacao="Só quem clicou no link do site na página de resultados do Google. Não conta Instagram, link direto nem cliques dentro do site. Quem chegou hoje pelo Google aparece aqui em 2 a 3 dias; na parte 1 (site) já aparece na hora."
            nota={notaGoogle}
            semComparacao={g.semComparacao}
            indisponivel={g.ok ? undefined : "Ligue o Search Console para ver."}
            taxa={g.ok && g.aparicoes ? `${pct(g.cliques / g.aparicoes)} de quem viu clicou` : undefined}
          />
        </div>

        {g.ok && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Cartao titulo="Aparições no Google por dia" sub="Os últimos 2 a 3 dias ainda podem estar zerados">
              <GraficoDiario pontos={g.porDia.map((d) => ({ data: d.data, valor: d.aparicoes }))} unidade="aparições" />
            </Cartao>
            <Cartao titulo="Cliques no resultado do Google por dia" sub="Quantas dessas aparições viraram visita">
              <GraficoDiario pontos={g.porDia.map((d) => ({ data: d.data, valor: d.cliques }))} unidade="cliques" tipo="barras" />
            </Cartao>
          </div>
        )}

        {g.ok && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <Cartao titulo="O que pesquisaram para achar você" sub="As buscas em que o site apareceu, das que mais trouxeram cliques">
              <TabelaBuscas buscas={g.buscas.slice(0, 15)} />
            </Cartao>
            <Cartao titulo="Quase na primeira página" sub="Buscas que já mostram o site, mas ainda abaixo dos primeiros. São as mais fáceis de subir.">
              {oportunidades.length === 0 ? (
                <p className="text-sm text-steel-line">Nenhuma oportunidade clara neste período.</p>
              ) : (
                <ul className="grid gap-3">
                  {oportunidades.map((o) => (
                    <li key={o.termo} className="flex gap-3">
                      <Lightbulb size={16} className="text-cera shrink-0 mt-0.5" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-sm text-steel font-bold">{o.termo}</p>
                        <p className="text-xs text-steel-line">
                          Apareceu {n(o.aparicoes)} vezes, na posição {o.posicao.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}. Um artigo ou página falando disso ajuda a subir.
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>
          </div>
        )}

      </Secao>


      {/* ═════════ 4. COMPARAR ═════════ */}
      <Secao
        cor="neutro"
        titulo="4 · Comparar as três fontes"
        sub="O mesmo assunto contado por cada ferramenta, lado a lado. Diferenças pequenas são normais (cada uma conta de um jeito); diferença grande indica algo para investigar."
      >
        <Comparacao r={r} />
      </Secao>

      <p className="text-xs text-steel-line">
        Os números do Google são atualizados a cada 30 minutos; os do próprio site, a cada vez que você abre esta página.
      </p>
    </div>
  );
}
