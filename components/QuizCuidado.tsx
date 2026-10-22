"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContato } from "@/components/ContatoProvider";
import { whatsappLink } from "@/lib/config";
import { obterOrigem, registrarEvento } from "@/lib/track";
import { gtagEvent } from "@/lib/gtag";
import { SERVICOS_COM_ACRESCIMO_PORTE } from "@/lib/data";
import {
  VEICULOS, PROBLEMAS_CARRO, PROBLEMAS_MOTO, alternarProblema, extrasNecessarios, recomendar,
  type Veiculo, type ProblemaId, type Extras, type ItemIndicado,
} from "@/lib/quiz-cuidado";

// "Qual cuidado o seu carro precisa?" — 22/10/2026: o cliente marca tudo o
// que quer resolver (mais de uma coisa) e o teste monta a combinação de
// serviços reais, cada um com o motivo, preço "a partir de" e o WhatsApp já
// com o resultado. Regras em lib/quiz-cuidado.ts. Nada é salvo.

export type ServicoQuiz = { slug: string; nome: string; preco: number | null; duracao: string | null };

const GUIA_POR_PROBLEMA: Partial<Record<ProblemaId, string[]>> = {
  sujo_fora: ["/problemas/carro-suja-rapido-depois-de-lavar"],
  banco: ["/problemas/banco-do-carro-manchado-de-cafe"],
  cheiro: ["/problemas/cheiro-de-cigarro-no-carro", "/problemas/carro-com-cheiro-de-mofo"],
  pelo: ["/problemas/pelo-de-cachorro-no-carro"],
  farol: ["/problemas/farol-amarelado"],
  plastico_fora: ["/problemas/plastico-do-carro-esbranquicado"],
  couro: ["/problemas/banco-de-couro-ressecado"],
  vidro: ["/problemas/chuva-acida-no-vidro-do-carro"],
  rodas: ["/problemas/rodas-sujas-de-po-de-freio"],
  brilho: ["/problemas/pintura-do-carro-sem-brilho"],
  vender: ["/para/vai-vender-o-carro"],
};

const botao = (ativo: boolean) =>
  `text-left rounded-2xl border px-5 py-4 font-display font-bold text-lg transition-colors ${
    ativo ? "border-verniz bg-verniz/10 text-verniz-shine" : "border-card-line bg-card text-steel hover:border-verniz"
  }`;

