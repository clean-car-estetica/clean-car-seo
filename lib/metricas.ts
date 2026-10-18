import { supabaseAdmin } from "@/lib/supabase-admin";
import { consultarAnalytics, consultarSearchConsole, googleConfigurado } from "@/lib/google";

// Junta as três fontes do painel de Resultados:
//   Google (Search Console): quantas vezes o site apareceu e foi clicado na busca
//   Analytics (GA4): quantas pessoas visitaram, de onde e em qual aparelho
//   Site (tabela events): quem clicou em WhatsApp/Agendar, já sem robôs e sem o dono
// Cada fonte falha sozinha: se o Google não estiver ligado, o resto aparece.

export type Periodo = { inicio: Date; fim: Date; dias: number; chave: string };

// 18/10/2026: as datas do painel são dias de São Paulo. O servidor da
// Vercel roda em UTC, e antes "hoje" virava amanhã depois das 21h, e um
// clique feito às 22h caía no dia seguinte. Um Date aqui é sempre a
// meia-noite UTC do dia de São Paulo (o Brasil não tem horário de verão).
const FUSO = "-03:00";
const iso = (d: Date) => d.toISOString().slice(0, 10);
/** "2026-10-18T01:30:00Z" (22h30 do dia 17 em SP) → "2026-10-17" */
const diaSP = (instante: string) => new Date(Date.parse(instante) - 3 * 3_600_000).toISOString().slice(0, 10);
function deslocar(d: Date, dias: number) {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + dias);
  return x;
}
function hojeSP(): Date {
  return new Date(diaSP(new Date().toISOString()) + "T00:00:00Z");
}
/** Os números do Search Console chegam 2 a 3 dias depois: até aqui estão completos. */
const ATRASO_GOOGLE_DIAS = 3;
function listaDias(inicio: Date, fim: Date) {
  const out: string[] = [];
  for (let d = new Date(inicio); d <= fim; d = deslocar(d, 1)) out.push(iso(d));
  return out;
}

export function calcularPeriodo(chave: string, inicioParam?: string, fimParam?: string): Periodo {
  const hoje = hojeSP();
  let inicio: Date;
  let fim = new Date(hoje);
  switch (chave) {
    case "1d":
      inicio = new Date(hoje);
      break;
    case "7d":
      inicio = deslocar(hoje, -6);
      break;
    case "90d":
      inicio = deslocar(hoje, -89);
      break;
    case "mes":
      inicio = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1));
      break;
    case "personalizado":
      inicio = inicioParam ? new Date(inicioParam + "T00:00:00Z") : deslocar(hoje, -29);
      if (fimParam) fim = new Date(fimParam + "T00:00:00Z");
      if (isNaN(inicio.getTime())) inicio = deslocar(hoje, -29);
      if (isNaN(fim.getTime()) || fim > hoje) fim = new Date(hoje);
      if (inicio > fim) [inicio, fim] = [fim, inicio];
      break;
    default:
      chave = "30d";
      inicio = deslocar(hoje, -29);
  }
  const dias = Math.round((fim.getTime() - inicio.getTime()) / 86_400_000) + 1;
  return { inicio, fim, dias, chave };
}

export type Busca = { termo: string; cliques: number; aparicoes: number; posicao: number };

export type Resultados = {
  periodo: { inicio: string; fim: string; dias: number };
  google: {
    ok: boolean;
    erro?: string;
    aparicoes: number;
    cliques: number;
    posicao: number;
    aparicoesAntes: number;
    cliquesAntes: number;
    /** Último dia com números completos do Google (os totais vão até aqui). */
    completoAte: string;
    /** O período pedido termina depois de completoAte. */
    parcial: boolean;
    /** Período todo dentro dos dias que o Google ainda está contando: sem comparação. */
    semComparacao: boolean;
    porDia: { data: string; aparicoes: number; cliques: number }[];
    buscas: Busca[];
    paginas: { pagina: string; cliques: number; aparicoes: number }[];
  };
  analytics: {
    ok: boolean;
    erro?: string;
    pessoas: number;
    pessoasAntes: number;
    novas: number;
    /** Páginas vistas (screenPageViews) */
    paginasVistas: number;
    /** Eventos click_whatsapp + click_agendar enviados pelo site ao GA4 */
    cliquesWhats: number;
    formularios: number;
    /** Pessoas do canal "Organic Search" */
    pessoasBuscaGoogle: number;
    porDia: { data: string; pessoas: number }[];
    canais: { nome: string; pessoas: number }[];
    aparelhos: { nome: string; pessoas: number }[];
    cidades: { nome: string; pessoas: number }[];
  };
  site: {
    ok: boolean;
    erro?: string;
    legado: boolean;
    pessoas: number;
    visitas: number;
    contatos: number;
    contatosAntes: number;
    /** Pessoas no período anterior, mesma contagem (18/10/2026: antes não existia e o card dizia sempre "novo"). */
    pessoasAntes: number;
    visitasAntes: number;
    /** Botões WhatsApp + Agendar no período anterior */
    cliquesWhatsAntes: number;
    formulariosAntes: number;
    whatsapp: number;
    agendar: number;
    formularios: number;
    /** Pessoas cuja visita veio do Google (referrer google) */
    pessoasGoogle: number;
    porDia: { data: string; contatos: number; pessoas: number; pessoasGoogle: number }[];
    paginas: { caminho: string; visitas: number; contatos: number }[];
    origens: { nome: string; visitas: number; contatos: number }[];
    recentes: { quando: string; tipo: string; caminho: string; origem: string }[];
  };
  conexao: ReturnType<typeof googleConfigurado>;
};

