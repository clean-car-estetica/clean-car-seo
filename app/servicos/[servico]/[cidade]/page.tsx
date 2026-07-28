import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import { servicos, cidades } from "@/lib/data";
import { getServicoPublico, getConteudoLocalPublico, getCidadesPublicas, getCidadePublica } from "@/lib/site-data";

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
  return {
    title: `${servico.nome} em ${cidade.nome} | Clean Car`,
    description: `${servico.nome} em ${cidade.nome} e região. ${servico.resumo}`,
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
              {servico.nome} em {cidade.nome}
            </h1>
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
            <p className="text-sm text-steel-line">{cidade.bairros.join(", ")}</p>
          </div>

          <AgendarButton className="inline-block mt-8 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
            Agendar em {cidade.nome}
          </AgendarButton>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
