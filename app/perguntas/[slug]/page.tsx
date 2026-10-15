import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import WhatsappCTA from "@/components/WhatsappCTA";
import TextoRico from "@/components/TextoRico";
import ServicosIndicados from "@/components/ServicosIndicados";
import { SITE_URL } from "@/lib/config";
import { getPerguntaPublicada, getPerguntasPublicadas, MINIMO_RESPOSTA_INDEXAVEL, tituloPergunta } from "@/lib/perguntas";
import { getServicosPublicos } from "@/lib/site-data";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPerguntaPublicada(slug);
  if (!p) return {};
  const titulo = tituloPergunta(p);
  const descricao = p.resposta.replace(/\s+/g, " ").slice(0, 155);
  return {
    title: { absolute: `${titulo} | Clean Car responde` },
    description: descricao,
    alternates: { canonical: `${SITE_URL}/perguntas/${p.slug}` },
    ...(p.resposta.length >= MINIMO_RESPOSTA_INDEXAVEL ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function PerguntaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, servicos, todas] = await Promise.all([getPerguntaPublicada(slug), getServicosPublicos(), getPerguntasPublicadas()]);
  if (!p) notFound();
  const titulo = tituloPergunta(p);
  const servico = p.servico_slug ? servicos.find((s) => s.slug === p.servico_slug) : undefined;
  const outras = todas.filter((x) => x.slug !== p.slug).slice(0, 6);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <article className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <nav aria-label="Você está em" className="text-sm text-steel-line mb-5">
            <Link href="/" className="hover:text-verniz-shine">Início</Link>
            <span className="mx-2">/</span>
            <Link href="/perguntas" className="hover:text-verniz-shine">Perguntas</Link>
          </nav>
          <p className="font-display font-bold text-verniz-shine mb-3">Pergunta de cliente</p>
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-steel text-balance">{titulo}</h1>
          {p.titulo && p.titulo !== p.pergunta && (
            <blockquote className="mt-6 border-l-2 border-verniz pl-4 text-steel-line italic">“{p.pergunta}”</blockquote>
          )}
          <div className="mt-8">
            <p className="font-display font-bold text-steel mb-3">Resposta da Clean Car</p>
            <TextoRico texto={p.resposta} />
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <WhatsappCTA texto="Mandar foto do meu caso" />
            <Link href="/perguntas" className="rounded-full border border-card-line px-5 py-3 font-display font-bold text-steel hover:border-verniz">
              Fazer outra pergunta
            </Link>
          </div>
        </article>

        {servico && <ServicosIndicados servicos={[servico]} titulo="Serviço indicado" />}

        {outras.length > 0 && (
          <section className="border-t border-card-line">
            <div className="mx-auto max-w-3xl px-6 py-14">
              <h2 className="font-display font-bold text-2xl text-steel mb-6">Outras perguntas</h2>
              <ul className="grid gap-3">
                {outras.map((o) => (
                  <li key={o.id}>
                    <Link href={`/perguntas/${o.slug}`} className="text-verniz-shine hover:underline">{tituloPergunta(o)}</Link>
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
              "@type": "QAPage",
              mainEntity: {
                "@type": "Question",
                name: titulo,
                text: p.pergunta,
                answerCount: 1,
                ...(p.respondido_em ? { datePublished: p.respondido_em } : {}),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: p.resposta,
                  url: `${SITE_URL}/perguntas/${p.slug}`,
                  author: { "@type": "Organization", name: "Clean Car Estética Automotiva", url: `${SITE_URL}/` },
                  ...(p.respondido_em ? { datePublished: p.respondido_em } : {}),
                },
              },
            }),
          }}
        />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