const CANAIS: Record<string, string> = {
  "Organic Search": "Busca no Google",
  Direct: "Direto (link salvo ou digitado)",
  "Organic Social": "Redes sociais",
  Referral: "Outros sites",
  "Organic Maps": "Google Maps",
  "Paid Search": "Anúncio no Google",
  "Paid Social": "Anúncio em rede social",
  Email: "E-mail",
  "Organic Video": "Vídeos",
  Unassigned: "Não identificado",
};
const APARELHOS: Record<string, string> = { mobile: "Celular", desktop: "Computador", tablet: "Tablet" };

type Evento = {
  event_type: string;
  page_path: string;
  origem: string | null;
  created_at: string;
  meta: { v?: number; vid?: string } | null;
};

async function lerEventos(inicio: Date, fim: Date): Promise<Evento[]> {
  const todos: Evento[] = [];
  for (let de = 0; de < 30_000; de += 1000) {
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("event_type, page_path, origem, created_at, meta")
      .gte("created_at", `${iso(inicio)}T00:00:00${FUSO}`)
      .lte("created_at", `${iso(fim)}T23:59:59.999${FUSO}`)
      .order("created_at", { ascending: false })
      .range(de, de + 999);
    if (error) throw error;
    todos.push(...((data ?? []) as Evento[]));
    if (!data || data.length < 1000) break;
  }
  return todos;
}

const ehContato = (t: string) => t === "click_whatsapp" || t === "click_agendar" || t === "form_submit";

// modo: o período anterior usa a MESMA forma de contar do atual — antes,
// com o período atual na contagem limpa (v2) e o anterior só com dados
// antigos (que contavam robôs e o dono), a comparação era injusta.
function resumirSite(eventos: Evento[], dias: string[], modo?: "legado" | "novo") {
  const novos = eventos.filter((e) => e.meta?.v === 2);
  const legado = modo ? modo === "legado" : novos.length === 0 && eventos.length > 0;
  const base = legado ? eventos : novos;

  const pessoasSet = new Set<string>();
  const googleSet = new Set<string>();
  const porDia = new Map(dias.map((d) => [d, { contatos: 0, pessoas: new Set<string>(), google: new Set<string>() }]));
  const paginas = new Map<string, { visitas: number; contatos: number }>();
  const origens = new Map<string, { visitas: number; contatos: number }>();
  let visitas = 0, whatsapp = 0, agendar = 0, formularios = 0;

  for (const e of base) {
    const dia = diaSP(e.created_at);
    const vid = e.meta?.vid;
    const contato = ehContato(e.event_type);
    const doGoogle = (e.origem || "").startsWith("Google");
    if (vid) pessoasSet.add(vid);
    if (vid && doGoogle) googleSet.add(vid);
    const pd = porDia.get(dia);
    if (pd) {
      if (contato) pd.contatos++;
      if (vid) pd.pessoas.add(vid);
      if (vid && doGoogle) pd.google.add(vid);
    }
    if (e.event_type === "pageview") visitas++;
    if (e.event_type === "click_whatsapp") whatsapp++;
    if (e.event_type === "click_agendar") agendar++;
    if (e.event_type === "form_submit") formularios++;

    const p = paginas.get(e.page_path) ?? { visitas: 0, contatos: 0 };
    if (e.event_type === "pageview") p.visitas++;
    if (contato) p.contatos++;
    paginas.set(e.page_path, p);

    const nomeOrigem = e.origem || "Desconhecida";
    const o = origens.get(nomeOrigem) ?? { visitas: 0, contatos: 0 };
    if (e.event_type === "pageview") o.visitas++;
    if (contato) o.contatos++;
    origens.set(nomeOrigem, o);
  }

  const nomesTipo: Record<string, string> = {
    click_whatsapp: "WhatsApp",
    click_agendar: "Agendar",
    form_submit: "Formulário",
    pageview: "Visita",
  };

  return {
    legado,
    pessoas: pessoasSet.size,
    visitas,
    contatos: whatsapp + agendar + formularios,
    whatsapp,
    agendar,
    formularios,
    pessoasGoogle: googleSet.size,
    porDia: [...porDia.entries()].map(([data, v]) => ({ data, contatos: v.contatos, pessoas: v.pessoas.size, pessoasGoogle: v.google.size })),
    paginas: [...paginas.entries()]
      .map(([caminho, v]) => ({ caminho, ...v }))
      .sort((a, b) => b.contatos - a.contatos || b.visitas - a.visitas)
      .slice(0, 12),
    origens: [...origens.entries()]
      .map(([nome, v]) => ({ nome, ...v }))
      .filter((o) => o.nome !== "Navegação interna")
      .sort((a, b) => b.visitas - a.visitas)
      .slice(0, 8),
    recentes: base
      .filter((e) => ehContato(e.event_type))
      .slice(0, 15)
      .map((e) => ({ quando: e.created_at, tipo: nomesTipo[e.event_type] ?? e.event_type, caminho: e.page_path, origem: e.origem || "—" })),
  };
}

