import { SITE_URL } from "@/lib/config";
import type { MetadataRoute } from "next";
import { servicos } from "@/lib/data";

const BASE_URL = SITE_URL;

// Data de referência da "última modificação" das páginas do site.
// Atualize quando fizer uma mudança grande de conteúdo.
const ULTIMA_ATUALIZACAO = new Date("2026-10-07");

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
    { url: `${BASE_URL}/sobre`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contato`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.6 },
  ];

  // 07/10/2026: só as páginas fortes. As combinações serviço × cidade e
  // serviço × bairro (mais de 400 páginas quase iguais) saíram do sitemap:
  // o Google não indexava ("rastreada, mas não indexada") e elas puxavam a
  // avaliação do site para baixo. Os bairros agora redirecionam para a
  // página do serviço; as cidades ficam acessíveis, mas sem indexar,
  // a menos que tenham texto próprio cadastrado em Páginas locais.
  for (const s of servicos) {
    entradas.push({ url: `${BASE_URL}/servicos/${s.slug}`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.8 });
  }

  return entradas;
}
