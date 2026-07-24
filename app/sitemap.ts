import type { MetadataRoute } from "next";
import { supabasePublico } from "@/lib/supabase";
import { getServicosPublicos, getCidadesPublicas } from "@/lib/site-data";

const BASE_URL = "https://clean-car-seo.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [servicos, cidades] = await Promise.all([getServicosPublicos(), getCidadesPublicas()]);

  const entradas: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
  ];

  for (const s of servicos) {
    entradas.push({ url: `${BASE_URL}/servicos/${s.slug}`, changeFrequency: "monthly", priority: 0.8 });
    for (const c of cidades) {
      entradas.push({ url: `${BASE_URL}/servicos/${s.slug}/${c.slug}`, changeFrequency: "monthly", priority: 0.7 });
    }
  }

  try {
    const { data: posts } = await supabasePublico.from("blog_posts").select("slug").eq("status", "publicado");
    for (const p of posts ?? []) {
      entradas.push({ url: `${BASE_URL}/blog/${p.slug}`, changeFrequency: "monthly", priority: 0.5 });
    }
  } catch {
    // sem posts ainda, tudo bem
  }

  return entradas;
}
