/**
 * Regras do teste "Qual cuidado o seu carro precisa?" (22/10/2026).
 *
 * O cliente marca TUDO o que quer resolver (pode ser mais de uma coisa) e o
 * teste monta a combinação de serviços, cada um com o motivo. As regras seguem
 * o que está cadastrado no SAS:
 *  - Bronze é só por fora; Prata limpa por dentro e por fora; Ouro é a mais
 *    completa (fica só a maior das lavagens escolhidas);
 *  - Higienização Interna VIP cobre todos os bancos, o teto e o carpete
 *    (não cobra banco a banco junto com ela);
 *  - Higienização, ozônio, cristalização, motor etc. são serviços à parte:
 *    o teste NÃO acrescenta lavagem sozinho (22/10/2026, Glauber — a lavagem
 *    é combinada na hora com o cliente, sem aviso formal no site);
 *  - Enceramento técnico precisa de Prata ou Ouro antes.
 *
 * Só funções puras: dá para testar (tests/quiz-cuidado.test.mts) e roda no
 * navegador sem salvar nada.
 */

export type Veiculo = "medio" | "grande" | "moto";

export type ProblemaId =
  | "sujo_fora" | "sujo_tudo" | "banco" | "encardido" | "cheiro" | "pelo"
  | "plastico_fora" | "plastico_dentro" | "couro" | "farol" | "vidro"
  | "rodas" | "motor" | "brilho" | "vender" | "sofa"
  | "moto_suja" | "moto_detalhe";

export const VEICULOS: [Veiculo, string][] = [
  ["medio", "Carro hatch ou sedan"],
  ["grande", "SUV, picape ou van"],
  ["moto", "Moto"],
];

export const PROBLEMAS_CARRO: [ProblemaId, string][] = [
  ["sujo_fora", "Sujo só por fora"],
  ["sujo_tudo", "Sujo por fora e por dentro"],
  ["banco", "Banco sujo ou manchado"],
  ["encardido", "Interior todo encardido (bancos, teto e carpete)"],
  ["cheiro", "Cheiro ruim dentro do carro"],
  ["pelo", "Pelo de cachorro ou gato"],
  ["plastico_fora", "Plástico de fora esbranquiçado (para-choque, retrovisor)"],
  ["plastico_dentro", "Painel e plásticos de dentro ressecados"],
  ["couro", "Banco de couro ressecado"],
  ["farol", "Farol amarelado ou fosco"],
  ["vidro", "Difícil enxergar pelo vidro na chuva"],
  ["rodas", "Rodas escuras de pó de freio ou caixa de roda com barro"],
  ["motor", "Motor sujo"],
  ["brilho", "Pintura sem brilho"],
  ["vender", "Vou vender o carro"],
  ["sofa", "Sofá ou estofado de casa"],
];

export const PROBLEMAS_MOTO: [ProblemaId, string][] = [
  ["moto_suja", "Moto suja"],
  ["moto_detalhe", "Bem suja, com graxa ou óleo no motor"],
];

/** Perguntas extras: só aparecem quando a resposta muda a indicação. */
export type Extras = { ultima?: "recente" | "muito"; bancos?: "um" | "dois" | "tras" | "todos"; cheiro?: "leve" | "forte" };

export const PERGUNTAS_EXTRAS: { chave: keyof Extras; quando: ProblemaId; titulo: string; opcoes: [string, string][] }[] = [
  {
    chave: "ultima", quando: "sujo_tudo", titulo: "Quando foi a última lavagem caprichada por dentro?",
    opcoes: [["recente", "Menos de 1 mês"], ["muito", "Mais de 1 mês ou não lembro"]],
  },
  {
    chave: "bancos", quando: "banco", titulo: "Quais bancos estão sujos ou manchados?",
    opcoes: [["um", "Um banco da frente"], ["dois", "Os dois da frente"], ["tras", "Só o banco de trás"], ["todos", "Os da frente e o de trás"]],
  },
  {
    chave: "cheiro", quando: "cheiro", titulo: "Como é o cheiro?",
    opcoes: [["leve", "Leve, ou vem do ar-condicionado"], ["forte", "Forte: mofo, cigarro, vômito ou xixi"]],
  },
];

