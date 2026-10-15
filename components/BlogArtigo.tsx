import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import WhatsappCTA from "@/components/WhatsappCTA";
import Midia from "@/components/Midia";
import TextoRico from "@/components/TextoRico";
import ServicosIndicados from "@/components/ServicosIndicados";
import { SITE_URL } from "@/lib/config";
import type { ServicoDB } from "@/lib/site-data";

export type Post = {
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  imagem_url: string | null;
  publicado_em: string;
  atualizado_em?: string | null;
  servicos?: string[] | null;
  status: string;
};

// Artigo do blog — usado no site e na prévia do console.
export default function BlogArtigo({
  post,
  servicos,
  outros,
  previa = false,
}: {
  post: Post;
  servicos: ServicoDB[];
  outros: Pick<Post, "slug" | "titulo">[];
  previa?: boolean;
}) {
  const indicados = (post.servicos ?? [])
    .map((s) => servicos.find((x) => x.slug === s))
    .filter((s): s is ServicoDB => Boolean(s));
  const data = new Date(post.publicado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

  return (
    <>
      {previa && (
        <div className="fixed top-0 inset-x-0 z-50 bg-warn text-carbon text-center text-sm font-bold py-1.5">
          Prévia do rascunho — ainda não está no site
        </div>
      )}
      <Header />
      <main data-editar="blog" className="flex-1 pt-20">
        {post.imagem_url && (
          <div className="relative h-72 overflow-hidden">
            <Midia src={post.imagem_url} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-carbon/30 to-carbon/90" />
          </div>
        )}
        <article className="mx-auto max-w-2xl px-6 py-16">
          <nav aria-label="Você está em" className="text-sm text-steel-line mb-5">
            <Link href="/" className="hover:text-verniz-shine">Início</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-verniz-shine">Blog</Link>
          </nav>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-steel mb-4 text-balance">{post.titulo}</h1>
          <p className="text-sm text-steel-line mb-8">Clean Car Estética Automotiva · {data}</p>
          <p className="text-xl text-steel leading-relaxed mb-8">{post.resumo}</p>
          <TextoRico texto={post.conteudo} />
          <div className="flex flex-wrap gap-3 mt-10">
            <AgendarButton
              servico={indicados[0]?.nome}
              className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors"
            >
              Agendar horário
            </AgendarButton>
            <WhatsappCTA />
          </div>
        </article>

        <ServicosIndicados servicos={indicados} titulo="Serviços citados neste artigo" />

        {outros.length > 0 && (
          <section className="border-t border-card-line">
            <div className="mx-auto max-w-2xl px-6 py-14">
              <h2 className="font-display font-bold text-2xl text-steel mb-6">Leia também</h2>
              <ul className="grid gap-3">
                {outros.map((o) => (
                  <li key={o.slug}>
                    <Link href={`/blog/${o.slug}`} className="text-verniz-shine hover:underline">{o.titulo}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.titulo,
              description: post.resumo,
              mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
              datePublished: post.publicado_em,
              dateModified: post.atualizado_em || post.publicado_em,
              ...(post.imagem_url ? { image: post.imagem_url } : {}),
              author: { "@id": `${SITE_URL}/#empresa` },
              publisher: { "@id": `${SITE_URL}/#empresa` },
            }),
          }}
        />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
