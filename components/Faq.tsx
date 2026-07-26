"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { id: number; pergunta: string; resposta: string };

export default function Faq({ itens, titulo = true, rodape }: { itens: FaqItem[]; titulo?: boolean; rodape?: React.ReactNode }) {
  const [abertos, setAbertos] = useState<Set<number>>(new Set());

  if (itens.length === 0) return null;

  function alternar(id: number) {
    setAbertos((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  return (
    <section id="faq" className="bg-carbon-soft border-y border-card-line py-20">
      <div className="mx-auto max-w-3xl px-6">
        {titulo && (
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
              Dúvidas <span className="text-verniz-shine">frequentes</span>
            </h2>
          </div>
        )}
        <div className="grid gap-3">
          {itens.map((item) => {
            const estaAberto = abertos.has(item.id);
            return (
              <div key={item.id} className="bg-card border border-card-line rounded-xl overflow-hidden">
                <button
                  onClick={() => alternar(item.id)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 font-display font-bold text-steel"
                >
                  {item.pergunta}
                  <ChevronDown size={18} className={`text-verniz-shine transition-transform shrink-0 ml-3 ${estaAberto ? "rotate-180" : ""}`} />
                </button>
                {/* A resposta fica sempre no HTML (bom pra Google/IAs lerem), só a aparência muda */}
                <div className="px-5 pb-4">
                  <p className={`text-sm text-steel-line leading-relaxed ${estaAberto ? "" : "line-clamp-2"}`}>
                    {item.resposta}
                  </p>
                  {!estaAberto && (
                    <button
                      onClick={() => alternar(item.id)}
                      className="text-xs font-bold text-verniz-shine hover:underline mt-1"
                    >
                      Veja mais
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {rodape && <div className="text-center mt-8">{rodape}</div>}
      </div>

      {/* Dado estruturado FAQPage — ajuda buscadores e assistentes de IA a citar essas respostas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: itens.map((item) => ({
              "@type": "Question",
              name: item.pergunta,
              acceptedAnswer: { "@type": "Answer", text: item.resposta },
            })),
          }),
        }}
      />
    </section>
  );
}
