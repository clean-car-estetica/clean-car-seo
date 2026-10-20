import AvisoCampanha from "@/components/admin/AvisoCampanha";
import { getCampanhas } from "@/lib/campanhas-servidor";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Lightbulb, Minus, Plug, CircleCheck, CircleAlert, CircleDashed } from "lucide-react";
import { calcularPeriodo, carregarResultados, type Busca, type Resultados, type NumerosCanal } from "@/lib/metricas";
import GraficoSerie from "@/components/admin/GraficoSerie";
import { CANAIS_ORDEM, NOME_CANAL, type Canal } from "@/lib/canais";
import { horaAgoraSP, serieDiaria, serieHoraria, seriePorDiaSemana, type Ponto } from "@/lib/series";
import { preverDias, preverHoras, somar, type Previsao } from "@/lib/previsao";
import type { Visitante } from "@/lib/metricas";

// 20/10/2026: painel reorganizado em abas. Antes era uma página só, com a
// visão "por origem" cheia de selos e as quatro partes recolhidas embaixo, e
// ficava difícil achar as coisas. Agora:
//   Visão geral  → os números que importam, com gráfico e comparação
//   Por origem   → Google, Instagram, direto... lado a lado
//   Google       → Search Console: aparições, cliques, posição, buscas
//   Analytics    → o que o Google Analytics contou
//   Site         → contagem do próprio site: horários, páginas, últimos cliques
//   Visitantes   → quem entrou e quem clicou, um por um
//   Comparar     → as três fontes lado a lado e de onde vem cada número
// Todos os gráficos seguem o período escolhido: Hoje vira por hora, 90 dias vira por semana.
// Tudo aparece em gráfico; os números escritos (tabelas, listas) ficam no "Ver mais".

const n = (v: number) => Math.round(v).toLocaleString("pt-BR");
const dec = (v: number) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const pctTxt = (x: number, y: number) => (y ? `${dec((x / y) * 100)}%` : "—");
const dataBR = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const deslocarIso = (d: string, dias: number) => new Date(Date.parse(d + "T00:00:00Z") + dias * 86_400_000).toISOString().slice(0, 10);
const hojeIsoSP = () => new Date(Date.now() - 3 * 3_600_000).toISOString().slice(0, 10);

const ABAS = [
  { valor: "geral", label: "Visão geral" },
  { valor: "origem", label: "Por origem" },
  { valor: "google", label: "Google (pesquisa)" },
  { valor: "analytics", label: "Analytics" },
  { valor: "site", label: "Site" },
  { valor: "visitantes", label: "Visitantes" },
  { valor: "comparar", label: "Comparar fontes" },
] as const;
type Aba = (typeof ABAS)[number]["valor"];

const PERIODOS = [
  { valor: "1d", label: "Hoje" },
  { valor: "7d", label: "7 dias" },
  { valor: "30d", label: "30 dias" },
  { valor: "90d", label: "90 dias" },
  { valor: "mes", label: "Este mês" },
];

// ───────────────────────────────────────────────────────── peças

function Variacao({ atual, antes, menorMelhor, semComparacao, curta, fmtAntes = n }: { atual: number; antes: number | undefined; menorMelhor?: boolean; semComparacao?: string; curta?: boolean; fmtAntes?: (v: number) => string }) {
  if (semComparacao) return <span className="text-[11px] text-steel-line">{semComparacao}</span>;
  if (antes === undefined || (!antes && !atual)) return <span className="text-[11px] text-steel-line">sem dados antes</span>;
  if (!antes) return <span className="text-[11px] text-verniz-shine font-bold">novo</span>;
  const d = (atual - antes) / antes;
  const igual = Math.abs(d) < 0.02;
  const bom = menorMelhor ? d < 0 : d > 0;
  const Icone = igual ? Minus : d > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${igual ? "text-steel-line" : bom ? "text-ok" : "text-warn"}`}>
      <Icone size={14} aria-hidden />
      {igual ? "igual" : `${d > 0 ? "+" : "−"}${Math.abs(Math.round(d * 100))}%`}
      {!curta && <span className="font-normal text-steel-line ml-1">vs. anterior ({fmtAntes(antes)})</span>}
    </span>
  );
}

/** Linha fininha dentro do cartão do número: só a forma, sem eixos. */
function Mini({ pontos, cor = "var(--verniz)", inverter }: { pontos: Ponto[]; cor?: string; inverter?: boolean }) {
  const vals = pontos.map((p) => p.valor);
  const validos = vals.filter((v): v is number => v !== null);
  if (validos.length < 2 || Math.max(...validos) === 0) return <div className="h-9" />;
  const L = 120, A = 36;
  const max = Math.max(...validos), min = inverter ? Math.min(...validos) : 0;
  const y = (v: number) => (inverter ? 3 + ((v - min) / Math.max(1e-9, max - min)) * (A - 6) : A - 3 - ((v - min) / Math.max(1e-9, max - min)) * (A - 6));
  const x = (i: number) => (i * L) / (vals.length - 1);
  let d = "", caneta = false;
  vals.forEach((v, i) => {
    if (v === null) { caneta = false; return; }
    d += `${caneta ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
    caneta = true;
  });
  return (
    <svg viewBox={`0 0 ${L} ${A}`} preserveAspectRatio="none" className="w-full h-9 block" aria-hidden>
      <path d={d} fill="none" stroke={cor} strokeWidth="1.75" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

const FONTES = {
  site: { nome: "Site", cor: "text-ok" },
  analytics: { nome: "Analytics", cor: "text-cera" },
  console: { nome: "Search Console", cor: "text-verniz-shine" },
  meta: { nome: "Instagram", cor: "text-[#e1306c]" },
} as const;
type Fonte = keyof typeof FONTES;

function Numero({
  titulo, valor, atual, antes, fonte, ajuda, serie, menorMelhor, semComparacao, cor, fmtAntes,
}: {
  titulo: string; valor: string; atual: number; antes?: number; fonte: Fonte; ajuda?: string; serie?: Ponto[]; menorMelhor?: boolean; semComparacao?: string; cor?: string; fmtAntes?: (v: number) => string;
}) {
  return (
    <div className="bg-card border border-card-line rounded-2xl p-4 flex flex-col gap-1.5 min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-[11px] font-bold uppercase tracking-wide text-steel-line leading-tight">{titulo}</span>
        <span className={`text-[10px] font-bold ${FONTES[fonte].cor}`}>{FONTES[fonte].nome}</span>
      </div>
      <div className="font-display font-extrabold text-3xl text-steel tabular-nums leading-none">{valor}</div>
      <Variacao atual={atual} antes={antes} menorMelhor={menorMelhor} semComparacao={semComparacao} fmtAntes={fmtAntes} />
      {serie && <Mini pontos={serie} cor={cor} inverter={menorMelhor} />}
      {ajuda && <p className="text-[11px] text-steel-line leading-snug">{ajuda}</p>}
    </div>
  );
}

function Cartao({ titulo, sub, children, className = "" }: { titulo: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`bg-card border border-card-line rounded-2xl p-5 md:p-6 min-w-0 ${className}`}>
      <h2 className="font-display font-bold text-lg text-steel">{titulo}</h2>
      {sub ? <p className="text-xs text-steel-line mt-0.5 mb-4">{sub}</p> : <div className="mb-4" />}
      {children}
    </section>
  );
}

/** Os números escritos ficam aqui dentro: o painel mostra o gráfico, e quem quiser o detalhe abre. */
function VerMais({ children, rotulo = "Ver mais" }: { children: React.ReactNode; rotulo?: string }) {
  return (
    <details className="group mt-4 border-t border-card-line pt-3">
      <summary className="cursor-pointer list-none inline-flex items-center gap-1.5 rounded-full border border-card-line px-3 py-1 text-xs font-bold text-verniz-shine hover:bg-verniz/10">
        <span className="group-open:hidden">{rotulo} ↓</span>
        <span className="hidden group-open:inline">Fechar ↑</span>
      </summary>
      <div className="mt-3">{children}</div>
    </details>
  );
}

