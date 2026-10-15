import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import QuizCuidado from "@/components/QuizCuidado";
import { SITE_URL } from "@/lib/config";
import { getServicosPublicos } from "@/lib/site-data";
import { getGuiasPublicadas, caminhoGuia } from "@/lib/guias";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Qual cuidado o seu carro precisa? Teste rápido | Clean Car Mogi das Cruzes" },
  description:
    "Responda 5 perguntas rápidas e descubra qual lavagem ou tratamento o seu carro precisa, com preço de referência. Clean Car Estética Automotiva, Mogi das Cruzes.",
  alternates: { canonical: `${SITE_URL}/qual-cuidado` },
};

export default async function QualCuidadoPage() {
  const [servicos, guias] = await Promise.all([getServicosPublicos(), getGuiasPublicadas()]);
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-3xl px-6 py-14 md:py-20 grid gap-8">
          <div className="grid gap-3">
            <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm">Teste rápido · 30 segundos</p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl text-steel text-balance leading-[0.95]">Qual cuidado o seu carro precisa?</h1>
            <p className="text-lg text-steel-line">
              Responda 5 perguntas e veja o serviço indicado, com preço de referência. Sem cadastro: o resultado aparece na hora e você
              manda para a gente pelo WhatsApp se quiser.
            </p>
          </div>
          <QuizCuidado
            servicos={servicos.map((s) => ({ slug: s.slug, nome: s.nome, preco: s.preco_desde, duracao: s.duracao }))}
            guiasPublicadas={guias.map((g) => caminhoGuia(g))}
          />
          <p className="text-sm text-steel-line">
            Prefere ver todos os valores? Veja a <Link href="/precos" className="text-verniz-shine underline underline-offset-2">tabela de preços</Link>.
          </p>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Qual cuidado o seu carro precisa?",
              url: `${SITE_URL}/qual-cuidado`,
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              inLanguage: "pt-BR",
              offers: { "@type": "Offer", price: 0, priceCurrency: "BRL" },
              provider: { "@id": `${SITE_URL}/#empresa` },
              description: "Teste gratuito que indica o serviço de estética automotiva certo para o carro, com preço de referência da Clean Car em Mogi das Cruzes.",
            }),
          }}
        />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
