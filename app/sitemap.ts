import type { MetadataRoute } from "next";
import { supabasePublico } from "@/lib/supabase";
import { getServicosPublicos, getCidadesPublicas } from "@/lib/site-data";
import { servicos as servicosPadrao, cidades as cidadesPadrao } from "@/lib/data";

const BASE_URL = "https://clean-car-seo.vercel.app";

// Data usada como "última modificação" das páginas fixas do site. O Google
// passou a usar bastante essa informação (lastmod) desde que descontinuou
// o "ping" de sitemap em 2023 — atualize esta data quando fizer uma mudança
// grande de conteúdo no site.
const ULTIMA_ATUALIZACAO_GERAL = new Date("2026-07-29");

// O sitemap precisa responder rápido e de forma confiável pro Google conseguir
// lê-lo. Por isso cada consulta ao banco (serviços, cidades, posts do blog) tem
// um limite curto de tempo: se o banco demorar, usamos os dados fixos do código
// como reserva em vez de deixar o sitemap falhar por completo.
export const revalidate = 3600;

function comTimeout<T>(promessa: Promise<T>, ms: number, reserva: T): Promise<T> {
  return Promise.race([
    promessa,
    new Promise<T>((resolve) => setTimeout(() => resolve(reserva), ms)),
  ]);
}

type PostBlog = { slug: string; publicado_em: string };

async function buscarPostsDeBlog(): Promise<PostBlog[]> {
  try {
    const controlador = new AbortController();
    const timeout = setTimeout(() => controlador.abort(), 3000);
    const { data } = await supabasePublico
      .from("blog_posts")
      .select("slug, publicado_em")
      .eq("status", "publicado")
      .abortSignal(controlador.signal);
    clearTimeout(timeout);
    return (data ?? []) as PostBlog[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [servicos, cidades, postsBlog] = await Promise.all([
    comTimeout(getServicosPublicos(), 3000, servicosPadrao as any),
    comTimeout(getCidadesPublicas(), 3000, cidadesPadrao as any),
    buscarPostsDeBlog(),
  ]);

  const entradas: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: ULTIMA_ATUALIZACAO_GERAL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/orcamento`, lastModified: ULTIMA_ATUALIZACAO_GERAL, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/beneficios`, lastModified: ULTIMA_ATUALIZACAO_GERAL, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/avaliar`, lastModified: ULTIMA_ATUALIZACAO_GERAL, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/blog`, lastModified: ULTIMA_ATUALIZACAO_GERAL, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: ULTIMA_ATUALIZACAO_GERAL, changeFrequency: "monthly", priority: 0.6 },
  ];

  for (const s of servicos) {
    entradas.push({ url: `${BASE_URL}/servicos/${s.slug}`, lastModified: ULTIMA_ATUALIZACAO_GERAL, changeFrequency: "monthly", priority: 0.8 });
    for (const c of cidades) {
      entradas.push({ url: `${BASE_URL}/servicos/${s.slug}/${c.slug}`, lastModified: ULTIMA_ATUALIZACAO_GERAL, changeFrequency: "monthly", priority: 0.7 });
    }
  }

  for (const post of postsBlog) {
    entradas.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.publicado_em ? new Date(post.publicado_em) : ULTIMA_ATUALIZACAO_GERAL,
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  return entradas;
}
