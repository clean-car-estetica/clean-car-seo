import { supabasePublico } from "@/lib/supabase";
import { servicos as servicosPadrao, cidades as cidadesPadrao } from "@/lib/data";

export type CidadeDB = {
  slug: string;
  nome: string;
  bairros: string[];
  sede: boolean;
};

export async function getCidadesPublicas(): Promise<CidadeDB[]> {
  try {
    const { data, error } = await supabasePublico.from("cities").select("*").order("nome");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data as CidadeDB[];
  } catch {
    return cidadesPadrao;
  }
}

export async function getCidadePublica(slug: string): Promise<CidadeDB | null> {
  const todas = await getCidadesPublicas();
  return todas.find((c) => c.slug === slug) ?? null;
}

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

export type FaqDB = { id: number; pergunta: string; resposta: string };

const faqsPadrao: FaqDB[] = [
  {
    id: -1,
    pergunta: "A vitrificação protege contra riscos profundos?",
    resposta:
      "Não. A vitrificação protege contra micro-riscos de lavagem, raios UV e sujeira do dia a dia, além de dar um brilho intenso. Riscos profundos (que chegam na tinta) ainda podem acontecer em caso de impacto forte.",
  },
  {
    id: -2,
    pergunta: "O polimento tira muito verniz da pintura?",
    resposta:
      "Fazemos o polimento técnico, medindo a espessura da tinta para remover só o necessário pra tirar o risco, preservando ao máximo a vida útil do verniz.",
  },
  {
    id: -3,
    pergunta: "Preciso deixar o carro na loja o dia todo?",
    resposta:
      "Depende do serviço. Uma higienização geralmente leva algumas horas. Polimento e vitrificação pedem mais tempo de cura — no agendamento a gente já informa o prazo certo.",
  },
  {
    id: -4,
    pergunta: "O que é hidrofobia e por que ela protege o carro?",
    resposta:
      "Hidrofobia é a propriedade que faz a água escorregar da pintura ou do vidro em vez de grudar. Com produtos Vonixx como Hidrox e Glasy, conseguimos essa repelência — o que reduz manchas de chuva ácida, facilita a limpeza e ajuda a manter a proteção da pintura por mais tempo.",
  },
];

export async function getFaqsPublicos(): Promise<FaqDB[]> {
  try {
    const { data, error } = await supabasePublico.from("faqs").select("*").order("ordem");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data as FaqDB[];
  } catch {
    return faqsPadrao;
  }
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
