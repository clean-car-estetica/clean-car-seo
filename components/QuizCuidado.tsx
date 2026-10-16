"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContato } from "@/components/ContatoProvider";
import { whatsappLink } from "@/lib/config";
import { obterOrigem, registrarEvento } from "@/lib/track";
import { gtagEvent } from "@/lib/gtag";
import { SERVICOS_COM_ACRESCIMO_PORTE } from "@/lib/data";

// "Qual cuidado o seu carro precisa?" (15/10/2026): 4 perguntas rápidas e uma
// recomendação com os serviços reais, preço "a partir de" e o WhatsApp já com
// o resultado na mensagem. Nada é salvo: tudo roda no navegador.

export type ServicoQuiz = { slug: string; nome: string; preco: number | null; duracao: string | null };

type Resposta = { incomoda?: string; uso?: string; ultima?: string; onde?: string; porte?: string };

const PERGUNTAS: { chave: keyof Resposta; titulo: string; opcoes: [string, string][] }[] = [
  {
    chave: "incomoda",
    titulo: "O que mais incomoda no carro hoje?",
    opcoes: [
      ["sujo", "Está sujo por fora"],
      ["interior", "Banco sujo ou manchado"],
      ["cheiro", "Cheiro ruim por dentro"],
      ["farol", "Farol amarelado ou fosco"],
      ["plastico", "Plástico esbranquiçado"],
      ["vidro", "Vidro manchado, ruim na chuva"],
      ["vender", "Vou vender o carro"],
      ["manter", "Nada, quero manter em dia"],
    ],
  },
  {
    chave: "uso",
    titulo: "Como você usa o carro?",
    opcoes: [
      ["diario", "Todo dia (trabalho ou aplicativo)"],
      ["familia", "Com crianças"],
      ["pet", "Levo cachorro ou gato"],
      ["fds", "Mais no fim de semana"],
    ],
  },
  {
    chave: "ultima",
    titulo: "Quando foi a última lavagem caprichada?",
    opcoes: [
      ["recente", "Menos de 15 dias"],
      ["mes", "Mais ou menos 1 mês"],
      ["muito", "Mais de 2 meses"],
      ["nunca", "Não lembro"],
    ],
  },
  {
    chave: "onde",
    titulo: "Onde o carro fica parado?",
    opcoes: [
      ["coberto", "Garagem ou lugar coberto"],
      ["sol", "Na rua, no sol e na chuva"],
    ],
  },
  {
    chave: "porte",
    titulo: "Qual o tamanho do carro?",
    opcoes: [
      ["medio", "Hatch ou sedan"],
      ["grande", "SUV, picape ou van"],
    ],
  },
];

const GUIA_POR_PROBLEMA: Record<string, string[]> = {
  sujo: ["/problemas/carro-suja-rapido-depois-de-lavar"],
  interior: ["/problemas/banco-do-carro-manchado-de-cafe"],
  cheiro: ["/problemas/cheiro-de-cigarro-no-carro", "/problemas/carro-com-cheiro-de-mofo"],
  farol: ["/problemas/farol-amarelado"],
  plastico: ["/problemas/plastico-do-carro-esbranquicado"],
  vidro: ["/problemas/chuva-acida-no-vidro-do-carro"],
  vender: ["/para/vai-vender-o-carro"],
};

