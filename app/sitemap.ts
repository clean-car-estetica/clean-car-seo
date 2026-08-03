import type { MetadataRoute } from "next";
import { servicos, cidades } from "@/lib/data";
import { slugify } from "@/lib/slug";

const BASE_URL = "https://clean-car-seo.vercel.app";

// Data de referência da "última modificação" das páginas do site.
// Atualize quando fizer uma mudança grande de conteúdo.
const ULTIMA_ATUALIZACAO = new Date("2026-08-03");

// Sitemap 100% estático (sem nenhuma consulta a banco de dados) — resposta
// instantânea e confiável, sem risco de timeout na leitura do Google.
// Cidades/serviços novos criados só pelo console entram aqui no próximo deploy.
export const revalidate = false;

export default function sitemap(): MetadataRoute.Sitemap {
  const entradas: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/orcamento`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/beneficios`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/avaliar`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/blog`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/faq`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/mogi-das-cruzes`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.85 },
  ];

  for (const s of servicos) {
    entradas.push({ url: `${BASE_URL}/servicos/${s.slug}`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.8 });
    for (const c of cidades) {
      entradas.push({ url: `${BASE_URL}/servicos/${s.slug}/${c.slug}`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.7 });
      if (c.sede) {
        for (const bairro of c.bairros) {
          entradas.push({
            url: `${BASE_URL}/servicos/${s.slug}/${c.slug}/${slugify(bairro)}`,
            lastModified: ULTIMA_ATUALIZACAO,
            changeFrequency: "monthly",
            priority: 0.65,
          });
        }
      }
    }
  }

  return entradas;
}
