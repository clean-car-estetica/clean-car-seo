"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { useContato } from "@/components/ContatoProvider";
import { useTextos } from "@/components/TextosProvider";

export default function AvaliarPage() {
  const [nota, setNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const contato = useContato();
  const textos = useTextos();

  async function enviar() {
    if (nota === null) return;
    setEnviando(true);
    await supabaseBrowser().from("nps_respostas").insert({ nota, comentario: comentario || null });
    setEnviando(false);
    setEnviado(true);
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-xl px-6 py-24">
          {enviado ? (
            <div className="text-center">
              <h1 className="font-display font-extrabold text-3xl text-steel mb-4">{textos.avaliarSucessoTitulo}</h1>
              <p className="text-steel-line">
                Isso nos ajuda a manter o padrão de qualidade. Se quiser, deixe também uma avaliação no Google:
              </p>
              <a
                href={contato.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 hover:bg-verniz-shine transition-colors"
              >
                Avaliar no Google
              </a>
            </div>
          ) : (
            <>
              <h1 className="font-display font-extrabold text-3xl text-steel mb-2">{textos.avaliarTitulo}</h1>
              <p className="text-steel-line mb-8">
                {textos.avaliarSubtitulo}
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {Array.from({ length: 11 }, (_, i) => i).map((n) => (
                  <button
                    key={n}
                    onClick={() => setNota(n)}
                    className={`w-11 h-11 rounded-lg font-display font-bold text-sm ${
                      nota === n ? "bg-verniz text-carbon" : "bg-card border border-card-line text-steel-line hover:border-verniz"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Quer contar mais alguma coisa? (opcional)"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-card border border-card-line text-steel text-sm mb-6"
              />
              <button
                onClick={enviar}
                disabled={nota === null || enviando}
                className="rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 hover:bg-verniz-shine transition-colors disabled:opacity-40"
              >
                {enviando ? "Enviando..." : "Enviar avaliação"}
              </button>
            </>
          )}
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
