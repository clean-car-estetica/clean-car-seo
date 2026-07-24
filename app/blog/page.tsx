import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";

export const metadata = {
  title: "Blog",
  description: "Dicas de cuidado automotivo da Clean Car Estética Automotiva.",
};

export default function BlogIndex() {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">Blog</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-steel">
            Em breve, dicas de cuidado automotivo
          </h1>
          <p className="mt-6 text-steel-line max-w-xl mx-auto">
            Estamos preparando conteúdo sobre polimento, vitrificação, higienização e manutenção do seu veículo.
          </p>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
