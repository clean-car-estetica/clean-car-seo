import { SITE_URL } from "@/lib/config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import WhatsappCTA from "@/components/WhatsappCTA";
import { supabasePublico } from "@/lib/supabase";
import Midia from "@/components/Midia";

export const revalidate = 60;

async function getPost(slug: string) {
  const { data } = await supabasePublico
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.titulo,
    description: post.resumo,
    alternates: { canonical: `${SITE_URL}/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return notFound();

  return (
    <>
      <Header />
      <main data-editar="blog" className="flex-1 pt-20">
        {post.imagem_url && (
          <div className="relative h-72 overflow-hidden">
            <Midia src={post.imagem_url} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-carbon/30 to-carbon/90" />
          </div>
        )}
        <section className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-steel mb-6">{post.titulo}</h1>
          <div className="text-steel-line leading-relaxed whitespace-pre-line">{post.conteudo}</div>
          <div className="flex flex-wrap gap-3 mt-10">
            <AgendarButton className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
              Agendar horário
            </AgendarButton>
            <WhatsappCTA />
          </div>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
