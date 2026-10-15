import { supabasePublico } from "@/lib/supabase";

// Perguntas que os visitantes mandam pelo site (15/10/2026). O dono responde
// no console; as publicadas viram página própria em /perguntas/<slug>.
// Nome e WhatsApp de quem perguntou ficam em outra tabela, nunca públicos.

export type PerguntaPublica = {
  id: number;
  slug: string;
  titulo: string | null;
  pergunta: string;
  resposta: string;
  servico_slug: string | null;
  respondido_em: string | null;
};

/** Resposta curta demais vira página "fina": fica no ar, mas fora do Google. */
export const MINIMO_RESPOSTA_INDEXAVEL = 280;

export const tituloPergunta = (p: Pick<PerguntaPublica, "titulo" | "pergunta">) => (p.titulo || p.pergunta).trim();

const COLUNAS = "id, slug, titulo, pergunta, resposta, servico_slug, respondido_em";

export async function getPerguntasPublicadas(): Promise<PerguntaPublica[]> {
  try {
    const { data } = await supabasePublico
      .from("perguntas_clientes")
      .select(COLUNAS)
      .eq("status", "publicada")
      .order("respondido_em", { ascending: false });
    return (data as PerguntaPublica[]) ?? [];
  } catch {
    return [];
  }
}

export async function getPerguntaPublicada(slug: string): Promise<PerguntaPublica | null> {
  try {
    const { data } = await supabasePublico
      .from("perguntas_clientes")
      .select(COLUNAS)
      .eq("status", "publicada")
      .eq("slug", slug)
      .maybeSingle();
    return (data as PerguntaPublica) ?? null;
  } catch {
    return null;
  }
}
