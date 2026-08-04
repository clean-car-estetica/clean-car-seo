"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import { useContato } from "@/components/ContatoProvider";
import { whatsappLink } from "@/lib/config";

export default function ContatoPage() {
  const contato = useContato();

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-2xl px-6 py-20">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">Fale com a gente</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-steel mb-8">Contato</h1>

          <div className="grid gap-4 mb-10">
            <div className="bg-card border border-card-line rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-verniz-shine mb-1">Endereço</div>
              <p className="text-steel-line">{contato.endereco}</p>
            </div>
            <div className="bg-card border border-card-line rounded-2xl p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-verniz-shine mb-1">Horário</div>
              <p className="text-steel-line">{contato.horarioSemana}</p>
              <p className="text-steel-line">{contato.horarioSabado}</p>
            </div>
            <a href={whatsappLink(contato)} target="_blank" rel="noopener noreferrer" className="bg-card border border-card-line rounded-2xl p-5 hover:border-verniz transition-colors">
              <div className="text-xs font-bold uppercase tracking-wide text-verniz-shine mb-1">WhatsApp</div>
              <p className="text-steel-line">{contato.whatsapp}</p>
            </a>
            <a href={contato.instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-card border border-card-line rounded-2xl p-5 hover:border-verniz transition-colors">
              <div className="text-xs font-bold uppercase tracking-wide text-verniz-shine mb-1">Instagram</div>
              <p className="text-steel-line">@{contato.instagram}</p>
            </a>
            <a href={contato.googleUrl} target="_blank" rel="noopener noreferrer" className="bg-card border border-card-line rounded-2xl p-5 hover:border-verniz transition-colors">
              <div className="text-xs font-bold uppercase tracking-wide text-verniz-shine mb-1">Google</div>
              <p className="text-steel-line">Ver no Maps e avaliações</p>
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-card-line mb-10">
            <iframe
              title="Mapa Clean Car"
              src={`https://www.google.com/maps?q=${encodeURIComponent(contato.endereco)}&output=embed`}
              width="100%"
              height="300"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <AgendarButton className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
            Agendar horário
          </AgendarButton>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
