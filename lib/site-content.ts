import { FOTO_HERO, fotoHero, VIDEO_HERO, VIDEO_HERO_CELULAR } from "@/lib/fotos";
// Só o TIPO aqui: este arquivo também é usado no navegador (PromoProvider/TextosProvider),
// e gbr-sync carrega o cliente Supabase com chave de servidor. O código entra por import dinâmico.
import type { ContatoSincronizado } from "@/lib/gbr-sync";
import { supabasePublico } from "@/lib/supabase";
import { CONTATO_PADRAO, type Contato } from "@/lib/config";

export type Promocao = { titulo: string; texto: string; regras: string; ativo: boolean };

export const PROMOCOES_PADRAO: Record<"cupom" | "indicacao", Promocao> = {
  cupom: {
    titulo: "Primeira vez na Clean Car?",
    texto: "Deixa seu contato e ganhe um desconto especial no primeiro serviço.",
    regras: "Válido para novos clientes, uma vez por CPF/veículo. Desconto informado no contato pelo WhatsApp.",
    ativo: true,
  },
  indicacao: {
    titulo: "Indique e ganhe",
    texto: "Compartilhe seu código com um amigo. Assim que ele fizer o primeiro serviço, você ganha 20 pontos de fidelidade.",
    regras: "Informe o código de quem te indicou no seu primeiro agendamento e ganhe 10 pontos de fidelidade, já usáveis nesse primeiro serviço.",
    ativo: true,
  },
};

/**
 * 18/10/2026: o que o site mostra. Com a integração do SAS ligada, os pontos
 * do Indique e Ganhe são os do SAS (os textos continuam os do console).
 */
export async function getPromocoes(): Promise<Record<"cupom" | "indicacao", Promocao>> {
  const promocoes = await getPromocoesDoConsole();
  try {
    const { getProgramaFidelidadeSas, pontosNoTexto } = await import("@/lib/gbr-sync");
    const ind = (await getProgramaFidelidadeSas())?.indicacao;
    if (!ind) return promocoes;
    const i = promocoes.indicacao;
    return {
      ...promocoes,
      indicacao: {
        ...i,
        texto: pontosNoTexto(i.texto, ind.pontosIndicador, "pontos_indicador"),
        regras: pontosNoTexto(i.regras, ind.pontosIndicado, "pontos_indicado"),
      },
    };
  } catch {
    return promocoes;
  }
}

/** Como está cadastrado no console, sem os números do SAS (é o que o console edita). */
export async function getPromocoesDoConsole(): Promise<Record<"cupom" | "indicacao", Promocao>> {
  try {
    const { data, error } = await supabasePublico.from("promocoes").select("*");
    if (error) throw error;
    const resultado = { ...PROMOCOES_PADRAO };
    for (const row of data ?? []) {
      if (row.chave === "cupom" || row.chave === "indicacao") {
        resultado[row.chave as "cupom" | "indicacao"] = {
          titulo: row.titulo,
          texto: row.texto,
          regras: row.regras,
          ativo: row.ativo ?? true,
        };
      }
    }
    return resultado;
  } catch {
    return PROMOCOES_PADRAO;
  }
}

/** Uma campanha cadastrada na agenda do console */
export type CampanhaItem = {
  id: string;
  /** Pausada = false (fica na agenda mas não aparece) */
  ativo: boolean;
  titulo: string;
  /** Selo grande, ex.: "20% OFF" */
  selo: string;
  texto: string;
  /** Letra miúda (aparece com * no site e em negrito no WhatsApp) */
  observacao: string;
  /** Serviço da campanha, ex.: "Higienização Interna VIP" (vai na mensagem do WhatsApp) */
  servico: string;
  preco_de: number | null;
  preco_por: number | null;
  /** Primeiro e último dia (AAAA-MM-DD). Vazio = sem limite. */
  inicia_em: string | null;
  termina_em: string | null;
  imagem_url: string | null;
  texto_botao: string;
  /** Vazio = WhatsApp com a mensagem da campanha */
  link_botao: string;
  /** Vazio = mensagem montada sozinha com nome, preço, validade e observação */
  mensagem_whatsapp: string;
};

