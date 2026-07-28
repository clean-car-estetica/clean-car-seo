import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import { getServicosPublicos, getBeneficiosPublicos } from "@/lib/site-data";
import { getTextosGerais } from "@/lib/site-content";

export const revalidate = 60;

export const metadata = {
  title: "Benefícios e Fidelidade",
  description: "Programa de fidelidade Clean Car: acumule pontos e troque por descontos.",
  alternates: { canonical: "https://clean-car-seo.vercel.app/beneficios" },
};

export default async function BeneficiosPage() {
  const [servicos, beneficios, textos] = await Promise.all([getServicosPublicos(), getBeneficiosPublicos(), getTextosGerais()]);
  const servicosComPontos = servicos.filter((s) => s.pontos_fidelidade > 0);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-4xl px-6 py-20">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">Fidelidade Clean Car</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-steel mb-4">{textos.beneficiosTitulo}</h1>
          <p className="text-steel-line mb-12 max-w-xl">
            {textos.beneficiosSubtitulo}
          </p>

          {servicosComPontos.length > 0 && (
            <div className="mb-12">
              <h2 className="font-display font-bold text-xl text-steel mb-4">Pontos por serviço</h2>
              <div className="bg-card border border-card-line rounded-2xl overflow-hidden">
                {servicosComPontos.map((s, i) => (
                  <div key={s.slug} className={`flex justify-between px-5 py-3 text-sm ${i > 0 ? "border-t border-card-line" : ""}`}>
                    <span className="text-steel-line">{s.nome}</span>
                    <span className="font-display font-bold text-verniz-shine">{s.pontos_fidelidade} pontos</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {beneficios.length > 0 && (
            <div>
              <h2 className="font-display font-bold text-xl text-steel mb-4">Benefícios</h2>
              <div className="bg-card border border-card-line rounded-2xl overflow-hidden">
                {beneficios.map((b, i) => (
                  <div key={b.id} className={`flex justify-between px-5 py-3 text-sm ${i > 0 ? "border-t border-card-line" : ""}`}>
                    <span className="text-steel-line">{b.nome}</span>
                    <span className="font-display font-bold text-cera">{b.pontos_necessarios} pontos</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {servicosComPontos.length === 0 && beneficios.length === 0 && (
            <p className="text-steel-line text-sm">Programa de fidelidade em preparação — em breve os detalhes aqui.</p>
          )}
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