/** Várias medidas por linha, cada uma com sua cor (mesma escala na linha toda). */
function BarrasGrupo({ linhas, series }: { linhas: { nome: string; valores: (number | null)[]; nota?: string }[]; series: { nome: string; cor: string }[] }) {
  const max = Math.max(1, ...linhas.flatMap((l) => l.valores.map((v) => v ?? 0)));
  if (linhas.length === 0) return <p className="text-sm text-steel-line">Sem dados neste período.</p>;
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-3 text-[11px] text-steel-line">
        {series.map((x) => (
          <span key={x.nome} className="flex items-center gap-1.5"><i className="inline-block w-3 h-2 rounded-sm" style={{ background: x.cor }} />{x.nome}</span>
        ))}
      </div>
      <ul className="grid gap-3">
        {linhas.map((l) => (
          <li key={l.nome} className="grid gap-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-steel truncate">{l.nome}</span>
              {l.nota && <span className="text-[11px] text-steel-line shrink-0">{l.nota}</span>}
            </div>
            {l.valores.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-carbon overflow-hidden">
                  {v !== null && <div className="h-full rounded-full" style={{ width: `${v ? Math.max(1.5, (v / max) * 100) : 0}%`, background: series[i].cor }} />}
                </div>
                <span className="w-14 text-right text-xs tabular-nums text-steel">{v === null ? "—" : n(v)}</span>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Indicador em %: barra de 0 a 100 com o valor, para ler de relance. */
function Medidor({ nome, valor, ajuda, menorMelhor, cor = "var(--verniz)" }: { nome: string; valor: number | null; ajuda: string; menorMelhor?: boolean; cor?: string }) {
  return (
    <div className="rounded-xl bg-carbon/60 p-3 grid gap-1.5 content-start">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] text-steel-line">{nome}</span>
        <b className="font-display text-xl text-steel tabular-nums">{valor === null ? "—" : `${dec(valor * 100)}%`}</b>
      </div>
      <div className="h-2 rounded-full bg-card overflow-hidden" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={valor === null ? undefined : Math.round(valor * 100)} aria-label={nome}>
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(valor ? 1.5 : 0, (valor ?? 0) * 100))}%`, background: cor }} />
      </div>
      <span className="text-[10px] text-steel-line leading-snug">{ajuda}{menorMelhor ? " · menor é melhor" : ""}</span>
    </div>
  );
}

function ListaBarras({ itens, unidade, cor = "bg-verniz" }: { itens: { nome: string; valor: number; extra?: string }[]; unidade: string; cor?: string }) {
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
            <div className={`h-full rounded-full ${cor}`} style={{ width: `${Math.max(2, (i.valor / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Funil do período: do Google até o contato, com a taxa de uma etapa para a outra. */
function Funil({ etapas }: { etapas: { nome: string; valor: number; fonte: Fonte; indisponivel?: boolean }[] }) {
  const visiveis = etapas.filter((e) => !e.indisponivel);
  const max = Math.max(1, ...visiveis.map((e) => e.valor));
  return (
    <ol className="grid gap-3">
      {visiveis.map((e, i) => {
        const ant = visiveis[i - 1];
        return (
          <li key={e.nome} className="grid gap-1">
            {ant && (
              <span className="text-[11px] text-steel-line pl-1">↓ {e.valor <= ant.valor ? `${pctTxt(e.valor, ant.valor)} seguiram` : "outra contagem"}</span>
            )}
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-steel">{e.nome} <span className={`text-[10px] font-bold ${FONTES[e.fonte].cor}`}>{FONTES[e.fonte].nome}</span></span>
              <b className="font-display text-xl text-steel tabular-nums">{n(e.valor)}</b>
            </div>
            <div className="h-3 rounded-md bg-carbon overflow-hidden">
              <div className="h-full rounded-md bg-verniz" style={{ width: `${Math.max(1.5, (e.valor / max) * 100)}%`, opacity: 1 - i * 0.12 }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Posicao({ p }: { p: number }) {
  const [rotulo, classe] =
    p <= 3 ? ["Topo", "bg-ok/15 text-ok"] : p <= 10 ? ["1ª página", "bg-verniz/15 text-verniz-shine"] : p <= 20 ? ["2ª página", "bg-cera/15 text-cera"] : ["Longe", "bg-carbon text-steel-line"];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className="tabular-nums text-steel">{dec(p)}</span>
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

// ───────────────────────────────────────────────────────── ligação das fontes

/** Uma linha no topo: cada fonte ligada ou não, e por quê. */
function StatusFontes({ r }: { r: Resultados }) {
  const ig = r.meta.instagram;
  const itens: { fonte: Fonte; ok: boolean | null; texto: string }[] = [
    { fonte: "site", ok: r.site.ok, texto: r.site.ok ? "ligado" : "erro" },
    { fonte: "analytics", ok: r.analytics.ok, texto: r.analytics.ok ? "ligado" : r.conexao.conta ? "com problema" : "não ligado" },
    { fonte: "console", ok: r.google.ok, texto: r.google.ok ? "ligado" : r.conexao.conta ? "com problema" : "não ligado" },
    { fonte: "meta", ok: ig ? ig.ok : null, texto: ig?.ok ? "ligado" : ig ? "com problema" : "integração do SAS desligada" },
  ];
  return (
    <div className="flex flex-wrap gap-2" aria-label="Fontes de dados">
      {itens.map((i) => {
        const Icone = i.ok ? CircleCheck : i.ok === null ? CircleDashed : CircleAlert;
        return (
          <span key={i.fonte} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs ${i.ok ? "border-card-line text-steel-line" : "border-cera/50 text-cera"}`}>
            <Icone size={14} className={i.ok ? "text-ok" : ""} aria-hidden />
            <b className={i.ok ? FONTES[i.fonte].cor : ""}>{FONTES[i.fonte].nome}</b> {i.texto}
          </span>
        );
      })}
    </div>
  );
}

function AvisoConexao({ r }: { r: Resultados }) {
  if (r.google.ok && r.analytics.ok) return null;
  const email = r.conexao.email;
  const passos = [
    { ok: r.conexao.conta, texto: "Chave do Google na Vercel (GOOGLE_CLIENT_EMAIL e GOOGLE_PRIVATE_KEY)" },
    { ok: r.google.ok, texto: "Search Console: o e-mail da conta adicionado como usuário (Configurações → Usuários e permissões)", erro: r.google.erro },
    { ok: r.analytics.ok, texto: "Analytics: o e-mail da conta adicionado como Leitor (Administrador → Gerenciamento de acesso à propriedade)", erro: r.analytics.erro },
  ];
  return (
    <div className="bg-card border border-cera/40 rounded-2xl p-5 flex gap-4">
      <Plug className="text-cera shrink-0 mt-0.5" size={20} aria-hidden />
      <div className="min-w-0 grid gap-2">
        <h2 className="font-display font-bold text-steel">Ligação com o Google incompleta</h2>
        <p className="text-sm text-steel-line">Os números do próprio site já funcionam. Os do Google entram sozinhos assim que os itens abaixo estiverem prontos.</p>
        <ul className="grid gap-2 text-sm">
          {passos.map((p) => (
            <li key={p.texto} className={p.ok ? "text-ok" : "text-steel-line"}>
              {p.ok ? "✓" : "○"} {p.texto}
              {!p.ok && p.erro && p.erro !== "nao-configurado" && (
                <span className="block text-xs text-warn mt-0.5 break-words pl-4">Resposta do Google: {p.erro}</span>
              )}
            </li>
          ))}
        </ul>
        {!r.analytics.ok && r.conexao.conta && (
          <p className="text-xs text-steel-line">
            O número da propriedade do Analytics é achado sozinho pela conta. Se preferir fixar, coloque na Vercel <code className="text-steel">GA4_PROPERTY_ID</code> com o número que aparece em Analytics → Administrador → Detalhes da propriedade (só números, não o código G-…).
            {r.conexao.ga4Origem === "variavel-invalida" && <b className="text-cera"> Hoje GA4_PROPERTY_ID está com um valor que não é número: corrija ou apague.</b>}
          </p>
        )}
        {email && <p className="text-xs text-steel-line break-all">E-mail da conta: <code className="text-steel">{email}</code></p>}
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────── página

export default async function Resultados({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; inicio?: string; fim?: string; aba?: string; quem?: string }>;
}) {
  const sp = await searchParams;
  const periodo = calcularPeriodo(sp.periodo || "30d", sp.inicio, sp.fim);
  const aba: Aba = (ABAS.find((a) => a.valor === sp.aba)?.valor ?? "geral") as Aba;
  const [r, campanhas] = await Promise.all([carregarResultados(periodo), getCampanhas()]);
  const { google: g, analytics: a, site: s } = r;

  const umDia = r.periodo.dias === 1;
  const ateHora = umDia && r.periodo.fim === hojeIsoSP() ? horaAgoraSP() : undefined;
  const nomeAntes = umDia ? "dia anterior" : `${r.periodo.dias} dias anteriores`;
  const porQue = umDia ? "por hora" : r.periodo.dias > 45 ? "por semana" : "por dia";

  // séries do site (Hoje = por hora)
  const doSite = (campo: "pessoas" | "chamaram" | "contatos" | "paginas") =>
    umDia
      ? serieHoraria(s.porHora.map((h) => h[campo]), s.porHoraAntes.map((h) => h[campo]), ateHora)
      : serieDiaria(s.porDia.map((d) => ({ data: d.data, valor: d[campo] })), s.porDiaAntes.map((d) => ({ data: d.data, valor: d[campo] })));
  const sPessoas = doSite("pessoas");
  const sChamaram = doSite("chamaram");
  const sContatos = doSite("contatos");
  const sPaginas = doSite("paginas");
  const sConversao: Ponto[] = sPessoas.map((p, i) => ({
    ...p,
    valor: p.valor === null ? null : p.valor ? ((sChamaram[i].valor ?? 0) / p.valor) * 100 : 0,
    antes: undefined,
  }));
  const aPessoas = umDia
    ? serieHoraria(a.porHora, a.porHoraAntes, ateHora)
    : serieDiaria(a.porDia.map((d) => ({ data: d.data, valor: d.pessoas })), a.porDiaAntes.map((d) => ({ data: d.data, valor: d.pessoas })));
  const completo = g.ok && g.parcial ? g.completoAte : undefined;
  const gAparicoes = serieDiaria(g.porDia.map((d) => ({ data: d.data, valor: d.aparicoes })), g.porDiaAntes.map((d) => ({ data: d.data, valor: d.aparicoes })), completo);
  const gCliques = serieDiaria(g.porDia.map((d) => ({ data: d.data, valor: d.cliques })), g.porDiaAntes.map((d) => ({ data: d.data, valor: d.cliques })), completo);
  const gPosicao: Ponto[] = (g.porDia.length > 45 ? [] : g.porDia).map((d) => ({ rotulo: dataBR(d.data), dica: dataBR(d.data), valor: d.posicao || null, parcial: Boolean(completo && d.data > completo) }));

  // totais por canal (site e Analytics)
  const vazio: NumerosCanal = { pessoas: 0, paginas: 0, whatsapp: 0, agendar: 0, formularios: 0, pessoasContato: 0 };
  const soma = (m: Partial<Record<Canal, NumerosCanal>>) => Object.values(m).reduce<NumerosCanal>((t, c) => ({
    pessoas: t.pessoas + (c?.pessoas ?? 0), paginas: t.paginas + (c?.paginas ?? 0), whatsapp: t.whatsapp + (c?.whatsapp ?? 0),
    agendar: t.agendar + (c?.agendar ?? 0), formularios: t.formularios + (c?.formularios ?? 0), pessoasContato: t.pessoasContato + (c?.pessoasContato ?? 0),
  }), vazio);
  const tot = soma(s.porCanal);
  const totAntes = soma(s.porCanalAntes);
  // Pessoas diferentes que chamaram no período todo (somar canais contaria duas vezes quem veio por dois caminhos; é raro e aceitável)
  const chamaram = tot.pessoasContato;
  const chamaramAntes = totAntes.pessoasContato;

  const notaGoogle = !g.ok ? undefined
    : g.semComparacao ? `o Google fecha estes dias até ${dataBR(deslocarIso(r.periodo.fim, 3))}`
    : undefined;
  const avisoGoogleParcial = g.ok && g.parcial && !g.semComparacao
    ? `Google contado até ${dataBR(g.completoAte)} (chega com 2 a 3 dias de atraso) e comparado com o mesmo número de dias antes.`
    : null;

  // links que mantêm período e aba
  const qs = (mudar: Record<string, string | undefined>) => {
    const base: Record<string, string | undefined> = { periodo: periodo.chave, inicio: periodo.chave === "personalizado" ? sp.inicio : undefined, fim: periodo.chave === "personalizado" ? sp.fim : undefined, aba: aba === "geral" ? undefined : aba, ...mudar };
    const u = new URLSearchParams(Object.entries(base).filter(([, v]) => v) as [string, string][]);
    return `/admin${u.size ? `?${u}` : ""}`;
  };

  return (
    <div className="grid gap-5 max-w-6xl">
      <AvisoCampanha lista={campanhas} compacto />

      {/* ═════════ cabeçalho: título, período e fontes ═════════ */}
      <header className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl text-steel">Resultados</h1>
            <p className="text-steel-line text-sm mt-1">
              {umDia ? `${dataBR(r.periodo.inicio)} · comparado ao dia anterior` : `${dataBR(r.periodo.inicio)} a ${dataBR(r.periodo.fim)} · comparado aos ${nomeAntes}`}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="Período">
            {PERIODOS.map((p) => (
              <Link
                key={p.valor}
                href={qs({ periodo: p.valor, inicio: undefined, fim: undefined })}
                className={`px-4 py-2 rounded-full text-sm font-bold ${periodo.chave === p.valor ? "bg-verniz text-carbon" : "bg-card border border-card-line text-steel-line hover:text-verniz-shine"}`}
              >
                {p.label}
              </Link>
            ))}
            <form method="GET" className="flex items-center gap-1.5">
              <input type="hidden" name="periodo" value="personalizado" />
              {aba !== "geral" && <input type="hidden" name="aba" value={aba} />}
              <label className="sr-only" htmlFor="per-ini">Início</label>
              <input id="per-ini" type="date" name="inicio" defaultValue={sp.inicio} max={hojeIsoSP()} className="px-2 py-2 rounded-lg bg-card border border-card-line text-steel text-xs" />
              <label className="sr-only" htmlFor="per-fim">Fim</label>
              <input id="per-fim" type="date" name="fim" defaultValue={sp.fim} max={hojeIsoSP()} className="px-2 py-2 rounded-lg bg-card border border-card-line text-steel text-xs" />
              <button type="submit" className={`px-3 py-2 rounded-lg text-xs font-bold ${periodo.chave === "personalizado" ? "bg-verniz text-carbon" : "bg-card border border-card-line text-steel-line hover:text-verniz-shine"}`}>Ver datas</button>
            </form>
          </nav>
        </div>
        <StatusFontes r={r} />
        <nav className="flex gap-1 overflow-x-auto border-b border-card-line -mb-1" aria-label="Seções do painel">
          {ABAS.map((t) => (
            <Link
              key={t.valor}
              href={qs({ aba: t.valor === "geral" ? undefined : t.valor })}
              aria-current={aba === t.valor ? "page" : undefined}
              className={`px-4 py-2.5 text-sm font-bold whitespace-nowrap border-b-2 -mb-px ${aba === t.valor ? "border-verniz text-verniz-shine" : "border-transparent text-steel-line hover:text-steel"}`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>

      {aba === "geral" && (
        <>
          {(!g.ok || !a.ok) && <AvisoConexao r={r} />}
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <Numero titulo="Pessoas no site" valor={n(s.pessoas)} atual={s.pessoas} antes={s.pessoasAntes} fonte="site" serie={sPessoas}
              ajuda="Pessoas diferentes que abriram o site, de qualquer origem." />
            <Numero titulo="Pessoas que chamaram" valor={n(chamaram)} atual={chamaram} antes={chamaramAntes} fonte="site" serie={sChamaram} cor="var(--cera)"
              ajuda="Clicaram no WhatsApp ou em Agendar." />
            <Numero titulo="Conversão do site" valor={pctTxt(chamaram, s.pessoas)} atual={s.pessoas ? chamaram / s.pessoas : 0} antes={s.pessoasAntes ? chamaramAntes / s.pessoasAntes : undefined} fonte="site" serie={sConversao} fmtAntes={(v) => `${dec(v * 100)}%`}
              ajuda="Das pessoas que entraram, quantas chamaram." />
            <Numero titulo="Contatos" valor={n(s.contatos)} atual={s.contatos} antes={s.contatosAntes} fonte="site" serie={sContatos} cor="var(--cera)"
              ajuda={`WhatsApp ${n(s.whatsapp)} · Agendar ${n(s.agendar)} · formulários ${n(s.formularios)}`} />
            {g.ok ? (
              <>
                <Numero titulo="Apareceu no Google" valor={n(g.aparicoes)} atual={g.aparicoes} antes={g.aparicoesAntes} fonte="console" serie={gAparicoes} semComparacao={notaGoogle} />
                <Numero titulo="Cliques no Google" valor={n(g.cliques)} atual={g.cliques} antes={g.cliquesAntes} fonte="console" serie={gCliques} semComparacao={notaGoogle}
                  ajuda={g.aparicoes ? `${pctTxt(g.cliques, g.aparicoes)} de quem viu clicou` : undefined} />
                <Numero titulo="Posição média" valor={g.posicao ? dec(g.posicao) : "—"} atual={g.posicao} antes={undefined} fonte="console" serie={gPosicao} menorMelhor
                  semComparacao="1 a 10 = primeira página" />
              </>
            ) : null}
            {a.ok ? (
              <Numero titulo="Pessoas (Analytics)" valor={n(a.pessoas)} atual={a.pessoas} antes={a.pessoasAntes} fonte="analytics" serie={aPessoas} cor="var(--cera)"
                ajuda={`${n(a.novas)} vieram pela primeira vez`} />
            ) : null}
          </div>
          {avisoGoogleParcial && <p className="text-[11px] text-steel-line -mt-2">{avisoGoogleParcial}</p>}

          <div className="grid gap-5 lg:grid-cols-2">
            <Cartao titulo={`Pessoas no site ${porQue}`} sub={`Contagem do site, em cinza os ${nomeAntes}`}>
              <GraficoSerie pontos={sPessoas} unidade="pessoas" totais={{ atual: s.pessoas, antes: s.pessoasAntes }} />
            </Cartao>
            <Cartao titulo={`Pessoas que chamaram ${porQue}`} sub="Clicaram no WhatsApp ou em Agendar">
              <GraficoSerie pontos={sChamaram} unidade="pessoas" tipo="barras" cor="var(--cera)" totais={{ atual: chamaram, antes: chamaramAntes }} />
            </Cartao>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Cartao titulo="Funil: da visita ao contato" sub="Quantos passam de uma etapa para a outra no período">
              <Funil etapas={[
                { nome: "Abriu o site", valor: s.pessoas, fonte: "site" },
                { nome: "Viu mais de uma página", valor: s.profundidade.slice(1).reduce((t, v) => t + v, 0), fonte: "site" },
                { nome: "Chamou no WhatsApp/Agendar", valor: chamaram, fonte: "site" },
              ]} />
              {g.ok && (
                <>
                  <p className="text-xs font-bold text-steel mt-5 mb-2">Só o Google</p>
                  <Funil etapas={[
                    { nome: "Apareceu na pesquisa", valor: g.aparicoes, fonte: "console" },
                    { nome: "Clicou no resultado", valor: g.cliques, fonte: "console" },
                    { nome: "Chamou (veio do Google)", valor: s.porCanal.google?.pessoasContato ?? 0, fonte: "site" },
                  ]} />
                </>
              )}
              <VerMais>
                <p className="text-xs text-steel-line leading-relaxed">
                  Site: todas as origens (Google, Instagram, direto…), {n(s.pessoas)} pessoas; {n(s.profundidade.slice(1).reduce((t, v) => t + v, 0))} viram mais de uma página e {n(chamaram)} clicaram no WhatsApp ou em Agendar ({pctTxt(chamaram, s.pessoas)}).
                  {g.ok && ` Google: o site apareceu ${n(g.aparicoes)} vezes, ${n(g.cliques)} clicaram (${pctTxt(g.cliques, g.aparicoes)}) e ${n(s.porCanal.google?.pessoasContato ?? 0)} pessoas vindas do Google chamaram.`}
                  {g.ok && g.parcial && " Os números do Google vão só até o último dia que ele já fechou."}
                </p>
              </VerMais>
            </Cartao>
            <Cartao titulo="De onde vêm as pessoas" sub="Contagem do site. Ao lado, quantas chamaram">
              <ListaBarras unidade="pessoas" itens={CANAIS_ORDEM.map((k) => ({ k, c: s.porCanal[k] }))
                .filter((x) => x.c && x.c.pessoas)
                .sort((x, y) => y.c!.pessoas - x.c!.pessoas)
                .map(({ k, c }) => ({ nome: NOME_CANAL[k], valor: c!.pessoas, extra: `${n(c!.pessoasContato)} chamaram (${pctTxt(c!.pessoasContato, c!.pessoas)})` }))} />
              <Link href={qs({ aba: "origem" })} className="inline-block mt-4 text-xs font-bold text-verniz-shine hover:underline">Ver tudo por origem →</Link>
            </Cartao>
          </div>

          <CartaoPrevisao r={r} />

          <Indicadores r={r} tot={tot} />
        </>
      )}

      {aba === "visitantes" && <AbaVisitantes r={r} quem={sp.quem === "clicou" ? "clicou" : "todos"} qs={qs} />}

      {aba === "origem" && <PorOrigem r={r} soma={soma} vazio={vazio} />}

      {aba === "google" && (
        <>
          {!g.ok ? <AvisoConexao r={r} /> : (
            <>
              {umDia && <p className="text-sm text-cera">O Google entrega os números com 2 a 3 dias de atraso: hoje ainda não aparece aqui. Escolha 7 ou 30 dias.</p>}
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Numero titulo="Apareceu no Google" valor={n(g.aparicoes)} atual={g.aparicoes} antes={g.aparicoesAntes} fonte="console" serie={gAparicoes} semComparacao={notaGoogle}
                  ajuda="Vezes que o site surgiu na tela de quem pesquisou." />
                <Numero titulo="Cliques no resultado" valor={n(g.cliques)} atual={g.cliques} antes={g.cliquesAntes} fonte="console" serie={gCliques} semComparacao={notaGoogle}
                  ajuda="Quem clicou no link do site no Google." />
                <Numero titulo="Taxa de clique (CTR)" valor={pctTxt(g.cliques, g.aparicoes)} atual={g.aparicoes ? g.cliques / g.aparicoes : 0} antes={g.aparicoesAntes ? g.cliquesAntes / g.aparicoesAntes : undefined} fonte="console" semComparacao={notaGoogle} fmtAntes={(v) => `${dec(v * 100)}%`}
                  ajuda="De quem viu, quantos clicaram." />
                <Numero titulo="Posição média" valor={g.posicao ? dec(g.posicao) : "—"} atual={g.posicao} fonte="console" serie={gPosicao} menorMelhor semComparacao="menor é melhor"
                  ajuda="1 a 10 = primeira página." />
              </div>
              {avisoGoogleParcial && <p className="text-[11px] text-steel-line -mt-2">{avisoGoogleParcial} As barras mais claras são dias que o Google ainda está contando.</p>}
              <div className="grid gap-5 lg:grid-cols-2">
                <Cartao titulo={`Aparições no Google ${porQue === "por hora" ? "por dia" : porQue}`} sub={`Em cinza, os ${nomeAntes}`}>
                  <GraficoSerie pontos={gAparicoes} unidade="aparições" totais={g.semComparacao ? undefined : { atual: g.aparicoes, antes: g.aparicoesAntes }} />
                </Cartao>
                <Cartao titulo={`Cliques no resultado ${porQue === "por hora" ? "por dia" : porQue}`} sub="Quantas aparições viraram visita">
                  <GraficoSerie pontos={gCliques} unidade="cliques" tipo="barras" totais={g.semComparacao ? undefined : { atual: g.cliques, antes: g.cliquesAntes }} />
                </Cartao>
              </div>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <Cartao titulo="O que pesquisaram para achar você" sub="As buscas em que o site mais apareceu, e quantos clicaram">
                  <BarrasGrupo
                    series={[{ nome: "Apareceu", cor: "var(--verniz)" }, { nome: "Cliques", cor: "var(--cera)" }]}
                    linhas={[...g.buscas].sort((x, y) => y.aparicoes - x.aparicoes).slice(0, 8).map((b) => ({ nome: b.termo, nota: `posição ${dec(b.posicao)}`, valores: [b.aparicoes, b.cliques] }))}
                  />
                  <VerMais rotulo="Ver a tabela das buscas">
                    <TabelaBuscas buscas={g.buscas.slice(0, 30)} />
                  </VerMais>
                </Cartao>
                <Oportunidades buscas={g.buscas} />
              </div>
              <div className="grid gap-5 lg:grid-cols-2">
                <Cartao titulo="Posição média por dia" sub="Quanto mais alto no gráfico, mais perto do topo do Google">
                  {gPosicao.length > 2
                    ? <GraficoSerie pontos={gPosicao} unidade="posição média" inverter casas={1} somar={false} comparar={false} />
                    : <p className="text-sm text-steel-line">{g.porDia.length > 45 ? "Em 90 dias a posição dia a dia fica ilegível: escolha 30 dias." : "Poucos dias para desenhar. Escolha 7 dias ou mais."}</p>}
                </Cartao>
                <Cartao titulo="Páginas que o Google mostra" sub="Cliques vindos do Google em cada página">
                  <ListaBarras unidade="cliques" itens={g.paginas.slice(0, 8).map((p) => ({ nome: p.pagina === "/" ? "Página inicial" : p.pagina, valor: p.cliques, extra: `${n(p.aparicoes)} aparições` }))} />
                </Cartao>
              </div>
            </>
          )}
        </>
      )}

      {aba === "analytics" && (
        <>
          {!a.ok ? <AvisoConexao r={r} /> : (
            <>
              <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Numero titulo="Pessoas no site" valor={n(a.pessoas)} atual={a.pessoas} antes={a.pessoasAntes} fonte="analytics" serie={aPessoas} cor="var(--cera)" />
                <Numero titulo="Primeira visita" valor={n(a.novas)} atual={a.novas} antes={a.novasAntes} fonte="analytics" ajuda={`${pctTxt(a.novas, a.pessoas)} das pessoas`} />
                <Numero titulo="Páginas abertas" valor={n(a.paginasVistas)} atual={a.paginasVistas} antes={a.paginasVistasAntes} fonte="analytics" />
                <Numero titulo="Cliques WhatsApp/Agendar" valor={n(a.cliquesWhats)} atual={a.cliquesWhats} antes={undefined} fonte="analytics" semComparacao={`${n(a.pessoasBuscaGoogle)} vieram da busca do Google`} />
              </div>
              <p className="text-[11px] text-steel-line -mt-2">O Analytics chega em algumas horas e costuma dar um pouco menos que o site: bloqueadores de anúncio e quem recusa cookies ficam de fora.</p>
              <div className="grid gap-5 lg:grid-cols-2">
                <Cartao titulo={`Pessoas ${porQue}`} sub={`Contagem do Analytics, em cinza os ${nomeAntes}`}>
                  <GraficoSerie pontos={aPessoas} unidade="pessoas" cor="var(--cera)" totais={{ atual: a.pessoas, antes: a.pessoasAntes }} />
                </Cartao>
                <Cartao titulo="Que horas as pessoas entram" sub="Pessoas por hora do dia, somando o período">
                  <GraficoSerie pontos={serieHoraria(a.porHora)} unidade="pessoas" tipo="barras" cor="var(--cera)" comparar={false} somar={false} />
                </Cartao>
                <Cartao titulo="De onde vieram" sub="Canais classificados pelo Google">
                  <ListaBarras cor="bg-cera" unidade="pessoas" itens={a.canais.map((c) => ({ nome: c.nome, valor: c.pessoas }))} />
                </Cartao>
                <Cartao titulo="Aparelho usado" sub="Celular ou computador">
                  <ListaBarras cor="bg-cera" unidade="pessoas" itens={a.aparelhos.map((c) => ({ nome: c.nome, valor: c.pessoas, extra: pctTxt(c.pessoas, a.aparelhos.reduce((t, x) => t + x.pessoas, 0)) }))} />
                </Cartao>
                <Cartao titulo="Cidades dos visitantes" sub="Cidade aproximada" className="lg:col-span-2">
                  <ListaBarras cor="bg-cera" unidade="pessoas" itens={a.cidades.map((c) => ({ nome: c.nome, valor: c.pessoas }))} />
                </Cartao>
              </div>
            </>
          )}
        </>
      )}

      {aba === "site" && <AbaSite r={r} sPessoas={sPessoas} sPaginas={sPaginas} sContatos={sContatos} porQue={porQue} nomeAntes={nomeAntes} />}

      {aba === "comparar" && <Comparacao r={r} />}

      <p className="text-xs text-steel-line">
        Os números do Google são atualizados a cada 30 minutos; os do próprio site, a cada vez que você abre esta página.
      </p>
    </div>
  );
}

// ───────────────────────────────────────────────────────── blocos das abas

function Oportunidades({ buscas }: { buscas: Busca[] }) {
  const lista = buscas.filter((b) => b.posicao > 4 && b.posicao <= 25 && b.aparicoes >= 3).sort((x, y) => y.aparicoes - x.aparicoes).slice(0, 6);
  return (
    <Cartao titulo="Quase na primeira página" sub="Buscas que já mostram o site, mas abaixo dos primeiros. São as mais fáceis de subir.">
      {lista.length === 0 ? (
        <p className="text-sm text-steel-line">Nenhuma oportunidade clara neste período.</p>
      ) : (
        <>
        <ListaBarras cor="bg-cera" unidade="aparições" itens={lista.map((o) => ({ nome: o.termo, valor: o.aparicoes, extra: `posição ${Math.round(o.posicao)}` }))} />
        <VerMais rotulo="O que fazer">
        <ul className="grid gap-3">
          {lista.map((o) => (
            <li key={o.termo} className="flex gap-3">
              <Lightbulb size={16} className="text-cera shrink-0 mt-0.5" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm text-steel font-bold">{o.termo}</p>
                <p className="text-xs text-steel-line">Apareceu {n(o.aparicoes)} vezes, na posição {Math.round(o.posicao)}. Um guia ou página falando disso ajuda a subir.</p>
              </div>
            </li>
          ))}
        </ul>
        </VerMais>
        </>
      )}
    </Cartao>
  );
}

/** Indicadores que empresas que medem resultado acompanham. */
function Indicadores({ r, tot }: { r: Resultados; tot: NumerosCanal }) {
  const { site: s, google: g } = r;
  const ig = r.meta.instagram;
  const vi = s.visitas_;
  const taxa = (x: number, y: number) => (y ? x / y : null);
  const medidores: { nome: string; valor: number | null; ajuda: string; menorMelhor?: boolean; cor?: string }[] = [
    { nome: "Conversão do site", valor: taxa(tot.pessoasContato, s.pessoas), ajuda: "das pessoas, quantas chamaram", cor: "var(--cera)" },
    { nome: "Taxa de rejeição", valor: taxa(vi.sessoesUmaPagina, vi.sessoes), ajuda: "abriram uma página só e saíram", menorMelhor: true, cor: "var(--steel-line)" },
    { nome: "Visitantes novos", valor: taxa(vi.pessoasNovas, s.pessoas), ajuda: "primeira vez no site" },
    ...(g.ok ? [{ nome: "CTR no Google", valor: taxa(g.cliques, g.aparicoes), ajuda: "de quem viu no Google, quantos clicaram" }] : []),
    ...(ig?.ok ? [{ nome: "Instagram: perfil → site", valor: taxa(ig.cliquesLinkSite ?? 0, ig.visitasPerfil ?? 0), ajuda: "visitas ao perfil que clicaram no link", cor: "#e1306c" }] : []),
  ];
  return (
    <Cartao titulo="Indicadores" sub="Os que empresas que medem resultado acompanham">
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {medidores.map((x) => <Medidor key={x.nome} {...x} />)}
      </div>
      <VerMais>
        <ul className="grid gap-1.5 text-sm">
          <li className="flex justify-between gap-3"><span className="text-steel-line">Contatos por dia (pessoas que chamaram, média)</span><b className="text-steel tabular-nums">{dec(tot.pessoasContato / Math.max(1, r.periodo.dias))}</b></li>
          <li className="flex justify-between gap-3"><span className="text-steel-line">Páginas por visita</span><b className="text-steel tabular-nums">{vi.sessoes ? dec(tot.paginas / vi.sessoes) : "—"}</b></li>
          <li className="flex justify-between gap-3"><span className="text-steel-line">Visitas (sessões) no período</span><b className="text-steel tabular-nums">{n(vi.sessoes)}</b></li>
          <li className="flex justify-between gap-3"><span className="text-steel-line">Visitas que abriram uma página só e saíram</span><b className="text-steel tabular-nums">{n(vi.sessoesUmaPagina)}</b></li>
          <li className="flex justify-between gap-3"><span className="text-steel-line">Pessoas novas</span><b className="text-steel tabular-nums">{n(vi.pessoasNovas)} de {n(s.pessoas)}</b></li>
          {g.ok && <li className="flex justify-between gap-3"><span className="text-steel-line">Google: cliques / aparições</span><b className="text-steel tabular-nums">{n(g.cliques)} / {n(g.aparicoes)}</b></li>}
          {ig?.ok && <li className="flex justify-between gap-3"><span className="text-steel-line">Instagram: cliques no link / visitas ao perfil</span><b className="text-steel tabular-nums">{n(ig.cliquesLinkSite ?? 0)} / {n(ig.visitasPerfil ?? 0)}</b></li>}
        </ul>
      </VerMais>
    </Cartao>
  );
}

/** Uma tabela por canal, mais o Instagram. Substitui os cartões com selos. */
function PorOrigem({ r, soma, vazio }: { r: Resultados; soma: (m: Partial<Record<Canal, NumerosCanal>>) => NumerosCanal; vazio: NumerosCanal }) {
  const { site: s, analytics: a, google: g } = r;
  const ig = r.meta.instagram;
  const igAntes = r.meta.instagramAntes?.ok ? r.meta.instagramAntes : null;
  const linhas = CANAIS_ORDEM.map((k) => ({ k, st: s.porCanal[k] ?? vazio, stA: s.porCanalAntes[k] ?? vazio, an: a.porCanal[k] }))
    .filter((x) => x.st.pessoas || x.st.paginas || x.an?.pessoas)
    .sort((x, y) => y.st.pessoas - x.st.pessoas || (y.an?.pessoas ?? 0) - (x.an?.pessoas ?? 0));
  const tot = soma(s.porCanal);
  const totA = soma(a.porCanal);
  const col = "py-2.5 px-2 text-right tabular-nums";
  const maxP = Math.max(1, ...linhas.map((l) => l.st.pessoas));
  return (
    <div className="grid gap-5">
      <Cartao titulo="Cada origem" sub="Pessoas e quem chamou em cada origem (contagem do site, na hora)">
        <BarrasGrupo
          series={[{ nome: "Pessoas (site)", cor: "var(--verniz)" }, { nome: "Chamaram", cor: "var(--cera)" }, ...(a.ok ? [{ nome: "Pessoas (Analytics)", cor: "#6b7686" }] : [])]}
          linhas={linhas.map(({ k, st, stA, an }) => {
            const va = stA.pessoas ? Math.round(((st.pessoas - stA.pessoas) / stA.pessoas) * 100) : null;
            return {
              nome: NOME_CANAL[k],
              nota: `conversão ${pctTxt(st.pessoasContato, st.pessoas)}${va !== null ? ` · pessoas ${va > 0 ? "+" : va < 0 ? "−" : ""}${Math.abs(va)}% vs. anterior` : ""}`,
              valores: [st.pessoas, st.pessoasContato, ...(a.ok ? [an?.pessoas ?? 0] : [])],
            };
          })}
        />
        <VerMais rotulo="Ver a tabela completa">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-steel-line">
                <th className="pb-2 px-2 text-left font-bold">Origem</th>
                <th className="pb-2 px-2 text-left font-bold w-[30%]">Pessoas</th>
                {a.ok && <th className="pb-2 px-2 text-right font-bold text-cera">Analytics</th>}
                <th className="pb-2 px-2 text-right font-bold">Páginas</th>
                <th className="pb-2 px-2 text-right font-bold">WhatsApp</th>
                <th className="pb-2 px-2 text-right font-bold">Agendar</th>
                <th className="pb-2 px-2 text-right font-bold">Formulários</th>
                <th className="pb-2 px-2 text-right font-bold">Chamaram</th>
                <th className="pb-2 px-2 text-right font-bold">Conversão</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map(({ k, st, stA, an }) => (
                <tr key={k} className="border-t border-card-line">
                  <td className="py-2.5 px-2 text-steel whitespace-nowrap">{NOME_CANAL[k]}</td>
                  <td className="py-2.5 px-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-verniz" style={{ width: `${Math.max(3, (st.pessoas / maxP) * 70)}%` }} />
                      <b className="text-steel tabular-nums">{n(st.pessoas)}</b>
                      <Variacao atual={st.pessoas} antes={stA.pessoas} curta />
                    </div>
                  </td>
                  {a.ok && <td className={`${col} text-steel-line`}>{n(an?.pessoas ?? 0)}</td>}
                  <td className={`${col} text-steel`}>{n(st.paginas)}</td>
                  <td className={`${col} text-steel`}>{n(st.whatsapp)}</td>
                  <td className={`${col} text-steel`}>{n(st.agendar)}</td>
                  <td className={`${col} text-steel`}>{n(st.formularios)}</td>
                  <td className={`${col} font-bold text-steel`}>{n(st.pessoasContato)}</td>
                  <td className={`${col} text-steel`}>{pctTxt(st.pessoasContato, st.pessoas)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-card-line font-bold">
                <td className="py-2.5 px-2 text-steel">Total</td>
                <td className="py-2.5 px-2 text-steel tabular-nums">{n(s.pessoas)}</td>
                {a.ok && <td className={`${col} text-steel-line`}>{n(totA.pessoas)}</td>}
                <td className={`${col} text-steel`}>{n(tot.paginas)}</td>
                <td className={`${col} text-steel`}>{n(tot.whatsapp)}</td>
                <td className={`${col} text-steel`}>{n(tot.agendar)}</td>
                <td className={`${col} text-steel`}>{n(tot.formularios)}</td>
                <td className={`${col} text-steel`}>{n(tot.pessoasContato)}</td>
                <td className={`${col} text-steel`}>{pctTxt(tot.pessoasContato, s.pessoas)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-steel-line mt-3">Cada pessoa fica na origem por onde entrou: quem achou no Google e clicou no WhatsApp conta em Google. &quot;Chamaram&quot; = pessoas diferentes que clicaram no WhatsApp ou Agendar.</p>
        </VerMais>
      </Cartao>

      <div className="grid gap-5 lg:grid-cols-2">
        <Cartao titulo="Google" sub="Pesquisa (Search Console) e quem chegou ao site">
          {g.ok ? (
            <div className="grid grid-cols-3 gap-3">
              <MiniNumero nome="Apareceu" valor={g.aparicoes} antes={g.semComparacao ? undefined : g.aparicoesAntes} />
              <MiniNumero nome="Clicou" valor={g.cliques} antes={g.semComparacao ? undefined : g.cliquesAntes} />
              <MiniNumero nome="Chamou (site)" valor={s.porCanal.google?.pessoasContato ?? 0} antes={s.porCanalAntes.google?.pessoasContato ?? 0} />
            </div>
          ) : <p className="text-sm text-steel-line">Search Console não ligado. Veja a aba Google.</p>}
        </Cartao>
        <Cartao titulo="Instagram" sub="Números da Meta, pelo GBR SAS">
          {ig?.ok ? (
            <div className="grid grid-cols-3 gap-3">
              <MiniNumero nome="Contas alcançadas" valor={ig.alcance ?? 0} antes={igAntes?.alcance} />
              <MiniNumero nome="Visitas ao perfil" valor={ig.visitasPerfil ?? 0} antes={igAntes?.visitasPerfil} />
              <MiniNumero nome="Clicou no link" valor={ig.cliquesLinkSite ?? 0} antes={igAntes?.cliquesLinkSite} />
            </div>
          ) : <p className="text-sm text-steel-line">{ig?.erro ? `Instagram com problema: ${ig.erro}` : "Instagram ainda não ligado no GBR SAS."}</p>}
        </Cartao>
      </div>
    </div>
  );
}

function MiniNumero({ nome, valor, antes }: { nome: string; valor: number; antes?: number }) {
  return (
    <div className="rounded-xl bg-carbon/60 p-3 grid gap-1 content-start">
      <span className="text-[11px] text-steel-line">{nome}</span>
      <b className="font-display text-2xl text-steel tabular-nums leading-none">{n(valor)}</b>
      <Variacao atual={valor} antes={antes} curta />
    </div>
  );
}

function AbaSite({ r, sPessoas, sPaginas, sContatos, porQue, nomeAntes }: { r: Resultados; sPessoas: Ponto[]; sPaginas: Ponto[]; sContatos: Ponto[]; porQue: string; nomeAntes: string }) {
  const s = r.site;
  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Numero titulo="Pessoas no site" valor={n(s.pessoas)} atual={s.pessoas} antes={s.pessoasAntes} fonte="site" serie={sPessoas} />
        <Numero titulo="Páginas abertas" valor={n(s.visitas)} atual={s.visitas} antes={s.visitasAntes} fonte="site" serie={sPaginas}
          ajuda={s.pessoas ? `${dec(s.visitas / s.pessoas)} por pessoa` : undefined} />
        <Numero titulo="WhatsApp + Agendar" valor={n(s.whatsapp + s.agendar)} atual={s.whatsapp + s.agendar} antes={s.cliquesWhatsAntes} fonte="site" cor="var(--cera)"
          ajuda={`WhatsApp ${n(s.whatsapp)} · Agendar ${n(s.agendar)}. É o clique: quem não enviou a mensagem também conta.`} />
        <Numero titulo="Formulários" valor={n(s.formularios)} atual={s.formularios} antes={s.formulariosAntes} fonte="site" ajuda="Ex.: cupom de primeira visita." />
      </div>
      {s.legado && <p className="text-xs text-steel-line">Neste período há só dados antigos, que contavam também robôs e as suas visitas. A contagem limpa começou em 08/10/2026.</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <Cartao titulo={`Páginas abertas ${porQue}`} sub={`Em cinza, os ${nomeAntes}`}>
          <GraficoSerie pontos={sPaginas} unidade="páginas" />
        </Cartao>
        <Cartao titulo={`Contatos ${porQue}`} sub="WhatsApp, Agendar e formulários">
          <GraficoSerie pontos={sContatos} unidade="contatos" tipo="barras" cor="var(--cera)" />
          <VerMais rotulo="Ver os últimos cliques">
            {s.recentes.length === 0 ? (
              <p className="text-sm text-steel-line">Nenhum contato neste período.</p>
            ) : (
              <ul className="divide-y divide-card-line">
                {s.recentes.map((e, i) => (
                  <li key={i} className="py-2 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-sm">
                    <span className="tabular-nums text-steel-line text-xs w-24 shrink-0">{quando(e.quando)}</span>
                    <span className="font-bold text-steel w-20 shrink-0">{e.tipo}</span>
                    <span className="text-steel-line min-w-0 break-all flex-1">{e.caminho === "/" ? "Página inicial" : e.caminho}</span>
                    <span className="text-xs text-steel-line">veio de: {e.origem}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[11px] text-steel-line mt-2">Compare com as conversas que começam com “Vim pelo site da Clean Car”. Quem clicou, um por um, está na aba Visitantes.</p>
          </VerMais>
        </Cartao>
        <Cartao titulo="Que horas as pessoas entram" sub="Pessoas por hora do dia, somando o período">
          <GraficoSerie pontos={serieHoraria(s.porHora.map((h) => h.pessoas))} unidade="pessoas" tipo="barras" comparar={false} somar={false} />
        </Cartao>
        {r.periodo.dias >= 7 ? (
          <Cartao titulo="Dia da semana" sub="Contatos em cada dia da semana, somando o período">
            <GraficoSerie pontos={seriePorDiaSemana(s.porDia.map((d) => ({ data: d.data, valor: d.contatos })))} unidade="contatos" tipo="barras" cor="var(--cera)" comparar={false} />
          </Cartao>
        ) : (
          <Cartao titulo="Que horas chamam" sub="Contatos por hora do dia">
            <GraficoSerie pontos={serieHoraria(s.porHora.map((h) => h.contatos))} unidade="contatos" tipo="barras" cor="var(--cera)" comparar={false} />
          </Cartao>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Cartao titulo="De onde as pessoas vieram" sub="Origem anotada pelo site em cada visita, e quantos contatos">
          <ListaBarras unidade="visitas" itens={s.origens.map((o) => ({ nome: o.nome, valor: o.visitas, extra: `${n(o.contatos)} contatos` }))} />
        </Cartao>
        <Cartao titulo="Páginas que mais geram contato" sub="Contatos e visitas em cada página">
          <ListaBarras cor="bg-cera" unidade="contatos" itens={s.paginas.filter((p) => p.contatos).map((p) => ({ nome: p.caminho === "/" ? "Página inicial" : p.caminho, valor: p.contatos, extra: `${n(p.visitas)} visitas` }))} />
          {s.paginas.some((p) => !p.contatos) && (
            <p className="text-[11px] text-steel-line mt-3">Mais vistas sem contato: {s.paginas.filter((p) => !p.contatos).slice(0, 4).map((p) => (p.caminho === "/" ? "Página inicial" : p.caminho)).join(", ")}</p>
          )}
        </Cartao>
      </div>

    </>
  );
}

/** As três fontes lado a lado, dia a dia, e de onde vem cada número. */
function Comparacao({ r }: { r: Resultados }) {
  const { site: s, analytics: a, google: g } = r;
  const semA = a.ok ? null : "não ligado";
  const semG = g.ok ? null : "não ligado";
  const parcialG = g.ok && g.parcial ? "*" : "";
  const cliquesGoogle = g.porDia.reduce((t, d) => t + d.cliques, 0);
  const aparicoes = g.porDia.reduce((t, d) => t + d.aparicoes, 0);
  const linhas: { assunto: string; site: string; analytics: string; console: string; ajuda: string }[] = [
    { assunto: "Pessoas no site", site: n(s.pessoas), analytics: semA ?? n(a.pessoas), console: "—", ajuda: "Site e Analytics devem ficar próximos. Analytics menor: bloqueadores/cookies recusados." },
    { assunto: "Páginas abertas", site: n(s.visitas), analytics: semA ?? n(a.paginasVistas), console: "—", ajuda: "" },
    { assunto: "Vieram pelo Google", site: n(s.pessoasGoogle), analytics: semA ?? n(a.pessoasBuscaGoogle), console: semG ?? `${n(cliquesGoogle)}${parcialG}`, ajuda: "Site e Analytics contam pessoas; o Console conta cliques no resultado." },
    { assunto: "Clicou no WhatsApp/Agendar", site: n(s.whatsapp + s.agendar), analytics: semA ?? n(a.cliquesWhats), console: "—", ajuda: "O Console não vê cliques dentro do site." },
    { assunto: "Formulários enviados", site: n(s.formularios), analytics: semA ?? n(a.formularios), console: "—", ajuda: "" },
    { assunto: "Apareceu no Google", site: "—", analytics: "—", console: semG ?? `${n(aparicoes)}${parcialG}`, ajuda: "Só o Console sabe disso." },
  ];
  const mapaA = new Map(a.porDia.map((d) => [d.data, d.pessoas]));
  const mapaG = new Map(g.porDia.map((d) => [d.data, d.cliques]));
  const dias = [...s.porDia].reverse();
  const col = "py-2 px-2 text-right tabular-nums";
  const fontes: [string, string, string][] = [
    ["Pessoas, páginas, cliques no WhatsApp/Agendar, formulários, origem", "Site", "na hora"],
    ["Pessoas, páginas, cliques, canais, cidades, aparelhos", "Analytics", "algumas horas depois"],
    ["Apareceu no Google, cliques no resultado, posição, buscas", "Search Console", "2 a 3 dias depois"],
    ["Alcance, visitas ao perfil, cliques no link do Instagram", "Instagram (pelo SAS)", "1 dia depois"],
  ];
  return (
    <div className="grid gap-5">
      <Cartao titulo="Mesmo assunto, três fontes" sub="Diferenças pequenas são normais (cada ferramenta conta de um jeito); diferença grande indica algo para investigar">
        <BarrasGrupo
          series={[{ nome: "Site", cor: "var(--ok)" }, { nome: "Analytics", cor: "var(--cera)" }, { nome: "Search Console", cor: "var(--verniz)" }]}
          linhas={[
            { nome: "Pessoas no site", valores: [s.pessoas, a.ok ? a.pessoas : null, null] },
            { nome: "Vieram pelo Google", valores: [s.pessoasGoogle, a.ok ? a.pessoasBuscaGoogle : null, g.ok ? cliquesGoogle : null] },
            { nome: "Clicou no WhatsApp/Agendar", valores: [s.whatsapp + s.agendar, a.ok ? a.cliquesWhats : null, null] },
            { nome: "Formulários enviados", valores: [s.formularios, a.ok ? a.formularios : null, null] },
          ]}
        />
        <VerMais rotulo="Ver a tabela">
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
        </VerMais>
      </Cartao>

      <Cartao titulo="Pessoas por dia: site e Analytics" sub="As duas contagens devem andar juntas; em cinza, o Analytics">
        <GraficoSerie
          pontos={serieDiaria(s.porDia.map((d) => ({ data: d.data, valor: d.pessoas })), a.ok ? s.porDia.map((d) => ({ data: d.data, valor: mapaA.get(d.data) ?? 0 })) : undefined)}
          unidade="pessoas (site)"
          cor="var(--ok)"
          somar={false}
        />
        <p className="text-[11px] text-steel-line">{a.ok ? "Linha cinza = Analytics no mesmo dia (aqui não é o período anterior)." : "Analytics não ligado: só a linha do site."}</p>
        <VerMais rotulo="Ver dia a dia escrito">
        <div className="overflow-x-auto -mx-1 max-h-[480px] overflow-y-auto">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="sticky top-0 bg-card">
              <tr className="text-[11px] uppercase tracking-wide">
                <th className="pb-2 px-2 font-bold text-left text-steel-line">Dia</th>
                <th className="pb-2 px-2 font-bold text-right text-ok">Pessoas · site</th>
                <th className="pb-2 px-2 font-bold text-right text-cera">Pessoas · Analytics</th>
                <th className="pb-2 px-2 font-bold text-right text-ok">Do Google · site</th>
                <th className="pb-2 px-2 font-bold text-right text-verniz-shine">Cliques · Console</th>
                <th className="pb-2 px-2 font-bold text-right text-ok">Contatos · site</th>
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
                    <td className={`${col} ${recente ? "text-steel-line" : "text-steel"}`}>{g.ok ? `${n(mapaG.get(d.data) ?? 0)}${recente ? "*" : ""}` : "—"}</td>
                    <td className={`${col} text-steel`}>{n(d.contatos)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </VerMais>
      </Cartao>

      <Cartao titulo="De onde vem cada número" sub="Quem conta e quando aparece">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[360px]">
            <tbody>
              {fontes.map(([numero, fonte, quando]) => (
                <tr key={fonte} className="border-t border-card-line align-top first:border-t-0">
                  <td className="py-2 px-1 text-steel">{numero}</td>
                  <td className="py-2 px-1 font-bold text-steel whitespace-nowrap">{fonte}</td>
                  <td className="py-2 px-1 text-steel-line whitespace-nowrap">{quando}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-steel-line mt-3">
          Exemplo: um cliente pesquisa no Google, entra no site e clica no WhatsApp. Na hora o site conta a visita vinda do Google e o clique. Em algumas horas o Analytics também conta. Dois ou três dias depois o Search Console mostra o clique dele no resultado do Google.
        </p>
      </Cartao>
    </div>
  );
}

// ───────────────────────────────────────────────────────── previsão e projeção

type Resumo = { nome: string; v: number; min: number; max: number };

function Tendencia({ t }: { t: number | null }) {
  if (t === null) return null;
  const p = Math.round(t * 100);
  const [txt, cor] = Math.abs(p) < 3 ? ["estável", "text-steel-line"] : p > 0 ? [`subindo ${p}% por semana`, "text-ok"] : [`caindo ${Math.abs(p)}% por semana`, "text-warn"];
  return <span className={`text-[11px] font-bold ${cor}`}>Tendência: {txt}</span>;
}
type DadosPrevisao = { pontos: Ponto[]; resumo: Resumo[]; tendencia: number | null } | null;
function Bloco({ titulo, d, cor, unidade }: { titulo: string; d: DadosPrevisao; cor: string; unidade: string }) {
return (
  <div className="grid gap-3 min-w-0">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h3 className="font-display font-bold text-steel">{titulo}</h3>
      {d && <Tendencia t={d.tendencia} />}
    </div>
    {d ? (
      <>
        <GraficoSerie pontos={d.pontos} unidade={unidade} cor={cor} comparar={false} somar={false} altura={170} />
        <div className="grid grid-cols-2 gap-2">
          {d.resumo.map((x) => (
            <div key={x.nome} className="rounded-xl bg-carbon/60 p-3 grid gap-0.5">
              <span className="text-[11px] text-steel-line">{x.nome}</span>
              <b className="font-display text-2xl text-steel tabular-nums">≈ {n(x.v)}</b>
              <span className="text-[10px] text-steel-line">entre {n(x.min)} e {n(x.max)}</span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <p className="text-sm text-steel-line">Poucos dias com dados para prever. Escolha 7 dias ou mais.</p>
    )}
  </div>
);
}

function CartaoPrevisao({ r }: { r: Resultados }) {
  const { site: s, google: g } = r;
  const hoje = hojeIsoSP();
  const terminaHoje = r.periodo.fim === hoje;
  const umDia = r.periodo.dias === 1;
  const H = r.periodo.dias <= 7 ? 7 : 30;
  const inicioMes = `${hoje.slice(0, 8)}01`;
  const fimMes = new Date(Date.UTC(Number(hoje.slice(0, 4)), Number(hoje.slice(5, 7)), 0)).toISOString().slice(0, 10);
  const diasEntre = (de: string, ate: string) => Math.round((Date.parse(ate) - Date.parse(de)) / 86_400_000);
  const faixaSoma = (p: Previsao, feito = 0) => ({ v: feito + somar(p.valores), min: feito + somar(p.faixa.map((f) => f[0])), max: feito + somar(p.faixa.map((f) => f[1])) });

  const montar = (campo: "pessoas" | "chamaram" | "contatos", nomeMes: string): DadosPrevisao => {
    if (umDia && terminaHoje) {
      const ah = horaAgoraSP();
      const at = s.porHora.map((h) => h[campo]);
      const p = preverHoras(at, s.porHoraAntes.map((h) => h[campo]), ah);
      const pontos = serieHoraria(at, undefined, ah).map((pt, h) => (h > ah ? { ...pt, prev: p.valores[h - ah - 1], faixa: p.faixa[h - ah - 1] } : pt));
      return { pontos, resumo: [{ nome: "Até o fim de hoje", ...faixaSoma(p, somar(at.slice(0, ah + 1))) }], tendencia: null };
    }
    const hist = [...s.porDiaAntes, ...s.porDia].map((d) => ({ data: d.data, valor: d[campo] }));
    // hoje ainda está pela metade: fica fora da reta e entra como primeiro dia previsto
    const base = terminaHoje ? hist.slice(0, -1) : hist;
    const prev = preverDias(base, H);
    if (!prev) return null;
    const ultimoDia = base[base.length - 1].data;
    const pontos: Ponto[] = [
      ...base.slice(-Math.min(30, Math.max(7, r.periodo.dias))).map((d) => ({ rotulo: dataBR(d.data), dica: dataBR(d.data), valor: d.valor })),
      ...prev.valores.map((v, i) => {
        const d = deslocarIso(ultimoDia, i + 1);
        return { rotulo: dataBR(d), dica: `${dataBR(d)} · previsão`, valor: null, prev: v, faixa: prev.faixa[i] };
      }),
    ];
    const resumo: Resumo[] = [{ nome: `Próximos ${H} dias`, ...faixaSoma(prev) }];
    if (terminaHoje && base[0].data <= inicioMes) {
      const feito = somar(base.filter((d) => d.data >= inicioMes).map((d) => d.valor));
      const resto = diasEntre(ultimoDia, fimMes);
      const pm = resto > 0 ? preverDias(base, resto) : null;
      resumo.unshift({ nome: nomeMes, ...(pm ? faixaSoma(pm, feito) : { v: feito, min: feito, max: feito }) });
    }
    return { pontos, resumo, tendencia: prev.tendenciaSemana };
  };

  const mes = new Date(hoje + "T12:00:00Z").toLocaleString("pt-BR", { month: "long", timeZone: "UTC" });
  const pessoas = montar("pessoas", `Fim de ${mes}`);
  const chamaram = montar("chamaram", `Fim de ${mes}`);

  // Google: cliques até o último dia fechado
  let googleProx: Resumo | null = null;
  if (g.ok && !umDia) {
    const histG = [...g.porDiaAntes, ...g.porDia].filter((d) => !g.completoAte || d.data <= g.completoAte).map((d) => ({ data: d.data, valor: d.cliques }));
    const pg = preverDias(histG, H);
    if (pg) googleProx = { nome: `Cliques no Google, próximos ${H} dias`, ...faixaSoma(pg) };
  }

  return (
    <Cartao titulo="Previsão e projeção" sub={umDia && terminaHoje ? "Como deve terminar o dia, no ritmo de hoje e no desenho de ontem" : "No ritmo atual: para onde os números vão, com a faixa provável"}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Bloco titulo="Pessoas no site" d={pessoas} cor="var(--verniz)" unidade="pessoas" />
        <Bloco titulo="Pessoas que chamaram" d={chamaram} cor="var(--cera)" unidade="pessoas" />
      </div>
      {googleProx && (
        <p className="text-xs text-steel-line mt-4">
          <b className="text-verniz-shine">Search Console</b> · {googleProx.nome}: <b className="text-steel">≈ {n(googleProx.v)}</b> (entre {n(googleProx.min)} e {n(googleProx.max)})
        </p>
      )}
      <VerMais rotulo="Como a previsão é feita">
        <p className="text-xs text-steel-line leading-relaxed">
          {umDia && terminaHoje
            ? "Para hoje: o que falta do dia segue o desenho de ontem hora a hora, na proporção do que hoje já fez até agora."
            : `Uma reta de tendência sobre o período escolhido e o anterior (${r.periodo.dias * 2} dias), corrigida pelo dia da semana quando há 3 semanas ou mais. A faixa mostra onde cerca de 8 em cada 10 dias devem cair. Hoje, que ainda não acabou, entra como dia previsto.`}{" "}
          Pessoas somam os dias (quem volta em dois dias conta duas vezes). Previsão não é promessa: campanha, feriado ou chuva mudam o ritmo, e quanto mais longe, mais larga a faixa.
        </p>
      </VerMais>
    </Cartao>
  );
}

// ───────────────────────────────────────────────────────── visitantes

const clicou = (v: Visitante) => v.whatsapp + v.agendar + v.formularios > 0;
const quando = (iso: string) => new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });

function LinhaVisitante({ v }: { v: Visitante }) {
  return (
    <li className="py-3 grid gap-1.5 sm:grid-cols-[110px_minmax(0,1fr)_auto] sm:items-start sm:gap-4">
      <span className="tabular-nums text-xs text-steel-line">{quando(v.ultimo)}</span>
      <div className="min-w-0 grid gap-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <b className="text-steel">Visitante {v.id.slice(0, 4).toUpperCase()}</b>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${v.novo ? "bg-verniz/15 text-verniz-shine" : "bg-cera/15 text-cera"}`}>{v.novo ? "novo" : "voltou"}</span>
          <span className="text-xs text-steel-line">{v.tela === "celular" ? "📱 celular" : v.tela === "computador" ? "💻 computador" : ""}</span>
          <span className="text-xs text-steel-line">veio de: <span className="text-steel">{v.origem}</span></span>
        </div>
        <p className="text-xs text-steel-line break-words">
          {n(v.paginas)} {v.paginas === 1 ? "página" : "páginas"}{v.visitas > 1 ? ` em ${v.visitas} visitas` : ""}: {v.caminhos.map((c) => (c === "/" ? "início" : c)).join(" → ") || "—"}
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:justify-end">
        {v.whatsapp > 0 && <span className="rounded-full bg-ok/15 text-ok px-2 py-0.5 text-[11px] font-bold">WhatsApp{v.whatsapp > 1 ? ` ×${v.whatsapp}` : ""}</span>}
        {v.agendar > 0 && <span className="rounded-full bg-ok/15 text-ok px-2 py-0.5 text-[11px] font-bold">Agendar{v.agendar > 1 ? ` ×${v.agendar}` : ""}</span>}
        {v.formularios > 0 && <span className="rounded-full bg-cera/15 text-cera px-2 py-0.5 text-[11px] font-bold">Formulário</span>}
        {!clicou(v) && <span className="text-[11px] text-steel-line">só olhou</span>}
      </div>
    </li>
  );
}

function AbaVisitantes({ r, quem, qs }: { r: Resultados; quem: "todos" | "clicou"; qs: (m: Record<string, string | undefined>) => string }) {
  const s = r.site;
  const chamaram = Object.values(s.porCanal).reduce((t, c) => t + (c?.pessoasContato ?? 0), 0);
  const lista = quem === "clicou" ? s.visitantes.filter(clicou) : s.visitantes;
  const primeiros = lista.slice(0, 12);
  const resto = lista.slice(12);
  const novas = s.visitas_.pessoasNovas;
  const rotulosProf = ["1 página", "2 páginas", "3 a 5", "6 ou mais"];
  return (
    <>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Numero titulo="Visitantes" valor={n(s.pessoas)} atual={s.pessoas} antes={s.pessoasAntes} fonte="site" ajuda="Pessoas diferentes (cada navegador conta uma vez)." />
        <Numero titulo="Novos" valor={n(novas)} atual={novas} fonte="site" semComparacao={`${pctTxt(novas, s.pessoas)} do total`} ajuda="Entraram no site pela primeira vez." />
        <Numero titulo="Voltaram" valor={n(Math.max(0, s.pessoas - novas))} atual={0} fonte="site" semComparacao={`${pctTxt(Math.max(0, s.pessoas - novas), s.pessoas)} do total`} ajuda="Já tinham entrado antes." />
        <Numero titulo="Clicaram" valor={n(chamaram)} atual={chamaram} antes={Object.values(s.porCanalAntes).reduce((t, c) => t + (c?.pessoasContato ?? 0), 0)} fonte="site" cor="var(--cera)" ajuda="WhatsApp ou Agendar." />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Cartao titulo="Quantas páginas cada um viu" sub="Pessoas por número de páginas abertas">
          <GraficoSerie pontos={s.profundidade.map((v, i) => ({ rotulo: rotulosProf[i], dica: rotulosProf[i], valor: v }))} unidade="pessoas" tipo="barras" comparar={false} somar={false} altura={170} />
        </Cartao>
        <Cartao titulo="Aparelho" sub="Celular ou computador">
          <ListaBarras unidade="pessoas" itens={s.aparelhos.map((a) => ({ nome: a.nome, valor: a.pessoas, extra: pctTxt(a.pessoas, s.aparelhos.reduce((t, x) => t + x.pessoas, 0)) }))} />
        </Cartao>
        <Cartao titulo="De onde veio quem clicou" sub="Pessoas que chamaram, por origem">
          <ListaBarras cor="bg-cera" unidade="pessoas" itens={CANAIS_ORDEM.map((k) => ({ nome: NOME_CANAL[k], valor: s.porCanal[k]?.pessoasContato ?? 0 })).filter((x) => x.valor).sort((x, y) => y.valor - x.valor)} />
        </Cartao>
      </div>

      <Cartao titulo="Quem entrou no site" sub={`Os mais recentes primeiro${s.totalVisitantes > s.visitantes.length ? ` (os ${s.visitantes.length} últimos de ${n(s.totalVisitantes)})` : ""}. O site não sabe o nome: cada pessoa é um código do navegador dela. Quem mandou formulário aparece em Contatos recebidos.`}>
        <nav className="flex gap-2 mb-2" aria-label="Filtrar visitantes">
          {(["todos", "clicou"] as const).map((q) => (
            <Link key={q} href={qs({ quem: q === "todos" ? undefined : q })} className={`px-3 py-1 rounded-full text-xs font-bold ${quem === q ? "bg-verniz text-carbon" : "border border-card-line text-steel-line hover:text-verniz-shine"}`}>
              {q === "todos" ? `Todos (${n(s.visitantes.length)})` : `Só quem clicou (${n(s.visitantes.filter(clicou).length)})`}
            </Link>
          ))}
        </nav>
        {lista.length === 0 ? (
          <p className="text-sm text-steel-line">Ninguém {quem === "clicou" ? "clicou" : "entrou"} neste período.</p>
        ) : (
          <>
            <ul className="divide-y divide-card-line">{primeiros.map((v) => <LinhaVisitante key={v.id} v={v} />)}</ul>
            {resto.length > 0 && (
              <VerMais rotulo={`Ver mais ${n(resto.length)}`}>
                <ul className="divide-y divide-card-line">{resto.map((v) => <LinhaVisitante key={v.id} v={v} />)}</ul>
              </VerMais>
            )}
          </>
        )}
      </Cartao>
    </>
  );
}
