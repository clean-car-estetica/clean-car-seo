import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import { servicos, cidades } from "@/lib/data";
import { getServicoPublico, getConteudoLocalPublico, getCidadesPublicas, getCidadePublica } from "@/lib/site-data";
import { slugify } from "@/lib/slug";

export const revalidate = 60;

export function generateStaticParams() {
  return servicos.flatMap((s) => cidades.map((c) => ({ servico: s.slug, cidade: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ servico: string; cidade: string }>;
}): Promise<Metadata> {
  const { servico: servicoSlug, cidade: cidadeSlug } = await params;
  const servico = await getServicoPublico(servicoSlug);
  const cidade = await getCidadePublica(cidadeSlug);
  if (!servico || !cidade) return {};
  const tituloBase = servico.termo_popular || servico.nome;
  const titulo =
    tituloBase === servico.nome
      ? `${servico.nome} em ${cidade.nome} | Clean Car`
      : `${tituloBase} em ${cidade.nome} | ${servico.nome} - Clean Car`;
  return {
    title: titulo,
    description: `${tituloBase} em ${cidade.nome} e região. ${servico.resumo}`,
    alternates: { canonical: `https://clean-car-seo.vercel.app/servicos/${servico.slug}/${cidade.slug}` },
  };
}

export default async function ServicoCidadePage({
  params,
}: {
  params: Promise<{ servico: string; cidade: string }>;
}) {
  const { servico: servicoSlug, cidade: cidadeSlug } = await params;
  const servico = await getServicoPublico(servicoSlug);
  const cidade = await getCidadePublica(cidadeSlug);
  if (!servico || !cidade) return notFound();

  const conteudo = await getConteudoLocalPublico(servico, cidade);
  const imagemFundo = conteudo.imagemOverride || servico.imagem_url;

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section
          className="bg-carbon text-steel bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,10,13,0.65), rgba(10,10,13,0.97)), url('${imagemFundo}')`,
          }}
        >
          <div className="mx-auto max-w-4xl px-6 py-20">
            <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">
              {cidade.nome} · Alto Tietê
            </p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight">
              {servico.termo_popular || servico.nome} em {cidade.nome}
            </h1>
            {servico.termo_popular && (
              <p className="mt-2 text-steel-line text-sm">Serviço: {servico.nome}</p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          {conteudo.paragrafos.map((p, i) => (
            <p key={i} className="mb-5 text-steel-line leading-relaxed text-lg">
              {p}
            </p>
          ))}

          <div className="mt-10 rounded-2xl bg-card border border-card-line p-6">
            <h2 className="font-display font-bold text-lg mb-2 text-steel">
              Bairros atendidos em {cidade.nome}
            </h2>
            {cidade.sede ? (
              <div className="flex flex-wrap gap-2">
                {cidade.bairros.map((b) => (
                  <a
                    key={b}
                    href={`/servicos/${servico.slug}/${cidade.slug}/${slugify(b)}`}
                    className="rounded-full bg-carbon border border-card-line px-3 py-1 text-xs text-steel-line hover:border-verniz hover:text-verniz-shine"
                  >
                    {b}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-steel-line">{cidade.bairros.join(", ")}</p>
            )}
          </div>

          <AgendarButton className="inline-block mt-8 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
            Agendar em {cidade.nome}
          </AgendarButton>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: servico.termo_popular || servico.nome,
              name: `${servico.nome} em ${cidade.nome}`,
              description: `${servico.nome} em ${cidade.nome} e região. ${servico.resumo}`,
              provider: {
                "@type": "AutoRepair",
                name: "Clean Car Estética Automotiva",
                url: "https://clean-car-seo.vercel.app/",
              },
              areaServed: cidade.nome,
              ...(servico.preco_desde
                ? { offers: { "@type": "Offer", price: servico.preco_desde, priceCurrency: "BRL" } }
                : {}),
            }),
          }}
        />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
