import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GuiaPagina from "@/components/GuiaPagina";
import { SITE_URL } from "@/lib/config";
import { caminhoGuia, getGuiaPublicada, getGuiasPublicadas, type TipoGuia } from "@/lib/guias";
import { getServicosPublicos } from "@/lib/site-data";

// Lógica compartilhada das rotas /problemas/<slug> e /para/<slug>.

export async function metadataGuia(tipo: TipoGuia, slug: string): Promise<Metadata> {
  const guia = await getGuiaPublicada(tipo, slug);
  if (!guia) return {};
  const titulo = guia.titulo_seo || `${guia.titulo} | Clean Car Mogi das Cruzes`;
  const descricao = guia.meta_descricao || guia.intro.slice(0, 155);
  return {
    title: { absolute: titulo },
    description: descricao,
    alternates: { canonical: `${SITE_URL}${caminhoGuia(guia)}` },
    openGraph: { title: titulo, description: descricao, type: "article" },
  };
}

export async function PaginaGuiaPublica({ tipo, slug }: { tipo: TipoGuia; slug: string }) {
  const [guia, servicos, todas] = await Promise.all([
    getGuiaPublicada(tipo, slug),
    getServicosPublicos(),
    getGuiasPublicadas(),
  ]);
  if (!guia) notFound();
  // "Veja também": primeiro as que dividem um serviço com esta, depois as do mesmo tipo
  const outras = todas
    .filter((g) => !(g.tipo === guia.tipo && g.slug === guia.slug))
    .map((g) => ({ g, peso: (g.servicos.some((s) => guia.servicos.includes(s)) ? 2 : 0) + (g.tipo === guia.tipo ? 1 : 0) }))
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 8)
    .map(({ g }) => g);
  return <GuiaPagina guia={guia} servicos={servicos} outras={outras} />;
}
