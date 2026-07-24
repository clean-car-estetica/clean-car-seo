import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { servicos, cidades } from "@/lib/data";
import { getConteudoLocal } from "@/lib/content";

export function generateStaticParams() {
  return servicos.flatMap((s) => cidades.map((c) => ({ servico: s.slug, cidade: c.slug })));
}

export function generateMetadata({
  params,
}: {
  params: { servico: string; cidade: string };
}): Metadata {
  const servico = servicos.find((s) => s.slug === params.servico);
  const cidade = cidades.find((c) => c.slug === params.cidade);
  if (!servico || !cidade) return {};
  return {
    title: `${servico.nome} em ${cidade.nome} | Clean Car`,
    description: `${servico.nome} em ${cidade.nome} e região. ${servico.resumo}`,
  };
}

export default function ServicoCidadePage({
  params,
}: {
  params: { servico: string; cidade: string };
}) {
  const servico = servicos.find((s) => s.slug === params.servico);
  const cidade = cidades.find((c) => c.slug === params.cidade);
  if (!servico || !cidade) return notFound();

  const conteudo = getConteudoLocal(servico, cidade);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="shine-sweep bg-carbon text-steel">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">
              {cidade.nome} · Alto Tietê
            </p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight">
              {servico.nome} em {cidade.nome}
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16 prose-p:leading-relaxed">
          {conteudo.paragrafos.map((p, i) => (
            <p key={i} className="mb-5 text-ink/90 text-lg">
              {p}
            </p>
          ))}

          <div className="mt-10 rounded-2xl bg-steel p-6">
            <h2 className="font-display font-bold text-lg mb-2">
              Bairros atendidos em {cidade.nome}
            </h2>
            <p className="text-sm text-ink/70">{cidade.bairros.join(", ")}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
