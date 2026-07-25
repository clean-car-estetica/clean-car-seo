import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import Faq from "@/components/Faq";
import { getFaqsPublicos } from "@/lib/site-data";

export const revalidate = 60;

export const metadata = {
  title: "Perguntas frequentes",
  description: "Tire suas dúvidas sobre lavagem, higienização, polimento e vitrificação na Clean Car.",
};

export default async function FaqPage() {
  const faqs = await getFaqsPublicos();

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-6 text-center">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">Dúvidas frequentes</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-steel">
            Tudo que você precisa saber
          </h1>
        </section>
        <Faq itens={faqs} />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
