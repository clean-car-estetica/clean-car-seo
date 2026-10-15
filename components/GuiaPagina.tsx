import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import WhatsappCTA from "@/components/WhatsappCTA";
import AgendarButton from "@/components/AgendarButton";
import Faq from "@/components/Faq";
import Midia from "@/components/Midia";
import TextoRico from "@/components/TextoRico";
import ServicosIndicados from "@/components/ServicosIndicados";
import { SITE_URL } from "@/lib/config";
import { caminhoGuia, NOME_TIPO, ROTA_GUIA, type Guia } from "@/lib/guias";
import type { ServicoDB } from "@/lib/site-data";

// Página de um guia (problema → solução ou por público). Usada no site e na
// prévia do console, para o rascunho ficar idêntico ao que vai ao ar.
export default function GuiaPagina({
  guia,
  servicos,
  outras,
  previa = false,
}: {
  guia: Guia;
  servicos: ServicoDB[];
  outras: Pick<Guia, "slug" | "tipo" | "titulo" | "chamada">[];
  previa?: boolean;
}) {
  const indicados = guia.servicos
    .map((slug) => servicos.find((s) => s.slug === slug))
    .filter((s): s is ServicoDB => Boolean(s));
  const url = `${SITE_URL}${caminhoGuia(guia)}`;

  return (
    <>
      {previa && (
        <div className="fixed top-0 inset-x-0 z-50 bg-warn text-carbon text-center text-sm font-bold py-1.5">
          Prévia do rascunho — ainda não está no site
        </div>
      )}
      <Header />
      <main className="flex-1 pt-20">
        <article>
          <header className="border-b border-card-line">
            <div className="mx-auto max-w-5xl px-6 py-12 md:py-16 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-center">
              <div>
                <nav aria-label="Você está em" className="text-sm text-steel-line mb-5">
                  <Link href="/" className="hover:text-verniz-shine">Início</Link>
                  <span className="mx-2">/</span>
                  <Link href={ROTA_GUIA[guia.tipo]} className="hover:text-verniz-shine">{NOME_TIPO[guia.tipo]}</Link>
                </nav>
                {guia.chamada && <p className="text-verniz-shine font-display font-bold text-lg mb-3">{guia.chamada}</p>}
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-[0.98] text-steel text-balance">{guia.titulo}</h1>
                {guia.intro && <p className="mt-6 text-lg text-steel leading-relaxed">{guia.intro}</p>}
                <div className="mt-8 flex flex-wrap gap-3">
                  <AgendarButton
                    servico={indicados[0]?.nome}
                    className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-7 py-3 hover:bg-verniz-shine transition-colors"
                  >
                    Resolver com a Clean Car
                  </AgendarButton>
                  <WhatsappCTA texto="Mandar foto no WhatsApp" />
                </div>
              </div>
              {(guia.imagem_url || indicados[0]?.imagem_url) && (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-card-line bg-card">
                  <Midia
                    src={(guia.imagem_url || indicados[0]?.imagem_url) as string}
                    alt={guia.titulo}
                    prioridade
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-6 py-14 grid gap-12">
            {guia.secoes.map((s, i) => (
              <section key={i}>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-steel mb-5 text-balance">{s.titulo}</h2>
                <TextoRico texto={s.texto} />
              </section>
            ))}
          </div>
        </article>

        <ServicosIndicados servicos={indicados} />

        {guia.perguntas.length > 0 && (
          <Faq itens={guia.perguntas.map((p, i) => ({ id: i + 1, pergunta: p.pergunta, resposta: p.resposta }))} />
        )}

        <section className="mx-auto max-w-3xl px-6 py-14 text-center">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-steel text-balance">Ficou com alguma dúvida?</h2>
          <p className="mt-3 text-steel-line">
            Mande uma foto pelo WhatsApp e a gente avalia de graça, ou{" "}
            <Link href="/perguntas" className="text-verniz-shine underline underline-offset-2">deixe a sua pergunta</Link>.
          </p>
          <div className="mt-6 flex justify-center">
            <WhatsappCTA texto="Falar com a Clean Car" />
          </div>
        </section>

        {outras.length > 0 && (
          <section className="border-t border-card-line">
            <div className="mx-auto max-w-5xl px-6 py-14">
              <h2 className="font-display font-bold text-2xl text-steel mb-6">Veja também</h2>
              <div className="flex flex-wrap gap-3">
                {outras.map((o) => (
                  <Link
                    key={`${o.tipo}/${o.slug}`}
                    href={caminhoGuia(o)}
                    className="rounded-full bg-card border border-card-line px-5 py-2 text-sm font-display font-bold text-steel-line hover:border-verniz hover:text-verniz-shine transition-colors"
                  >
                    {o.chamada || o.titulo}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: guia.titulo,
                description: guia.meta_descricao || guia.intro,
                mainEntityOfPage: url,
                dateModified: guia.atualizado_em,
                ...(guia.publicado_em ? { datePublished: guia.publicado_em } : {}),
                author: { "@id": `${SITE_URL}/#empresa` },
                publisher: { "@id": `${SITE_URL}/#empresa` },
              },
              {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Início", item: `${SITE_URL}/` },
                  { "@type": "ListItem", position: 2, name: NOME_TIPO[guia.tipo], item: `${SITE_URL}${ROTA_GUIA[guia.tipo]}` },
                  { "@type": "ListItem", position: 3, name: guia.titulo, item: url },
                ],
              },
            ]),
          }}
        />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