function recomendar(r: Required<Resposta>) {
  const sujeira = r.ultima === "muito" || r.ultima === "nunca";
  const lavagem = sujeira ? "lavagem-ouro" : r.onde === "sol" || r.ultima === "mes" ? "lavagem-prata" : "lavagem-bronze";
  const principal: string[] = [];
  const extra: string[] = [];
  let porque = "";

  switch (r.incomoda) {
    case "sujo":
      principal.push(lavagem);
      porque =
        lavagem === "lavagem-ouro"
          ? "Faz tempo da última lavagem caprichada: a Ouro limpa nos detalhes, por dentro e por fora, e termina com proteção."
          : lavagem === "lavagem-prata"
            ? "A Prata limpa por dentro e por fora e termina com um selante que repele água e sujeira, então o carro fica limpo por mais tempo."
            : "Com lavagem recente, a Bronze resolve a manutenção de forma rápida e econômica.";
      break;
    case "interior":
      if (sujeira || r.uso === "pet") {
        principal.push("higienizacao");
        porque = "A Higienização Interna VIP limpa a fundo bancos, carpete e teto e trata o ar-condicionado. É a mais indicada quando a sujeira já está impregnada.";
      } else {
        principal.push(r.uso === "familia" ? "higienizacao-banco-traseiro" : "higienizacao-banco-dianteiro");
        porque = "Para mancha em um banco, a higienização daquele banco resolve e sai bem mais em conta que o interior completo.";
      }
      break;
    case "cheiro":
      if (sujeira || r.uso === "pet") {
        principal.push("higienizacao", "tratamento-anti-odor");
        porque = "O cheiro costuma estar preso no tecido, no carpete e no ar-condicionado. Limpar tudo e tratar a cabine é o que tira de vez.";
      } else {
        principal.push("tratamento-anti-odor");
        porque = "Para cheiro leve, o Tratamento Anti-Odor ataca a causa e purifica o ar da cabine em cerca de 1 hora.";
      }
      break;
    case "farol":
      principal.push("restauracao-de-farol");
      porque = "A restauração remove o amarelado da lente e aplica proteção UV, sem precisar trocar o farol.";
      break;
    case "plastico":
      principal.push("revitalizacao-plastico-externo");
      porque = "O sol resseca o plástico. A revitalização devolve a cor escura e protege contra novos raios UV.";
      break;
    case "vidro":
      principal.push("cristalizacao-de-vidros");
      porque = "A cristalização remove as manchas de chuva ácida e faz a água escorrer sozinha, melhorando a visão na chuva.";
      break;
    case "vender":
      principal.push("lavagem-ouro", "restauracao-de-farol", "revitalizacao-plastico-externo");
      porque = "É o que mais muda a cara do carro na foto do anúncio: limpeza completa, farol transparente e plástico preto.";
      break;
    default:
      principal.push(r.uso === "diario" ? "lavagem-bronze" : "lavagem-prata");
      porque =
        r.uso === "diario"
          ? "Para quem roda todo dia, uma Lavagem Bronze por semana mantém o carro sempre apresentável."
          : "Uma Lavagem Prata a cada 15 ou 30 dias mantém o carro limpo e protegido.";
  }

  // Complementos (opcionais) pelo uso e pelo lugar onde o carro fica
  const tem = (s: string) => principal.includes(s);
  const temLavagem = principal.some((s) => s.startsWith("lavagem-"));
  if (!temLavagem && ["interior", "cheiro", "farol", "plastico", "vidro"].includes(r.incomoda)) extra.push(lavagem === "lavagem-bronze" ? "lavagem-prata" : lavagem);
  if (r.onde === "sol" && !tem("revitalizacao-plastico-externo") && r.incomoda !== "vender") extra.push("revitalizacao-plastico-externo");
  if (r.uso === "pet" && !tem("tratamento-anti-odor")) extra.push("tratamento-anti-odor");

  const frequencia =
    r.uso === "diario"
      ? "Depois, para manter: uma lavagem a cada 1 ou 2 semanas."
      : r.uso === "fds"
        ? "Depois, para manter: uma lavagem por mês costuma bastar."
        : "Depois, para manter: uma lavagem a cada 15 dias.";

  return { principal, extra: extra.slice(0, 2), porque, frequencia };
}