export async function carregarResultados(p: Periodo): Promise<Resultados> {
  const conexao = googleConfigurado();
  const inicio = iso(p.inicio);
  const fim = iso(p.fim);
  const antesFim = deslocar(p.inicio, -1);
  const antesInicio = deslocar(antesFim, -(p.dias - 1));
  const dias = listaDias(p.inicio, p.fim);

  const vazioGoogle: Resultados["google"] = {
    ok: false, aparicoes: 0, cliques: 0, posicao: 0, aparicoesAntes: 0, cliquesAntes: 0, completoAte: "", parcial: false, semComparacao: false, porDia: [], buscas: [], paginas: [],
  };
  const vazioGA: Resultados["analytics"] = {
    ok: false, pessoas: 0, pessoasAntes: 0, novas: 0, paginasVistas: 0, cliquesWhats: 0, formularios: 0, pessoasBuscaGoogle: 0, porDia: [], canais: [], aparelhos: [], cidades: [],
  };

  const [google, analytics, site] = await Promise.all([
    // ---- Search Console
    (async (): Promise<Resultados["google"]> => {
      if (!conexao.conta) return { ...vazioGoogle, erro: "nao-configurado" };
      try {
        // 18/10/2026: o Google entrega os números com 2 a 3 dias de atraso.
        // Antes o painel comparava um período com os últimos dias ainda
        // vazios contra um período completo (dava "0 cliques, -100%"). Agora
        // os totais e a comparação vão só até o último dia completo, e os dois
        // períodos têm o mesmo tamanho.
        const ultimoCompleto = deslocar(hojeSP(), -ATRASO_GOOGLE_DIAS);
        const fimG = p.fim < ultimoCompleto ? p.fim : ultimoCompleto;
        const semComparacao = fimG < p.inicio;
        const diasG = semComparacao ? 0 : Math.round((fimG.getTime() - p.inicio.getTime()) / 86_400_000) + 1;
        const antesFimG = deslocar(p.inicio, -1);
        const antesInicioG = deslocar(antesFimG, -(Math.max(diasG, 1) - 1));
        const [total, antes, porDia, buscas, paginas] = await Promise.all([
          consultarSearchConsole({ inicio, fim: semComparacao ? fim : iso(fimG) }),
          semComparacao ? Promise.resolve([]) : consultarSearchConsole({ inicio: iso(antesInicioG), fim: iso(antesFimG) }),
          consultarSearchConsole({ inicio, fim, dimensoes: ["date"] }),
          consultarSearchConsole({ inicio, fim, dimensoes: ["query"], limite: 250 }),
          consultarSearchConsole({ inicio, fim, dimensoes: ["page"], limite: 50 }),
        ]);
        const mapaDia = new Map(porDia.map((r) => [r.keys[0], r]));
        const host = /^https?:\/\/[^/]+/;
        return {
          ok: true,
          aparicoes: total[0]?.impressions ?? 0,
          cliques: total[0]?.clicks ?? 0,
          posicao: total[0]?.position ?? 0,
          aparicoesAntes: antes[0]?.impressions ?? 0,
          cliquesAntes: antes[0]?.clicks ?? 0,
          completoAte: iso(ultimoCompleto),
          parcial: p.fim > ultimoCompleto,
          semComparacao,
          porDia: dias.map((d) => ({ data: d, aparicoes: mapaDia.get(d)?.impressions ?? 0, cliques: mapaDia.get(d)?.clicks ?? 0 })),
          buscas: buscas.map((r) => ({ termo: r.keys[0], cliques: r.clicks, aparicoes: r.impressions, posicao: r.position })),
          paginas: paginas.map((r) => ({ pagina: r.keys[0].replace(host, "") || "/", cliques: r.clicks, aparicoes: r.impressions })),
        };
      } catch (e) {
        return { ...vazioGoogle, erro: (e as Error).message };
      }
    })(),
    // ---- Analytics
    (async (): Promise<Resultados["analytics"]> => {
      if (!conexao.conta || !conexao.ga4) return { ...vazioGA, erro: "nao-configurado" };
      try {
        const [total, antes, porDia, canais, aparelhos, cidades, eventos] = await Promise.all([
          consultarAnalytics({ inicio, fim, metricas: ["activeUsers", "newUsers", "screenPageViews"] }),
          consultarAnalytics({ inicio: iso(antesInicio), fim: iso(antesFim), metricas: ["activeUsers"] }),
          consultarAnalytics({ inicio, fim, dimensoes: ["date"], metricas: ["activeUsers"] }),
          consultarAnalytics({ inicio, fim, dimensoes: ["sessionDefaultChannelGroup"], metricas: ["activeUsers"] }),
          consultarAnalytics({ inicio, fim, dimensoes: ["deviceCategory"], metricas: ["activeUsers"] }),
          consultarAnalytics({ inicio, fim, dimensoes: ["city"], metricas: ["activeUsers"], limite: 10 }),
          consultarAnalytics({ inicio, fim, dimensoes: ["eventName"], metricas: ["eventCount"], filtroEvento: ["click_whatsapp", "click_agendar", "form_submit"] }).catch(() => []),
        ]);
        const contaEvento = (...nomes: string[]) => eventos.filter((r) => nomes.includes(r.dims[0])).reduce((t, r) => t + (r.vals[0] ?? 0), 0);
        const mapaDia = new Map(porDia.map((r) => [`${r.dims[0].slice(0, 4)}-${r.dims[0].slice(4, 6)}-${r.dims[0].slice(6, 8)}`, r.vals[0]]));
        return {
          ok: true,
          pessoas: total[0]?.vals[0] ?? 0,
          novas: total[0]?.vals[1] ?? 0,
          paginasVistas: total[0]?.vals[2] ?? 0,
          cliquesWhats: contaEvento("click_whatsapp", "click_agendar"),
          formularios: contaEvento("form_submit"),
          pessoasBuscaGoogle: canais.filter((r) => r.dims[0] === "Organic Search").reduce((t, r) => t + (r.vals[0] ?? 0), 0),
          pessoasAntes: antes[0]?.vals[0] ?? 0,
          porDia: dias.map((d) => ({ data: d, pessoas: mapaDia.get(d) ?? 0 })),
          canais: canais.map((r) => ({ nome: CANAIS[r.dims[0]] ?? r.dims[0], pessoas: r.vals[0] })).sort((a, b) => b.pessoas - a.pessoas),
          aparelhos: aparelhos.map((r) => ({ nome: APARELHOS[r.dims[0]] ?? r.dims[0], pessoas: r.vals[0] })).sort((a, b) => b.pessoas - a.pessoas),
          cidades: cidades
            .map((r) => ({ nome: r.dims[0] === "(not set)" ? "Não identificada" : r.dims[0], pessoas: r.vals[0] }))
            .sort((a, b) => b.pessoas - a.pessoas),
        };
      } catch (e) {
        return { ...vazioGA, erro: (e as Error).message };
      }
    })(),
    // ---- Site
    (async (): Promise<Resultados["site"]> => {
      try {
        const [atual, anterior] = await Promise.all([lerEventos(p.inicio, p.fim), lerEventos(antesInicio, antesFim)]);
        const r = resumirSite(atual, dias);
        const a = resumirSite(anterior, listaDias(antesInicio, antesFim), r.legado ? "legado" : "novo");
        return { ok: true, ...r, contatosAntes: a.contatos, pessoasAntes: a.pessoas, visitasAntes: a.visitas, cliquesWhatsAntes: a.whatsapp + a.agendar, formulariosAntes: a.formularios };
      } catch (e) {
        return {
          ok: false, erro: (e as Error).message, legado: false, pessoas: 0, pessoasAntes: 0, visitasAntes: 0, cliquesWhatsAntes: 0, formulariosAntes: 0, visitas: 0, contatos: 0, contatosAntes: 0,
          whatsapp: 0, agendar: 0, formularios: 0, pessoasGoogle: 0, porDia: [], paginas: [], origens: [], recentes: [],
        };
      }
    })(),
  ]);

  return { periodo: { inicio, fim, dias: p.dias }, google, analytics, site, conexao };
}