export default function QuizCuidado({ servicos, guiasPublicadas }: { servicos: ServicoQuiz[]; guiasPublicadas: string[] }) {
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [problemas, setProblemas] = useState<ProblemaId[]>([]);
  const [extras, setExtras] = useState<Extras>({});
  const [passo, setPasso] = useState(0); // 0 veículo · 1 problemas · 2.. extras · fim = resultado
  const contato = useContato();
  const pathname = usePathname();
  const porSlug = useMemo(() => new Map(servicos.map((s) => [s.slug, s])), [servicos]);

  const perguntasExtras = veiculo === "moto" ? [] : extrasNecessarios(problemas);
  const totalPassos = 2 + perguntasExtras.length;
  const noResultado = passo >= totalPassos;
  const opcoesProblema = veiculo === "moto" ? PROBLEMAS_MOTO : PROBLEMAS_CARRO;

  // Só serviços que existem e estão ativos no catálogo (vindos do SAS)
  const res = useMemo(() => {
    if (!noResultado || !veiculo) return null;
    const r = recomendar(veiculo, problemas, extras);
    const existe = (i: ItemIndicado) => porSlug.has(i.slug);
    return {
      itens: r.itens.filter(existe),
      tambem: r.tambem.filter((s) => porSlug.has(s)),
      alternativa: r.alternativa && r.alternativa.itens.every(existe) ? r.alternativa : null,
    };
  }, [noResultado, veiculo, problemas, extras, porSlug]);

  const fator = (slug: string) => (veiculo === "grande" && SERVICOS_COM_ACRESCIMO_PORTE.includes(slug) ? 1.25 : 1);
  const precoItem = (i: ItemIndicado) => Number(porSlug.get(i.slug)?.preco ?? 0) * fator(i.slug) * i.qtd;
  const total = (lista: ItemIndicado[]) => lista.reduce((t, i) => t + precoItem(i), 0);
  const nomeItem = (i: ItemIndicado) => `${i.qtd > 1 ? `${i.qtd}x ` : ""}${porSlug.get(i.slug)?.nome ?? i.slug}`;
  const temSobAvaliacao = (lista: ItemIndicado[]) => lista.some((i) => !porSlug.get(i.slug)?.preco);

  const rotuloVeiculo = VEICULOS.find(([v]) => v === veiculo)?.[1] ?? "";
  const rotulosProblemas = problemas.map((p) => opcoesProblema.find(([id]) => id === p)?.[1]).filter(Boolean) as string[];
  const mensagem = res
    ? `Olá! Vim pelo site da Clean Car e fiz o teste "Qual cuidado meu carro precisa?". Marquei: ${rotulosProblemas.join("; ")}. Deu: ${res.itens.map(nomeItem).join(" + ")}. Veículo: ${rotuloVeiculo}. Pode me passar o valor e um horário?`
    : "";

  function escolherVeiculo(v: Veiculo) {
    if (v !== veiculo) { setProblemas([]); setExtras({}); }
    setVeiculo(v);
    setPasso(1);
  }

  function continuarProblemas() {
    if (!problemas.length) return;
    setPasso(2);
    if (veiculo === "moto" || extrasNecessarios(problemas).length === 0) concluir(problemas);
  }

  function escolherExtra(chave: keyof Extras, valor: string, idx: number) {
    setExtras((e) => ({ ...e, [chave]: valor }));
    setPasso(2 + idx + 1);
    if (idx === perguntasExtras.length - 1) concluir(problemas);
  }

  function concluir(lista: ProblemaId[]) {
    gtagEvent("quiz_concluido", { problema: lista.join(","), veiculo: veiculo ?? "" });
  }

  function refazer() {
    setVeiculo(null); setProblemas([]); setExtras({}); setPasso(0);
  }

  function cliqueWhatsapp() {
    registrarEvento("click_whatsapp", pathname, { origem: obterOrigem(), detalhe: "quiz" });
    gtagEvent("click_whatsapp", { page_path: pathname, origem_botao: "quiz" });
  }

  const guias = res ? [...new Set(problemas.flatMap((p) => GUIA_POR_PROBLEMA[p] ?? []))].filter((g) => guiasPublicadas.includes(g)).slice(0, 3) : [];

  const titulo = (n: number, texto: string, sub?: string) => (
    <legend className="font-display font-bold text-2xl md:text-3xl text-steel text-balance mb-4">
      <span className="block text-sm text-steel-line font-sans font-normal mb-1">Pergunta {n} de {totalPassos}</span>
      {texto}
      {sub && <span className="block text-base text-steel-line font-sans font-normal mt-1">{sub}</span>}
    </legend>
  );
  const voltar = (para: number) => (
    <button type="button" onClick={() => setPasso(para)} className="justify-self-start text-sm font-bold text-steel-line hover:underline">← Voltar</button>
  );

  return (
    <div className="grid gap-6">
      <ol className="flex gap-2" aria-label="Progresso">
        {Array.from({ length: totalPassos }, (_, i) => (
          <li key={i} className={`h-1.5 flex-1 rounded-full ${i < passo ? "bg-verniz" : i === passo ? "bg-verniz/40" : "bg-card-line"}`} />
        ))}
      </ol>

      {passo === 0 && (
        <fieldset className="grid gap-4">
          {titulo(1, "Qual é o veículo?")}
          <div className="grid sm:grid-cols-3 gap-3">
            {VEICULOS.map(([v, rotulo]) => (
              <button key={v} type="button" onClick={() => escolherVeiculo(v)} aria-pressed={veiculo === v} className={botao(veiculo === v)}>{rotulo}</button>
            ))}
          </div>
        </fieldset>
      )}

      {passo === 1 && (
        <fieldset className="grid gap-4">
          {titulo(2, veiculo === "moto" ? "Como está a moto?" : "O que você quer resolver?", veiculo === "moto" ? undefined : "Pode marcar mais de um.")}
          <div className="grid sm:grid-cols-2 gap-3">
            {opcoesProblema.map(([id, rotulo]) => {
              const marcado = problemas.includes(id);
              return (
                <button key={id} type="button" onClick={() => setProblemas((p) => alternarProblema(p, id))} aria-pressed={marcado} className={`${botao(marcado)} flex items-start gap-3`}>
                  <span aria-hidden className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${marcado ? "border-verniz bg-verniz text-carbon" : "border-card-line"}`}>{marcado ? "✓" : ""}</span>
                  <span>{rotulo}</span>
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={continuarProblemas} disabled={!problemas.length}
              className="rounded-full bg-verniz text-carbon font-display font-bold text-lg px-7 py-3 hover:bg-verniz-shine disabled:opacity-40 disabled:cursor-not-allowed">
              {problemas.length ? `Continuar (${problemas.length} marcado${problemas.length > 1 ? "s" : ""})` : "Marque pelo menos um"}
            </button>
            {voltar(0)}
          </div>
        </fieldset>
      )}

      {perguntasExtras.map((p, idx) =>
        passo === 2 + idx ? (
          <fieldset key={p.chave} className="grid gap-4">
            {titulo(3 + idx, p.titulo)}
            <div className="grid sm:grid-cols-2 gap-3">
              {p.opcoes.map(([valor, rotulo]) => (
                <button key={valor} type="button" onClick={() => escolherExtra(p.chave, valor, idx)} aria-pressed={extras[p.chave] === valor} className={botao(extras[p.chave] === valor)}>{rotulo}</button>
              ))}
            </div>
            {voltar(passo - 1)}
          </fieldset>
        ) : null
      )}

      {res && (
        <section aria-live="polite" className="grid gap-6">
          <div className="rounded-3xl border border-verniz bg-card p-6 md:p-8 grid gap-5">
            <p className="font-display font-bold text-verniz-shine tracking-[0.2em] uppercase text-sm">
              {veiculo === "moto" ? "A sua moto precisa de" : "O seu carro precisa de"}
            </p>
            {res.itens.length === 0 ? (
              <p className="text-steel">Não encontrei um serviço certo para isso no catálogo agora. Mande uma mensagem que a gente indica.</p>
            ) : (
              <ul className="grid gap-4">
                {res.itens.map((i) => {
                  const sv = porSlug.get(i.slug)!;
                  return (
                    <li key={i.slug} className="grid gap-1 border-b border-card-line pb-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <Link href={`/servicos/${i.slug}`} className="font-display font-extrabold text-2xl md:text-3xl text-steel hover:text-verniz-shine">
                          {nomeItem(i)}
                        </Link>
                        <span className="text-steel-line tabular-nums">
                          {sv.preco ? `a partir de R$ ${Math.round(precoItem(i))}` : "sob avaliação"}
                          {sv.duracao ? ` · ${sv.duracao}${i.qtd > 1 ? " cada" : ""}` : ""}
                        </span>
                      </div>
                      <p className="text-steel-line leading-relaxed">{i.motivo}</p>
                    </li>
                  );
                })}
              </ul>
            )}
            {res.itens.length > 1 && (
              <p className="font-display font-bold text-xl text-steel tabular-nums">
                Tudo junto: a partir de R$ {Math.round(total(res.itens))}
                {temSobAvaliacao(res.itens) ? <span className="text-sm text-steel-line font-sans font-normal"> + o que for sob avaliação</span> : null}
                {veiculo === "grande" ? <span className="text-sm text-steel-line font-sans font-normal"> (valor aproximado para SUV/picape)</span> : null}
              </p>
            )}
            {res.alternativa && (
              <p className="text-sm text-steel-line">
                {res.alternativa.titulo}: {res.alternativa.itens.map(nomeItem).join(" + ")} — a partir de R$ {Math.round(total(res.alternativa.itens))}.
              </p>
            )}
            {res.tambem.length > 0 && (
              <div className="grid gap-2">
                <p className="text-sm text-steel-line">Também ajuda a vender mais rápido:</p>
                <div className="flex flex-wrap gap-2">
                  {res.tambem.map((s) => {
                    const sv = porSlug.get(s)!;
                    return (
                      <Link key={s} href={`/servicos/${s}`} className="rounded-full border border-card-line px-4 py-1.5 text-sm text-steel hover:border-verniz">
                        {sv.nome}{sv.preco ? ` · R$ ${Math.round(Number(sv.preco) * fator(s))}` : ""}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-sm text-steel-line">Valores de referência. O valor final sai na avaliação gratuita, olhando o carro.</p>
            <div className="flex flex-wrap gap-3">
              <a href={whatsappLink(contato, mensagem)} target="_blank" rel="noopener noreferrer" onClick={cliqueWhatsapp}
                className="rounded-full bg-verniz text-carbon font-display font-bold text-lg px-7 py-3 hover:bg-verniz-shine">
                Mandar o resultado no WhatsApp
              </a>
              <button type="button" onClick={() => setPasso(1)} className="rounded-full border border-card-line px-6 py-3 font-display font-bold text-steel hover:border-verniz">
                Mudar o que marquei
              </button>
              <button type="button" onClick={refazer} className="rounded-full border border-card-line px-6 py-3 font-display font-bold text-steel-line hover:border-verniz">
                Refazer o teste
              </button>
            </div>
          </div>
          {guias.length > 0 && (
            <p className="text-sm text-steel-line">
              Quer entender melhor?{" "}
              {guias.map((g, i) => (
                <span key={g}>
                  {i > 0 ? " · " : ""}
                  <Link href={g} className="text-verniz-shine underline underline-offset-2">Leia o guia</Link>
                </span>
              ))}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