/** Perguntas extras que valem para o que foi marcado, na ordem. */
export function extrasNecessarios(problemas: ProblemaId[]) {
  return PERGUNTAS_EXTRAS.filter((p) => problemas.includes(p.quando));
}

/** "Sujo só por fora" e "por fora e por dentro" não fazem sentido juntos: marcar um desmarca o outro. */
export function alternarProblema(atual: ProblemaId[], id: ProblemaId): ProblemaId[] {
  if (atual.includes(id)) return atual.filter((p) => p !== id);
  const exclusivos: Partial<Record<ProblemaId, ProblemaId>> = { sujo_fora: "sujo_tudo", sujo_tudo: "sujo_fora", moto_suja: "moto_detalhe", moto_detalhe: "moto_suja" };
  const rival = exclusivos[id];
  return [...atual.filter((p) => p !== rival), id];
}

export type ItemIndicado = { slug: string; qtd: number; motivo: string };
/** alternativa: outra combinação mais barata para o mesmo problema (ex.: só os bancos, sem teto e carpete). */
export type Indicacao = { itens: ItemIndicado[]; tambem: string[]; alternativa: { titulo: string; itens: ItemIndicado[] } | null };

const LAVAGENS = ["lavagem-bronze", "lavagem-prata", "lavagem-ouro"];