/** Campanha que o site mostra agora (ou vazia) */
export type Campanha = CampanhaItem & { /** true quando há uma campanha valendo hoje */ ativo: boolean };

export const CAMPANHA_VAZIA: CampanhaItem = {
  id: "",
  ativo: false,
  titulo: "",
  selo: "",
  texto: "",
  observacao: "",
  servico: "",
  preco_de: null,
  preco_por: null,
  inicia_em: null,
  termina_em: null,
  imagem_url: null,
  texto_botao: "Quero aproveitar",
  link_botao: "",
  mensagem_whatsapp: "",
};

/** Data de hoje em São Paulo, AAAA-MM-DD */
export function hojeSP(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

/** Dias de hoje até a data (0 = hoje; negativo = já passou) */
export function diasAte(data: string | null): number | null {
  if (!data) return null;
  const ms = Date.parse(data + "T00:00:00Z") - Date.parse(hojeSP() + "T00:00:00Z");
  return Math.round(ms / 86400000);
}

export type SituacaoCampanha = "no_ar" | "agendada" | "encerrada" | "pausada";

export function situacaoCampanha(c: CampanhaItem, hoje = hojeSP()): SituacaoCampanha {
  if (!c.ativo) return "pausada";
  if (c.termina_em && c.termina_em < hoje) return "encerrada";
  if (c.inicia_em && c.inicia_em > hoje) return "agendada";
  return "no_ar";
}

/**
 * 18/10/2026: a próxima campanha agendada (a que começa primeiro), para o
 * site anunciar "Vem aí" — o Glauber programa a campanha do mês seguinte.
 * Só as que começam em até 60 dias, para não anunciar coisa distante.
 */
export function campanhaProxima(lista: CampanhaItem[], hoje = hojeSP()): CampanhaItem | null {
  const limite = new Date(Date.parse(hoje + "T00:00:00Z") + 60 * 86_400_000).toISOString().slice(0, 10);
  const proximas = lista
    .filter((c) => situacaoCampanha(c, hoje) === "agendada" && c.inicia_em! <= limite)
    .sort((a, b) => (a.inicia_em ?? "").localeCompare(b.inicia_em ?? ""));
  return proximas[0] ?? null;
}

/** A campanha valendo hoje. Se houver mais de uma, a que começou por último. */
export function campanhaDeHoje(lista: CampanhaItem[]): Campanha {
  const hoje = hojeSP();
  const valendo = lista
    .filter((c) => situacaoCampanha(c, hoje) === "no_ar")
    .sort((a, b) => (b.inicia_em ?? "").localeCompare(a.inicia_em ?? ""));
  return valendo[0] ? { ...valendo[0], ativo: true } : { ...CAMPANHA_VAZIA, ativo: false };
}


export type Tema = {
  carbon: string;
  carbonSoft: string;
  card: string;
  cardLine: string;
  verniz: string;
  vernizShine: string;
  cera: string;
};

// 08/10/2026: padrão "Escuro sóbrio" (quase preto, azul discreto). O painel
// (/admin/tema) tem os prontos e permite trocar.
export const TEMA_PADRAO: Tema = {
  carbon: "#05070c",
  carbonSoft: "#0a0d14",
  card: "#0f131c",
  cardLine: "#1d2433",
  verniz: "#2bb3cf",
  vernizShine: "#6fd0e3",
  cera: "#d9a441",
};

export async function getTema(): Promise<Tema> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "tema").single();
    if (!data?.data) return TEMA_PADRAO;
    return { ...TEMA_PADRAO, ...(data.data as Partial<Tema>) };
  } catch {
    return TEMA_PADRAO;
  }
}

export type Metadados = {
  titulo: string;
  descricao: string;
  palavrasChave: string;
};

export const METADADOS_PADRAO: Metadados = {
  titulo: "Clean Car | Lava-Rápido e Estética Automotiva em Mogi das Cruzes",
  descricao: "Lavagem profissional, higienização, enceramento e restauração. Produtos Vonixx e atendimento em toda região.",
  palavrasChave:
    "lava rapido Mogi das Cruzes, lava-rápido Mogi das Cruzes, estetica automotiva Mogi das Cruzes, limpeza de carro Mogi das Cruzes, lavagem de carro Mogi das Cruzes, proteção de pintura Mogi das Cruzes, higienização Mogi das Cruzes, higienização de banco Mogi das Cruzes, Alto Tietê, Suzano, Poá, Ferraz de Vasconcelos, Itaquaquecetuba, Guararema",
};

