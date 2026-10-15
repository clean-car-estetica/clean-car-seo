export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import GuiaPagina from "@/components/GuiaPagina";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getServicosPublicos } from "@/lib/site-data";
import type { Guia } from "@/lib/guias";

export const metadata = { title: "Prévia", robots: { index: false, follow: false } };

// Prévia de rascunho: exatamente como vai ficar no site (só o dono vê — /admin exige login)
export default async function PreviaGuia({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ data }, servicos, { data: todas }] = await Promise.all([
    supabaseAdmin.from("guias").select("*").eq("slug", slug).maybeSingle(),
    getServicosPublicos(),
    supabaseAdmin.from("guias").select("slug, tipo, titulo, chamada").eq("status", "publicado").limit(8),
  ]);
  if (!data) notFound();
  const guia = data as Guia;
  return <GuiaPagina guia={guia} servicos={servicos} outras={(todas ?? []).filter((g) => g.slug !== slug)} previa />;
}
