export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import BlogArtigo, { type Post } from "@/components/BlogArtigo";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getServicosPublicos } from "@/lib/site-data";

export const metadata = { title: "Prévia", robots: { index: false, follow: false } };

export default async function PreviaPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [{ data }, servicos] = await Promise.all([
    supabaseAdmin.from("blog_posts").select("*").eq("slug", slug).maybeSingle(),
    getServicosPublicos(),
  ]);
  if (!data) notFound();
  return <BlogArtigo post={data as Post} servicos={servicos} outros={[]} previa />;
}
