export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Search, MousePointerClick, Users, MessageCircle, Plug, Lightbulb, Minus } from "lucide-react";
import { calcularPeriodo, carregarResultados, type Busca, type Resultados } from "@/lib/metricas";
import GraficoDiario from "@/components/admin/GraficoDiario";

const n = (v: number) => Math.round(v).toLocaleString("pt-BR");
const pct = (v: number) => `${(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
const dataBR = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

function Variacao({ atual, antes }: { atual: number; antes: number }) {
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
  icone: Icone, titulo, valor, explicacao, atual, antes, taxa, indisponivel,
}: {
  icone: typeof Search; titulo: string; valor: number; explicacao: string; atual: number; antes: number; taxa?: string; indisponivel?: string;
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
          <Variacao atual={atual} antes={antes} />
        </>
      )}
      <p className="text-xs text-steel-line leading-relaxed">{explicacao}</p>
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
  const periodo = calcularPeriodo(sp.periodo || "28d", sp.inicio, sp.fim);
  const r = await carregarResultados(periodo);
  const { google: g, analytics: a, site: s } = r;

  // Pessoas: o Analytics é a melhor fonte; sem ele, as contadas pelo próprio site.
  const pessoas = a.ok ? a.pessoas : s.pessoas;
  const pessoasAntes = a.ok ? a.pessoasAntes : 0;
  const pessoasPorDia = a.ok ? a.porDia.map((d) => ({ data: d.data, valor: d.pessoas })) : s.porDia.map((d) => ({ data: d.data, valor: d.pessoas }));

  const oportunidades = g.buscas
    .filter((b) => b.posicao > 4 && b.posicao <= 25 && b.aparicoes >= 3)
    .sort((x, y) => y.aparicoes - x.aparicoes)
    .slice(0, 6);

  const periodos = [
    { valor: "7d", label: "7 dias" },
    { valor: "28d", label: "28 dias" },
    { valor: "90d", label: "90 dias" },
    { valor: "mes", label: "Este mês" },
  ];

  return (
    <div className="grid gap-6 max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-steel">Resultados</h1>
          <p className="text-steel-line text-sm mt-1">
            {dataBR(r.periodo.inicio)} a {dataBR(r.periodo.fim)} · comparado aos {r.periodo.dias} dias anteriores
          </p>
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
            <button type="submit" className="px-3 py-2 rounded-lg bg-card border border-card-line text-xs font-bold text-steel-line hover:text-verniz-shine">Ver</button>
          </form>
        </nav>
      </header>

      <AvisoConexao r={r} />

      {/* O caminho do cliente */}
      <section aria-labelledby="funil">
        <h2 id="funil" className="text-[11px] font-bold uppercase tracking-wider text-steel-line mb-3">O caminho do cliente até você</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Etapa
            icone={Search}
            titulo="Apareceu no Google"
            valor={g.aparicoes}
            atual={g.aparicoes}
            antes={g.aparicoesAntes}
            explicacao="Vezes que o site surgiu na tela de alguém que pesquisou no Google."
            indisponivel={g.ok ? undefined : "Ligue o Search Console para ver."}
            taxa={g.ok && g.posicao ? `posição média ${g.posicao.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}` : undefined}
          />
          <Etapa
            icone={MousePointerClick}
            titulo="Clicou no site"
            valor={g.cliques}
            atual={g.cliques}
            antes={g.cliquesAntes}
            explicacao="Pessoas que viram o site no Google e clicaram para entrar."
            indisponivel={g.ok ? undefined : "Ligue o Search Console para ver."}
            taxa={g.ok && g.aparicoes ? `${pct(g.cliques / g.aparicoes)} de quem viu clicou` : undefined}
          />
          <Etapa
            icone={Users}
            titulo="Visitou o site"
            valor={pessoas}
            atual={pessoas}
            antes={pessoasAntes}
            explicacao={a.ok ? "Pessoas diferentes que abriram o site, vindas de qualquer lugar (Google, Instagram, link direto)." : "Pessoas diferentes contadas pelo próprio site, já sem robôs e sem você."}
          />
          <Etapa
            icone={MessageCircle}
            titulo="Chamou ou agendou"
            valor={s.contatos}
            atual={s.contatos}
            antes={s.contatosAntes}
            explicacao={`Cliques em WhatsApp (${n(s.whatsapp)}), Agendar (${n(s.agendar)}) e formulários (${n(s.formularios)}).`}
            taxa={pessoas ? `${pct(s.contatos / pessoas)} das visitas viraram contato` : undefined}
          />
        </div>
        {s.legado && (
          <p className="text-xs text-steel-line mt-3">
            Neste período ainda há só dados antigos, que contavam também robôs e as suas visitas. A contagem limpa começou em 08/10/2026.
          </p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Cartao titulo="Pessoas no site por dia" sub={a.ok ? "Fonte: Google Analytics" : "Fonte: contagem do próprio site"}>
          <GraficoDiario pontos={pessoasPorDia} unidade="pessoas" />
        </Cartao>
        <Cartao titulo="Contatos por dia" sub="Cliques em WhatsApp, Agendar e formulários">
          <GraficoDiario pontos={s.porDia.map((d) => ({ data: d.data, valor: d.contatos }))} unidade="contatos" tipo="barras" cor="var(--cera)" />
        </Cartao>
      </div>

      {g.ok && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Cartao titulo="Aparições no Google por dia" sub="O Google leva 2 a 3 dias para mostrar os números mais recentes">
            <GraficoDiario pontos={g.porDia.map((d) => ({ data: d.data, valor: d.aparicoes }))} unidade="aparições" />
          </Cartao>
          <Cartao titulo="Cliques vindos do Google por dia" sub="Quantas dessas aparições viraram visita">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <Cartao titulo="Páginas que mais geram contato" sub="Visitas e cliques em WhatsApp/Agendar em cada página do site">
          {s.paginas.length === 0 ? (
            <p className="text-sm text-steel-line">Sem dados neste período.</p>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="w-full text-sm min-w-[360px]">
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
        <Cartao titulo="De onde vêm as pessoas" sub={a.ok ? "Fonte: Google Analytics" : "Fonte: contagem do próprio site (visitas)"}>
          <ListaBarras
            unidade={a.ok ? "pessoas" : "visitas"}
            itens={a.ok ? a.canais.map((c) => ({ nome: c.nome, valor: c.pessoas })) : s.origens.map((o) => ({ nome: o.nome, valor: o.visitas, extra: `${n(o.contatos)} contatos` }))}
          />
        </Cartao>
      </div>

      {a.ok && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Cartao titulo="Cidades dos visitantes" sub="Cidade aproximada de quem visitou">
            <ListaBarras unidade="pessoas" itens={a.cidades.map((c) => ({ nome: c.nome, valor: c.pessoas }))} />
          </Cartao>
          <Cartao titulo="Aparelho usado" sub="Celular ou computador">
            <ListaBarras unidade="pessoas" itens={a.aparelhos.map((c) => ({ nome: c.nome, valor: c.pessoas }))} />
          </Cartao>
        </div>
      )}

      <Cartao titulo="Últimos contatos pelo site" sub="Cada clique em WhatsApp, Agendar ou formulário">
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
                <span className="text-xs text-steel-line">{e.origem}</span>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      <p className="text-xs text-steel-line">
        Este navegador está marcado como seu e não entra nas contagens. Os números do Google são atualizados a cada 30 minutos.
      </p>
    </div>
  );
}
