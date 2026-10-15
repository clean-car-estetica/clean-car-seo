import { SITE_URL } from "@/lib/config";
import type { MetadataRoute } from "next";
import { servicos } from "@/lib/data";
import { PAGINAS_LOCAIS } from "@/lib/paginas-locais";
import { supabasePublico } from "@/lib/supabase";
import { caminhoGuia, type TipoGuia } from "@/lib/guias";
import { MINIMO_RESPOSTA_INDEXAVEL } from "@/lib/perguntas";

const BASE_URL = SITE_URL;

// Data de referência da "última modificação" das páginas do site.
// Atualize quando fizer uma mudança grande de conteúdo.
const ULTIMA_ATUALIZACAO = new Date("2026-10-15");

// Base estática (páginas fixas, serviços e cidades) + o conteúdo publicado
// pelo console (guias, blog, perguntas). 15/10/2026: a parte do banco tem
// limite de 4 s — se o banco demorar, o sitemap sai só com a base estática,
// sem erro para o Google. 15/10/2026: gerado a cada leitura (antes ficava
// em cache e as guias/blog publicados demoravam a aparecer).
export const dynamic = "force-dynamic";

type Publicado = { url: string; lastModified: Date };

type Linhas = { data: unknown[] | null };

function comLimite(consulta: PromiseLike<Linhas>, ms = 4000): Promise<Linhas> {
  const vazio: Linhas = { data: null };
  return Promise.race([Promise.resolve(consulta).catch(() => vazio), new Promise<Linhas>((r) => setTimeout(() => r(vazio), ms))]);
}

async function conteudoPublicado(): Promise<Publicado[]> {
  const [guias, posts, perguntas] = await Promise.all([
    comLimite(supabasePublico.from("guias").select("slug, tipo, atualizado_em").eq("status", "publicado")),
    comLimite(supabasePublico.from("blog_posts").select("slug, publicado_em, atualizado_em").eq("status", "publicado")),
    comLimite(supabasePublico.from("perguntas_clientes").select("slug, resposta, respondido_em").eq("status", "publicada")),
  ]);
  const saida: Publicado[] = [];
  const g = (guias.data ?? []) as { slug: string; tipo: TipoGuia; atualizado_em: string }[];
  for (const x of g) saida.push({ url: `${BASE_URL}${caminhoGuia(x)}`, lastModified: new Date(x.atualizado_em) });
  if (g.some((x) => x.tipo === "problema")) saida.push({ url: `${BASE_URL}/problemas`, lastModified: new Date() });
  if (g.some((x) => x.tipo === "publico")) saida.push({ url: `${BASE_URL}/para`, lastModified: new Date() });

  const b = (posts.data ?? []) as { slug: string; publicado_em: string; atualizado_em: string | null }[];
  for (const x of b) saida.push({ url: `${BASE_URL}/blog/${x.slug}`, lastModified: new Date(x.atualizado_em || x.publicado_em) });
  if (b.length) saida.push({ url: `${BASE_URL}/blog`, lastModified: new Date() });

  const q = (perguntas.data ?? []) as { slug: string; resposta: string; respondido_em: string | null }[];
  const qIndexaveis = q.filter((x) => x.slug && (x.resposta ?? "").length >= MINIMO_RESPOSTA_INDEXAVEL);
  for (const x of qIndexaveis) saida.push({ url: `${BASE_URL}/perguntas/${x.slug}`, lastModified: new Date(x.respondido_em || Date.now()) });
  if (q.length) saida.push({ url: `${BASE_URL}/perguntas`, lastModified: new Date() });
  return saida;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entradas: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/orcamento`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/beneficios`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.6 },
    // 15/10/2026: /avaliar (formulário de NPS) e /blog (ainda sem artigos
    // publicados) saíram: páginas sem conteúdo o Google marca como
    // "rastreada, mas não indexada". O blog volta quando houver artigos.
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
  const slugs = new Set(servicos.map((s) => s.slug));
  for (const slug of slugs) {
    entradas.push({ url: `${BASE_URL}/servicos/${slug}`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.8 });
  }
  // 08/10/2026: páginas de cidade com texto próprio voltam a ser indexadas
  for (const p of PAGINAS_LOCAIS) {
    entradas.push({ url: `${BASE_URL}/servicos/${p.servico}/${p.cidade}`, lastModified: ULTIMA_ATUALIZACAO, changeFrequency: "monthly", priority: 0.7 });
  }

  for (const p of await conteudoPublicado()) {
    entradas.push({ url: p.url, lastModified: p.lastModified, changeFrequency: "monthly", priority: 0.6 });
  }

  return entradas;
}
