import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import { supabasePublico } from "@/lib/supabase";

export const revalidate = 60;

export const metadata = {
  title: "Blog",
  description: "Dicas de cuidado automotivo da Clean Car Estética Automotiva.",
  alternates: { canonical: "https://clean-car-seo.vercel.app/blog" },
};

export default async function BlogIndex() {
  const { data: posts } = await supabasePublico
    .from("blog_posts")
    .select("slug, titulo, resumo, imagem_url, publicado_em")
    .eq("status", "publicado")
    .order("publicado_em", { ascending: false });

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-5xl px-6 py-20">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">Blog</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-steel mb-10">
            Dicas de cuidado automotivo
          </h1>

          {(!posts || posts.length === 0) && (
            <p className="text-steel-line">Estamos preparando o primeiro conteúdo — volte em breve.</p>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts?.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl bg-card border border-card-line overflow-hidden hover:border-verniz/60 transition-colors"
              >
                {p.imagem_url && (
                  <div className="h-40 overflow-hidden">
                    <img src={p.imagem_url} alt={p.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-display font-bold text-lg text-steel group-hover:text-verniz-shine">{p.titulo}</h2>
                  <p className="mt-2 text-sm text-steel-line leading-relaxed">{p.resumo}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