export async function getMetadados(): Promise<Metadados> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "metadados").single();
    if (!data?.data) return METADADOS_PADRAO;
    return { ...METADADOS_PADRAO, ...(data.data as Partial<Metadados>) };
  } catch {
    return METADADOS_PADRAO;
  }
}

export type TextosGerais = {
  footerTagline: string;
  footerLojaLabel: string;
  footerRecebemos: string;
  homeCidadesTitulo: string;
  homeCidadesSubtitulo: string;
  homeServicosTitulo: string;
  homeServicosSubtitulo: string;
  navServicos: string;
  navPlanos: string;
  navFaq: string;
  navIndicacao: string;
  navBeneficios: string;
  navContato: string;
  navBlog: string;
  navBotaoAgendar: string;
  navMogi: string;
  navSobre: string;
  faqTitulo: string;
  faqSubtitulo: string;
  beneficiosTitulo: string;
  beneficiosSubtitulo: string;
  orcamentoTitulo: string;
  orcamentoSubtitulo: string;
  avaliarTitulo: string;
  avaliarSubtitulo: string;
  avaliarSucessoTitulo: string;
  labelNome: string;
  labelWhatsapp: string;
};

export const TEXTOS_PADRAO: TextosGerais = {
  footerTagline: "Loja física em Mogi das Cruzes, atendendo também clientes da região do Alto Tietê. Química Vonixx, hora marcada.",
  footerLojaLabel: "Loja",
  footerRecebemos: "Recebemos clientes de Suzano, Poá, Ferraz de Vasconcelos e Itaquaquecetuba",
  homeCidadesTitulo: "Nossa loja fica em Mogi das Cruzes",
  homeCidadesSubtitulo: "Recebemos também clientes de toda a região do Alto Tietê, sempre com hora marcada.",
  homeServicosTitulo: "Catálogo de serviços",
  homeServicosSubtitulo: "Química Vonixx, do dia a dia à proteção de longa duração.",
  navServicos: "Serviços e preços",
  navPlanos: "Planos",
  navFaq: "FAQ",
  navIndicacao: "Indique e ganhe",
  navBeneficios: "Benefícios",
  navContato: "Contato",
  navBlog: "Blog",
  navBotaoAgendar: "Agendar",
  navMogi: "Mogi das Cruzes",
  navSobre: "Sobre Nós",
  faqTitulo: "Tudo que você precisa saber",
  faqSubtitulo: "Dúvidas frequentes",
  beneficiosTitulo: "Benefícios e pontos",
  beneficiosSubtitulo: "A cada serviço você acumula pontos de fidelidade. Troque por descontos ou serviços grátis.",
  orcamentoTitulo: "Peça seu orçamento",
  orcamentoSubtitulo: "Prefere não abrir o WhatsApp agora? Deixa seus dados que a gente te chama.",
  avaliarTitulo: "Como foi seu atendimento?",
  avaliarSubtitulo: "De 0 a 10, o quanto você recomendaria a Clean Car pra um amigo?",
  avaliarSucessoTitulo: "Valeu pelo feedback! 🙌",
  labelNome: "Seu nome",
  labelWhatsapp: "WhatsApp com DDD",
};

export async function getTextosGerais(): Promise<TextosGerais> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "textos").single();
    if (!data?.data) return TEXTOS_PADRAO;
    return { ...TEXTOS_PADRAO, ...(data.data as Partial<TextosGerais>) };
  } catch {
    return TEXTOS_PADRAO;
  }
}

export type Sobre = { titulo: string; texto: string };

