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
    titulo: "Indique um amigo",
    texto: "Indique um amigo pra Clean Car: ele ganha 10 pontos de fidelidade, já usáveis no primeiro serviço, e você ganha 20 pontos assim que o serviço dele for concluído.",
    regras: "Pontos de fidelidade Clean Car. O indicado usa os 10 pontos já no primeiro serviço; o indicador recebe os 20 pontos após a conclusão do serviço do indicado.",
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
