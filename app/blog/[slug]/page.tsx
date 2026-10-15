import { SITE_URL } from "@/lib/config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabasePublico } from "@/lib/supabase";
import { getServicosPublicos } from "@/lib/site-data";
import BlogArtigo, { type Post } from "@/components/BlogArtigo";

export const revalidate = 300;

async function getPost(slug: string): Promise<Post | null> {
  const { data } = await supabasePublico
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();
  return (data as Post) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.titulo,
    description: post.resumo,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
    openGraph: { type: "article", title: post.titulo, description: post.resumo },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, servicos, { data: outros }] = await Promise.all([
    getPost(slug),
    getServicosPublicos(),
    supabasePublico.from("blog_posts").select("slug, titulo").eq("status", "publicado").neq("slug", slug).order("publicado_em", { ascending: false }).limit(5),
  ]);
  if (!post) return notFound();
  return <BlogArtigo post={post} servicos={servicos} outros={outros ?? []} />;
}