export default function QuizCuidado({ servicos, guiasPublicadas }: { servicos: ServicoQuiz[]; guiasPublicadas: string[] }) {
  const [r, setR] = useState<Resposta>({});
  const [passo, setPasso] = useState(0);
  const contato = useContato();
  const pathname = usePathname();
  const porSlug = useMemo(() => new Map(servicos.map((s) => [s.slug, s])), [servicos]);
  const completo = PERGUNTAS.every((p) => r[p.chave]);
  const res = completo ? recomendar(r as Required<Resposta>) : null;

  function escolher(chave: keyof Resposta, valor: string) {
    const novo = { ...r, [chave]: valor };
    setR(novo);
    const idx = PERGUNTAS.findIndex((p) => p.chave === chave);
    if (idx < PERGUNTAS.length - 1) setPasso(idx + 1);
    else {
      setPasso(PERGUNTAS.length);
      gtagEvent("quiz_concluido", { problema: novo.incomoda, uso: novo.uso });
    }
  }

  const linha = (slug: string) => porSlug.get(slug);
  // Acréscimo de 25% para carro grande só nos serviços que têm acréscimo
  // (lavagens, higienizações e vidros); os demais têm valor fixo (16/10/2026).
  const fator = (slug: string) => (r.porte === "grande" && SERVICOS_COM_ACRESCIMO_PORTE.includes(slug) ? 1.25 : 1);
  const total = (lista: string[]) => lista.reduce((t, s) => t + Number(linha(s)?.preco ?? 0) * fator(s), 0);
  const nomes = (lista: string[]) => lista.map((s) => linha(s)?.nome).filter(Boolean).join(" + ");

  const mensagem = res
    ? `Olá! Vim pelo site da Clean Car e fiz o teste "Qual cuidado meu carro precisa?". Deu: ${nomes(res.principal)}${res.extra.length ? ` (e talvez ${nomes(res.extra)})` : ""}. Meu carro é ${r.porte === "grande" ? "SUV/picape" : "hatch/sedan"}. Pode me passar o valor e um horário?`
    : "";

  function cliqueWhatsapp() {
    registrarEvento("click_whatsapp", pathname, { origem: obterOrigem(), detalhe: "quiz" });
    gtagEvent("click_whatsapp", { page_path: pathname, origem_botao: "quiz" });
  }

  const guias = res ? (GUIA_POR_PROBLEMA[r.incomoda ?? ""] ?? []).filter((g) => guiasPublicadas.includes(g)) : [];

  return (
    <div className="grid gap-6">
      {/* Progresso */}
      <ol className="flex gap-2" aria-label="Progresso">
        {PERGUNTAS.map((p, i) => (
          <li key={p.chave} className={`h-1.5 flex-1 rounded-full ${i < passo || (i === passo && r[p.chave]) ? "bg-verniz" : i === passo ? "bg-verniz/40" : "bg-card-line"}`} />
        ))}
      </ol>

      {PERGUNTAS.map((p, i) =>
        i === passo ? (
          <fieldset key={p.chave} className="grid gap-4">
            <legend className="font-display font-bold text-2xl md:text-3xl text-steel text-balance mb-4">
              <span className="block text-sm text-steel-line font-sans font-normal mb-1">
                Pergunta {i + 1} de {PERGUNTAS.length}
              </span>
              {p.titulo}
            </legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {p.opcoes.map(([valor, rotulo]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => escolher(p.chave, valor)}
                  aria-pressed={r[p.chave] === valor}
                  className={`text-left rounded-2xl border px-5 py-4 font-display font-bold text-lg transition-colors ${
                    r[p.chave] === valor ? "border-verniz bg-verniz/10 text-verniz-shine" : "border-card-line bg-card text-steel hover:border-verniz"
                  }`}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            {i > 0 && (
              <button type="button" onClick={() => setPasso(i - 1)} className="justify-self-start text-sm font-bold text-steel-line hover:underline">
                ← Voltar
              </button>
            )}
          </fieldset>
        ) : null
      )}

      {res && passo === PERGUNTAS.length && (
        <section aria-live="polite" className="grid gap-6">
          <div className="rounded-3xl border border-verniz bg-card p-6 md:p-8 grid gap-5">
            <p className="font-display font-bold text-verniz-shine tracking-[0.2em] uppercase text-sm">O seu carro precisa de</p>
            <ul className="grid gap-3">
              {res.principal.map((s) => {
                const sv = linha(s);
                if (!sv) return null;
                return (
                  <li key={s} className="flex flex-wrap items-baseline justify-between gap-3 border-b border-card-line pb-3">
                    <Link href={`/servicos/${s}`} className="font-display font-extrabold text-2xl md:text-3xl text-steel hover:text-verniz-shine">
                      {sv.nome}
                    </Link>
                    <span className="text-steel-line tabular-nums">
                      {sv.preco ? `a partir de R$ ${Math.round(Number(sv.preco) * fator(s))}` : "sob avaliação"}
                      {sv.duracao ? ` · ${sv.duracao}` : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="text-steel leading-relaxed">{res.porque}</p>
            {res.principal.length > 1 && (
              <p className="font-display font-bold text-xl text-steel tabular-nums">
                Juntos: a partir de R$ {Math.round(total(res.principal))}
                {res.principal.some((s) => fator(s) > 1) ? <span className="text-sm text-steel-line font-sans font-normal"> (valor aproximado para SUV/picape)</span> : null}
              </p>
            )}
            {res.extra.length > 0 && (
              <div className="grid gap-2">
                <p className="text-sm text-steel-line">Também vale considerar:</p>
                <div className="flex flex-wrap gap-2">
                  {res.extra.map((s) => {
                    const sv = linha(s);
                    return sv ? (
                      <Link key={s} href={`/servicos/${s}`} className="rounded-full border border-card-line px-4 py-1.5 text-sm text-steel hover:border-verniz">
                        {sv.nome}
                        {sv.preco ? ` · R$ ${Math.round(Number(sv.preco) * fator(s))}` : ""}
                      </Link>
                    ) : null;
                  })}
                </div>
              </div>
            )}
            <p className="text-sm text-steel-line">{res.frequencia} Valores de referência; o valor final sai na avaliação gratuita.</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={whatsappLink(contato, mensagem)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={cliqueWhatsapp}
                className="rounded-full bg-verniz text-carbon font-display font-bold text-lg px-7 py-3 hover:bg-verniz-shine"
              >
                Mandar o resultado no WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  setR({});
                  setPasso(0);
                }}
                className="rounded-full border border-card-line px-6 py-3 font-display font-bold text-steel hover:border-verniz"
              >
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
                  <Link href={g} className="text-verniz-shine underline underline-offset-2">
                    Leia o guia
                  </Link>
                </span>
              ))}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
