import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { servicos, cidades } from "@/lib/data";

export function generateStaticParams() {
  return servicos.map((s) => ({ servico: s.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { servico: string };
}): Metadata {
  const servico = servicos.find((s) => s.slug === params.servico);
  if (!servico) return {};
  return {
    title: `${servico.nome} em Mogi das Cruzes e Região`,
    description: servico.descricao,
  };
}

export default function ServicoPage({
  params,
}: {
  params: { servico: string };
}) {
  const servico = servicos.find((s) => s.slug === params.servico);
  if (!servico) return notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="shine-sweep bg-carbon text-steel">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">
              Serviço Clean Car
            </p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight">
              {servico.nome}
            </h1>
            <p className="mt-6 text-lg text-steel-line/90 max-w-2xl">{servico.descricao}</p>
            <div className="mt-8 flex gap-6 font-display text-sm">
              {servico.duracao && <span>⏱ {servico.duracao}</span>}
              {servico.precoDesde && <span>💰 a partir de R$ {servico.precoDesde}</span>}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="font-display font-bold text-2xl mb-6">
            {servico.nome} perto de você
          </h2>
          <div className="flex flex-wrap gap-3">
            {cidades.map((c) => (
              <Link
                key={c.slug}
                href={`/servicos/${servico.slug}/${c.slug}`}
                className="rounded-full bg-steel border border-steel-line px-5 py-2 font-display font-bold text-sm hover:border-verniz hover:text-verniz"
              >
                {servico.nome} em {c.nome}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
