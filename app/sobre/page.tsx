import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import { getSobre } from "@/lib/site-content";

export const revalidate = 3600;

export const metadata = {
  title: "Sobre Nós",
  description: "Conheça a Clean Car Estética Automotiva: loja física em Mogi das Cruzes, produtos Vonixx e atendimento em toda a região do Alto Tietê.",
  alternates: { canonical: "https://clean-car-seo.vercel.app/sobre" },
};

export default async function SobrePage() {
  const sobre = await getSobre();

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-2xl px-6 py-20">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">
            Quem somos
          </p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-steel mb-8">
            {sobre.titulo}
          </h1>
          <div className="text-steel-line leading-relaxed whitespace-pre-line text-lg">{sobre.texto}</div>
          <AgendarButton className="inline-block mt-10 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
            Agendar horário
          </AgendarButton>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
