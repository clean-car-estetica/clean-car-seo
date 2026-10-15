import Bloco from "@/components/Bloco";
import { SITE_URL } from "@/lib/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import Faq from "@/components/Faq";
import PerguntaForm from "@/components/PerguntaForm";
import { getFaqsPublicos } from "@/lib/site-data";
import { getTextosGerais } from "@/lib/site-content";

export const revalidate = 60;

export const metadata = {
  title: "Perguntas frequentes: preços, prazos e garantia",
  description: "Quanto tempo leva, se precisa deixar o carro, garantia e formas de pagamento: as dúvidas mais comuns sobre lavagem e higienização na Clean Car, em Mogi das Cruzes.",
  alternates: { canonical: `${SITE_URL}/faq` },
};

export default async function FaqPage() {
  const [faqs, textos] = await Promise.all([getFaqsPublicos(), getTextosGerais()]);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-3xl px-6 pt-16 pb-6 text-center">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">{textos.faqSubtitulo}</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-steel">
            {textos.faqTitulo}
          </h1>
        </section>
        <Bloco id="faq"><Faq itens={faqs} /></Bloco>
        <section className="mx-auto max-w-3xl px-6 py-16">
          <h2 className="font-display font-bold text-3xl text-steel mb-2">Não achou a sua dúvida?</h2>
          <p className="text-steel-line mb-6">Mande a sua pergunta: a equipe da Clean Car responde.</p>
          <PerguntaForm />
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
