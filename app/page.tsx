import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { servicos, cidades } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="shine-sweep bg-carbon text-steel">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
            <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">
              Estética automotiva · Alto Tietê
            </p>
            <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[0.95] max-w-3xl">
              Seu carro sai daqui com a <span className="text-verniz-shine">pintura protegida</span> e o brilho de zero-km.
            </h1>
            <p className="mt-6 max-w-xl text-steel-line/90 text-lg">
              Lavagem, polimento, vitrificação e higienização em Mogi das Cruzes,
              Suzano, Poá, Ferraz de Vasconcelos e Itaquaquecetuba.
            </p>
            <a
              href="#contato"
              className="inline-block mt-8 rounded-full bg-cera text-carbon font-display font-bold px-8 py-3 tracking-wide hover:brightness-95"
            >
              Agendar horário
            </a>
          </div>
        </section>

        {/* Serviços */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-2">Nossos serviços</h2>
          <p className="text-ink/60 mb-10">Do dia a dia à proteção de longa duração.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {servicos.map((s) => (
              <Link
                key={s.slug}
                href={`/servicos/${s.slug}`}
                className="group rounded-2xl border border-steel-line bg-white p-6 hover:border-verniz transition-colors"
              >
                <h3 className="font-display font-bold text-xl group-hover:text-verniz">{s.nome}</h3>
                <p className="mt-2 text-sm text-ink/70">{s.resumo}</p>
                {s.precoDesde && (
                  <p className="mt-4 text-xs uppercase tracking-wide text-verniz font-display font-bold">
                    A partir de R$ {s.precoDesde}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Cidades */}
        <section className="bg-steel py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-10">Onde atendemos</h2>
            <div className="flex flex-wrap gap-3">
              {cidades.map((c) => (
                <Link
                  key={c.slug}
                  href={`/servicos/vitrificacao/${c.slug}`}
                  className="rounded-full bg-white border border-steel-line px-5 py-2 font-display font-bold text-sm hover:border-verniz hover:text-verniz"
                >
                  {c.nome}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