export function recomendar(veiculo: Veiculo, problemas: ProblemaId[], extras: Extras = {}): Indicacao {
  const itens = new Map<string, ItemIndicado>();
  const tambem: string[] = [];
  let alternativa: Indicacao["alternativa"] = null;
  const add = (slug: string, motivo: string, qtd = 1) => {
    const ja = itens.get(slug);
    if (ja) ja.qtd = Math.max(ja.qtd, qtd);
    else itens.set(slug, { slug, qtd, motivo });
  };

  if (veiculo === "moto") {
    if (problemas.includes("moto_detalhe")) add("lavagem-ouro-moto", "Limpa nos detalhes com pincel, tira óleo e graxa do motor e termina com selante que protege a pintura.");
    else add("lavagem-prata-moto", "Lavagem com espuma e shampoo neutro, rodas, pretinho nos pneus e cera na pintura.");
    return { itens: [...itens.values()], tambem, alternativa };
  }

  for (const p of problemas) {
    switch (p) {
      case "sujo_fora":
        add("lavagem-bronze", "Lava a carroceria, as rodas e as caixas de roda, com pretinho nos pneus. É só por fora: não inclui aspiração.");
        break;
      case "sujo_tudo":
        if (extras.ultima === "muito") add("lavagem-ouro", "Faz tempo da última limpeza por dentro: a Ouro limpa nos detalhes com pincel e aspiração premium, por dentro e por fora.");
        else add("lavagem-prata", "Limpa por dentro (aspiração, painel, portas e vidros) e por fora, com selante que protege a pintura e repele a água.");
        break;
      case "banco":
        if (extras.bancos === "dois") add("higienizacao-banco-dianteiro", "Higienização profunda dos dois bancos da frente, com extração e bactericida.", 2);
        else if (extras.bancos === "tras") add("higienizacao-banco-traseiro", "Higienização profunda do banco de trás, com extração e bactericida.");
        else if (extras.bancos === "todos") {
          add("higienizacao", "Com bancos da frente e de trás sujos, a Higienização Interna VIP limpa todos os bancos e ainda o teto, o carpete e o porta-malas.");
          alternativa = {
            titulo: "Se preferir só os bancos (sem teto e carpete)",
            itens: [
              { slug: "higienizacao-banco-dianteiro", qtd: 2, motivo: "Os dois bancos da frente." },
              { slug: "higienizacao-banco-traseiro", qtd: 1, motivo: "O banco de trás." },
            ],
          };
        } else add("higienizacao-banco-dianteiro", "Higienização profunda de um banco da frente, com extração e bactericida. Sai bem mais em conta que o interior completo.");
        break;
      case "encardido":
        add("higienizacao", "Limpeza profunda de todo o interior: bancos, teto, carpete e porta-malas com esfregação, bactericida e extração.");
        break;
      case "cheiro":
        if (extras.cheiro === "forte") {
          add("higienizacao", "Cheiro forte fica preso no tecido: a higienização tira a causa dos bancos, do teto e do carpete.");
          add("tratamento-anti-odor", "O ozônio finaliza higienizando os dutos do ar-condicionado e o interior.");
        } else add("tratamento-anti-odor", "O ozônio higieniza os dutos do ar-condicionado e o interior, eliminando bactérias e o cheiro.");
        break;
      case "pelo":
        add("lavagem-ouro", "A aspiração premium da Ouro tira o pelo dos bancos, do carpete e do porta-malas.");
        break;
      case "plastico_fora":
        add("revitalizacao-plastico-externo", "Devolve a cor preta do para-choque, retrovisores e frisos e protege do sol.");
        break;
      case "plastico_dentro":
        add("revitalizacao-plastico", "Limpa e devolve a cor do painel, console e portas, com proteção.");
        break;
      case "couro":
        add("hidratacao-de-couro", "Limpa e hidrata o couro, devolvendo a maciez e evitando rachaduras.");
        break;
      case "farol":
        add("restauracao-de-farol", "Tira o amarelado da lente e protege, sem precisar trocar o farol.");
        break;
      case "vidro":
        add("cristalizacao-de-vidros", "Faz a água escorrer do vidro e melhora a visão na chuva.");
        break;
      case "rodas":
        add("lavagem-pesada-de-rodas", "Remove o pó de freio impregnado e o barro das caixas de roda, sem desmontar.");
        break;
      case "motor":
        add("lavagem-motor", "Deixa o cofre do motor limpo e sem gordura, a seco, sem água sob pressão na parte elétrica.");
        break;
      case "brilho":
        add("enceramento-tecnico", "Cera de carnaúba com politriz: realça o brilho e protege a pintura do sol.");
        break;
      case "vender":
        add("lavagem-ouro", "Para as fotos do anúncio e a visita do comprador: a Ouro deixa o carro limpo nos detalhes, por dentro e por fora.");
        for (const s of ["restauracao-de-farol", "revitalizacao-plastico-externo", "enceramento-tecnico"]) tambem.push(s);
        break;
      case "sofa":
        add("higienizacao-de-estofados", "Higienização de sofá, poltrona ou colchão na sua casa. O valor sai na avaliação gratuita.");
        break;
    }
  }

  // Fica só a maior lavagem (Ouro inclui Prata, que inclui Bronze)
  const maior = [...LAVAGENS].reverse().find((l) => itens.has(l));
  for (const l of LAVAGENS) if (l !== maior) itens.delete(l);

  // A Higienização VIP já cobre todos os bancos
  if (itens.has("higienizacao")) {
    itens.delete("higienizacao-banco-dianteiro");
    itens.delete("higienizacao-banco-traseiro");
  }

  // Enceramento precisa de Prata ou Ouro antes
  if (itens.has("enceramento-tecnico") && !itens.has("lavagem-prata") && !itens.has("lavagem-ouro")) {
    itens.delete("lavagem-bronze");
    add("lavagem-prata", "O enceramento precisa de uma Lavagem Prata antes, para limpar bem a pintura.");
  }

  // Sugestões opcionais que já estão na lista principal não se repetem
  const tambemFinal = [...new Set(tambem)].filter((s) => !itens.has(s)).slice(0, 3);

  // Ordem: lavagem primeiro, depois o resto na ordem em que foi marcado
  const lista = [...itens.values()].sort((a, b) => Number(LAVAGENS.includes(b.slug)) - Number(LAVAGENS.includes(a.slug)));
  return { itens: lista, tambem: tambemFinal, alternativa };
}