const SOBRE_PADRAO: Sobre = {
  titulo: "Sobre a Clean Car",
  texto:
    "A Clean Car nasceu em Mogi das Cruzes com um objetivo simples: fazer o carro sair de lá parecendo novo, com o cuidado técnico que a lataria e o interior realmente merecem. Não trabalhamos só com lavagem — cuidamos de cada etapa, do pré-lavagem ao acabamento final, sempre com produtos Vonixx, o que hoje é referência de qualidade no mercado de estética automotiva.\n\nAtendemos clientes de Mogi das Cruzes e de toda a região do Alto Tietê (Suzano, Poá, Ferraz de Vasconcelos, Itaquaquecetuba e Guararema), sempre com horário marcado — sem fila, sem surpresa no prazo.\n\nMais do que deixar o carro limpo, nosso trabalho é proteger o investimento que ele representa: pintura, plásticos, estofados e vidros, tratados com a técnica certa pra durar.",
};

export async function getSobre(): Promise<Sobre> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "sobre").single();
    if (!data?.data) return SOBRE_PADRAO;
    return { ...SOBRE_PADRAO, ...(data.data as Partial<Sobre>) };
  } catch {
    return SOBRE_PADRAO;
  }
}

/** Contato como digitado no console, sem nada do SAS (usado pelo próprio console). */
export async function getContatoDoConsole(): Promise<Contato> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "contato").single();
    if (!data?.data) return CONTATO_PADRAO;
    return { ...CONTATO_PADRAO, ...(data.data as Partial<Contato>) };
  } catch {
    return CONTATO_PADRAO;
  }
}

// 17/10/2026: horário, feriados e leva e traz vêm do GBR SAS quando a
// integração está ligada (lib/gbr-sync.ts) — o site para de depender de
// alguém lembrar de mudar nos dois lugares.
export async function getContatoContent(): Promise<ContatoSincronizado<Contato>> {
  const { aplicarFuncionamentoSas } = await import("@/lib/gbr-sync");
  return aplicarFuncionamentoSas(await getContatoDoConsole());
}

export type HeroContent = {
  titulo_parte1: string;
  titulo_destaque: string;
  subtitulo: string;
  badge_texto: string;
  imagem_url: string;
  /** "video" (padrão) ou "imagem" — escolhido no painel */
  tipo_midia: "video" | "imagem";
  /** Vídeo do computador (horizontal) */
  video_url: string;
  /** Vídeo do celular (vertical). Vazio = usa o do computador */
  video_mobile_url: string;
};

export const heroPadrao: HeroContent = {
  titulo_parte1: "Seu carro sai daqui com o",
  titulo_destaque: "brilho de zero-km.",
  subtitulo:
    "Lavagem, higienização e enceramento na nossa loja em Mogi das Cruzes. Recebemos também clientes de Suzano, Poá, Ferraz de Vasconcelos e Itaquaquecetuba, sempre com hora marcada.",
  badge_texto: "Produtos Vonixx · Química Premium",
  imagem_url: FOTO_HERO,
  tipo_midia: "video",
  video_url: VIDEO_HERO,
  video_mobile_url: VIDEO_HERO_CELULAR,
};

export async function getHeroContent(): Promise<HeroContent> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "hero").single();
    if (!data?.data) return heroPadrao;
    const hero = { ...heroPadrao, ...(data.data as Partial<HeroContent>) };
    return { ...hero, imagem_url: fotoHero(hero.imagem_url) };
  } catch {
    return heroPadrao;
  }
}

// Vídeo de cliente (depoimento gravado na retirada do carro). Fica pronto no
// site e só aparece quando o console marca "Publicado" (autorização da cliente).
export type VideoCliente = { publicado: boolean };

// 22/10/2026 (Glauber): o "Vem aí" (próxima campanha agendada) virou opção.
// Desligado = o site mostra só a campanha valendo na data. Padrão: desligado.
export type ConfigCampanhas = { mostrarVemAi: boolean };
export async function getConfigCampanhas(): Promise<ConfigCampanhas> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "campanhas_config").maybeSingle();
    return { mostrarVemAi: (data?.data as Partial<ConfigCampanhas> | undefined)?.mostrarVemAi === true };
  } catch {
    return { mostrarVemAi: false };
  }
}

export async function getVideoCliente(): Promise<VideoCliente> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "video_cliente").maybeSingle();
    return { publicado: Boolean((data?.data as Partial<VideoCliente> | undefined)?.publicado) };
  } catch {
    return { publicado: false };
  }
}
