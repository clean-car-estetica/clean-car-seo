import { supabasePublico } from "@/lib/supabase";
import { servicos as servicosPadrao } from "@/lib/data";

export type ServicoDB = {
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  duracao: string | null;
  preco_desde: number | null;
  imagem_url: string;
  tag: string | null;
};

export async function getServicosPublicos(): Promise<ServicoDB[]> {
  try {
    const { data, error } = await supabasePublico.from("services").select("*").order("nome");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data as ServicoDB[];
  } catch {
    // Fallback: dados fixos do código, usados até a tabela ser populada no console
    return servicosPadrao.map((s) => ({
      slug: s.slug,
      nome: s.nome,
      resumo: s.resumo,
      descricao: s.descricao,
      duracao: s.duracao ?? null,
      preco_desde: s.precoDesde ?? null,
      imagem_url: s.imagem,
      tag: s.tag ?? null,
    }));
  }
}

export async function getServicoPublico(slug: string): Promise<ServicoDB | null> {
  const todos = await getServicosPublicos();
  return todos.find((s) => s.slug === slug) ?? null;
}

export type Transformacao = {
  id: number;
  titulo: string;
  descricao: string;
  imagem_antes: string;
  imagem_depois: string;
};

const transformacoesPadrao: Transformacao[] = [
  {
    id: -1,
    titulo: "Correção de verniz e espelhamento",
    descricao: "Eliminamos hologramas e micro-riscos causados por lavagens incorretas, revelando o brilho real da pintura.",
    imagem_antes: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=700&q=80",
    imagem_depois: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: -2,
    titulo: "Recuperação de plásticos e frisos",
    descricao: "Acabamentos ressecados pelo sol voltam à cor original com revitalizadores de alta durabilidade.",
    imagem_antes: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80",
    imagem_depois: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=700&q=80",
  },
];

export async function getConteudoLocalPublico(servico: ServicoDB, cidade: { slug: string; bairros: string[]; sede: boolean }) {
  try {
    const { data, error } = await supabasePublico
      .from("local_pages_content")
      .select("*")
      .eq("service_slug", servico.slug)
      .eq("city_slug", cidade.slug)
      .maybeSingle();
    if (error) throw error;
    if (data?.paragrafos?.length) {
      return { paragrafos: data.paragrafos as string[], imagemOverride: data.imagem_url as string | null };
    }
  } catch {
    // sem override — usa o template padrão abaixo
  }
  const { getConteudoLocal } = await import("@/lib/content");
  const template = getConteudoLocal(
    {
      slug: servico.slug,
      nome: servico.nome,
      resumo: servico.resumo,
      descricao: servico.descricao,
      duracao: servico.duracao ?? undefined,
      precoDesde: servico.preco_desde ?? undefined,
      imagem: servico.imagem_url,
      tag: servico.tag ?? undefined,
    },
    cidade as any
  );
  return { paragrafos: template.paragrafos, imagemOverride: null as string | null };
}

export async function getTransformacoesPublicas(): Promise<Transformacao[]> {
  try {
    const { data, error } = await supabasePublico.from("transformacoes").select("*").order("ordem");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data as Transformacao[];
  } catch {
    return transformacoesPadrao;
  }
}
