import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import BeforeAfter from "@/components/BeforeAfter";
import VonixxBadge from "@/components/VonixxBadge";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import { servicos, cidades } from "@/lib/data";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section
          className="shine-sweep bg-carbon text-steel bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(10,10,13,0.55), rgba(10,10,13,0.95)), url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1600&q=80')",
          }}
        >
          <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
            <VonixxBadge />
            <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[0.95] max-w-3xl mt-6">
              Seu carro sai daqui com o <span className="text-verniz-shine glow-text">brilho de zero-km</span>.
            </h1>
            <p className="mt-6 max-w-xl text-steel-line text-lg leading-relaxed">
              Lavagem, polimento técnico e vitrificação cerâmica no nosso estúdio em Mogi das Cruzes.
              Recebemos também clientes de Suzano, Poá, Ferraz de Vasconcelos e Itaquaquecetuba, sempre com hora marcada.
            </p>
            <AgendarButton className="inline-block mt-8 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
              Agendar horário
            </AgendarButton>
          </div>
        </section>

        {/* Antes e depois */}
        <section className="bg-carbon py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center mb-12">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
                Arraste e veja a <span className="text-verniz-shine">transformação</span>
              </h2>
              <p className="mt-2 text-steel-line max-w-xl mx-auto">
                Resultados reais dos nossos serviços de polimento e vitrificação.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <BeforeAfter
                title="Correção de verniz e espelhamento"
                description="Eliminamos hologramas e micro-riscos causados por lavagens incorretas, revelando o brilho real da pintura."
                before="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=700&q=80"
                after="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=700&q=80"
              />
              <BeforeAfter
                title="Recuperação de plásticos e frisos"
                description="Acabamentos ressecados pelo sol voltam à cor original com revitalizadores de alta durabilidade."
                before="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80"
                after="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=700&q=80"
              />
            </div>
          </div>
        </section>

        {/* Serviços */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-2 text-steel">Catálogo de serviços</h2>
          <p className="text-steel-line mb-10">Química Vonixx, do dia a dia à proteção de longa duração.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {servicos.map((s) => (
              <ServiceCard
                key={s.slug}
                slug={s.slug}
                nome={s.nome}
                resumo={s.resumo}
                precoDesde={s.precoDesde}
                image={s.imagem}
                tag={s.tag}
              />
            ))}
          </div>
        </section>

        {/* Cidades */}
        <section className="bg-carbon-soft py-20 border-y border-card-line">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-2 text-steel">
              Nosso estúdio fica em Mogi das Cruzes
            </h2>
            <p className="text-steel-line mb-10 max-w-xl">
              Recebemos também clientes de toda a região do Alto Tietê, sempre com hora marcada.
            </p>
            <div className="flex flex-wrap gap-3">
              {cidades.map((c) => (
                <Link
                  key={c.slug}
                  href={`/servicos/vitrificacao/${c.slug}`}
                  className="rounded-full bg-card border border-card-line px-5 py-2 font-display font-bold text-sm text-steel-line hover:border-verniz hover:text-verniz-shine transition-colors"
                >
                  {c.nome}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
