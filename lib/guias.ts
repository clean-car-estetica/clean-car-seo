import { supabasePublico } from "@/lib/supabase";

// Guias (15/10/2026): páginas escritas do jeito que as pessoas buscam.
// - "problema": /problemas/<slug> — "plástico do carro esbranquiçado"
// - "publico":  /para/<slug>      — "motorista de aplicativo"
// Cada uma aponta para os serviços que resolvem. Nascem como rascunho e só
// aparecem no site (e no sitemap) depois de publicadas no console.

export type TipoGuia = "problema" | "publico";

export type Guia = {
  slug: string;
  tipo: TipoGuia;
  titulo: string;
  titulo_seo: string;
  meta_descricao: string;
  chamada: string;
  intro: string;
  secoes: { titulo: string; texto: string }[];
  perguntas: { pergunta: string; resposta: string }[];
  servicos: string[];
  imagem_url: string | null;
  status: "rascunho" | "publicado";
  ordem: number;
  atualizado_em: string;
  publicado_em: string | null;
};

export const ROTA_GUIA: Record<TipoGuia, string> = { problema: "/problemas", publico: "/para" };
export const NOME_TIPO: Record<TipoGuia, string> = { problema: "Problemas e soluções", publico: "Para você" };

export const caminhoGuia = (g: Pick<Guia, "tipo" | "slug">) => `${ROTA_GUIA[g.tipo]}/${g.slug}`;

export async function getGuiaPublicada(tipo: TipoGuia, slug: string): Promise<Guia | null> {
  try {
    const { data } = await supabasePublico
      .from("guias")
      .select("*")
      .eq("tipo", tipo)
      .eq("slug", slug)
      .eq("status", "publicado")
      .maybeSingle();
    return (data as Guia) ?? null;
  } catch {
    return null;
  }
}

export async function getGuiasPublicadas(tipo?: TipoGuia): Promise<Guia[]> {
  try {
    let q = supabasePublico.from("guias").select("*").eq("status", "publicado");
    if (tipo) q = q.eq("tipo", tipo);
    const { data } = await q.order("ordem").order("titulo");
    return (data as Guia[]) ?? [];
  } catch {
    return [];
  }
}

/** Guias publicadas que indicam um serviço (para linkar a partir da página do serviço). */
export async function getGuiasDoServico(servicoSlug: string): Promise<Guia[]> {
  try {
    const { data } = await supabasePublico
      .from("guias")
      .select("slug, tipo, titulo, chamada, ordem")
      .eq("status", "publicado")
      .contains("servicos", [servicoSlug])
      .order("ordem")
      .limit(8);
    return (data as Guia[]) ?? [];
  } catch {
    return [];
  }
}

/** Quebra um texto em parágrafos (linha em branco) e listas (linhas com "- "). */
export function blocosDeTexto(texto: string): ({ tipo: "p"; texto: string } | { tipo: "ul"; itens: string[] })[] {
  return texto
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const linhas = b.split("\n").map((l) => l.trim());
      if (linhas.every((l) => /^[-•]\s+/.test(l))) {
        return { tipo: "ul" as const, itens: linhas.map((l) => l.replace(/^[-•]\s+/, "")) };
      }
      return { tipo: "p" as const, texto: linhas.join(" ") };
    });
}
