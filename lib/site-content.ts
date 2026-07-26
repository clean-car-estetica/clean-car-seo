import { supabasePublico } from "@/lib/supabase";
import { CONTATO_PADRAO, type Contato } from "@/lib/config";

export type Promocao = { titulo: string; texto: string; regras: string };

export const PROMOCOES_PADRAO: Record<"cupom" | "indicacao", Promocao> = {
  cupom: {
    titulo: "Primeira vez na Clean Car?",
    texto: "Deixa seu contato e ganhe um desconto especial no primeiro serviço.",
    regras: "Válido para novos clientes, uma vez por CPF/veículo. Desconto informado no contato pelo WhatsApp.",
  },
  indicacao: {
    titulo: "Indique e ganhe",
    texto: "Compartilhe seu código com um amigo. Assim que ele fizer o primeiro serviço, você ganha 20 pontos de fidelidade.",
    regras: "Informe o código de quem te indicou no seu primeiro agendamento e ganhe 10 pontos de fidelidade, já usáveis nesse primeiro serviço.",
  },
};

export async function getPromocoes(): Promise<Record<"cupom" | "indicacao", Promocao>> {
  try {
    const { data, error } = await supabasePublico.from("promocoes").select("*");
    if (error) throw error;
    const resultado = { ...PROMOCOES_PADRAO };
    for (const row of data ?? []) {
      if (row.chave === "cupom" || row.chave === "indicacao") {
        resultado[row.chave as "cupom" | "indicacao"] = { titulo: row.titulo, texto: row.texto, regras: row.regras };
      }
    }
    return resultado;
  } catch {
    return PROMOCOES_PADRAO;
  }
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

export const TEMA_PADRAO: Tema = {
  carbon: "#03071e",
  carbonSoft: "#050a28",
  card: "#070d32",
  cardLine: "#16205c",
  verniz: "#22d3ee",
  vernizShine: "#67e8f9",
  cera: "#f2b544",
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
  titulo: "Clean Car | Estética Automotiva em Mogi das Cruzes e Alto Tietê",
  descricao: "Lavagem profissional, higienização, polimento, vitrificação e restauração. Produtos Vonixx, leva-e-trás e atendimento em toda região.",
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

export async function getContatoContent(): Promise<Contato> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "contato").single();
    if (!data?.data) return CONTATO_PADRAO;
    return { ...CONTATO_PADRAO, ...(data.data as Partial<Contato>) };
  } catch {
    return CONTATO_PADRAO;
  }
}

export type HeroContent = {
  titulo_parte1: string;
  titulo_destaque: string;
  subtitulo: string;
  badge_texto: string;
  imagem_url: string;
};

export const heroPadrao: HeroContent = {
  titulo_parte1: "Seu carro sai daqui com o",
  titulo_destaque: "brilho de zero-km.",
  subtitulo:
    "Lavagem, polimento técnico e vitrificação cerâmica no nosso estúdio em Mogi das Cruzes. Recebemos também clientes de Suzano, Poá, Ferraz de Vasconcelos e Itaquaquecetuba, sempre com hora marcada.",
  badge_texto: "Produtos Vonixx · Química Premium",
  imagem_url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1600&q=80",
};

export async function getHeroContent(): Promise<HeroContent> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "hero").single();
    if (!data?.data) return heroPadrao;
    return { ...heroPadrao, ...(data.data as Partial<HeroContent>) };
  } catch {
    return heroPadrao;
  }
}
