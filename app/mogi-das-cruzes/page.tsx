import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import Faq from "@/components/Faq";
import { getServicosPublicos, getCidadesPublicas, getFaqsPublicos } from "@/lib/site-data";
import { slugify } from "@/lib/slug";

export const revalidate = 3600;

export const metadata = {
  title: "Estética Automotiva em Mogi das Cruzes | Clean Car",
  description:
    "Lavagem de carro, higienização, remoção de chuva ácida e recuperação de plásticos em Mogi das Cruzes. Loja física, produtos Vonixx, hora marcada.",
  alternates: { canonical: "https://clean-car-seo.vercel.app/mogi-das-cruzes" },
};

export default async function MogiHubPage() {
  const [servicos, cidades, faqs] = await Promise.all([
    getServicosPublicos(),
    getCidadesPublicas(),
    getFaqsPublicos(),
  ]);
  const mogi = cidades.find((c) => c.sede);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="bg-carbon text-steel">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">
              Mogi das Cruzes · Alto Tietê
            </p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight">
              Estética Automotiva em Mogi das Cruzes
            </h1>
            <p className="mt-6 text-lg text-steel-line max-w-2xl leading-relaxed">
              Lavagem de carro, higienização de estofados, remoção de chuva ácida e recuperação de
              plásticos — tudo em um só lugar, perto de você, com produtos Vonixx e hora marcada.
            </p>
            <AgendarButton className="inline-block mt-8 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
              Agendar em Mogi das Cruzes
            </AgendarButton>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16">
          <h2 className="font-display font-bold text-2xl mb-6 text-steel">Nossos serviços em Mogi</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {servicos.map((s) => (
              <Link
                key={s.slug}
                href={`/servicos/${s.slug}/mogi-das-cruzes`}
                className="rounded-xl bg-card border border-card-line px-4 py-3 text-sm font-display font-bold text-steel-line hover:border-verniz hover:text-verniz-shine"
              >
                {s.termo_popular || s.nome}
              </Link>
            ))}
          </div>
        </section>

        {mogi && mogi.bairros.length > 0 && (
          <section className="bg-carbon-soft border-y border-card-line py-16">
            <div className="mx-auto max-w-4xl px-6">
              <h2 className="font-display font-bold text-2xl mb-6 text-steel">
                Perto de você, em qualquer bairro de Mogi
              </h2>
              <div className="flex flex-wrap gap-2">
                {mogi.bairros.map((b) => (
                  <Link
                    key={b}
                    href={`/servicos/lavagem-bronze/mogi-das-cruzes/${slugify(b)}`}
                    className="rounded-full bg-card border border-card-line px-4 py-2 text-sm text-steel-line hover:border-verniz hover:text-verniz-shine"
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Faq itens={faqs.slice(0, 3)} />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
