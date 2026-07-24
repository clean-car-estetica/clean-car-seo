"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { id: number; pergunta: string; resposta: string };

export default function Faq({ itens }: { itens: FaqItem[] }) {
  const [aberto, setAberto] = useState<number | null>(null);

  if (itens.length === 0) return null;

  return (
    <section className="bg-carbon-soft border-y border-card-line py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
            Dúvidas <span className="text-verniz-shine">frequentes</span>
          </h2>
        </div>
        <div className="grid gap-3">
          {itens.map((item) => {
            const estaAberto = aberto === item.id;
            return (
              <div key={item.id} className="bg-card border border-card-line rounded-xl overflow-hidden">
                <button
                  onClick={() => setAberto(estaAberto ? null : item.id)}
                  className="w-full flex items-center justify-between text-left px-5 py-4 font-display font-bold text-steel"
                >
                  {item.pergunta}
                  <ChevronDown size={18} className={`text-verniz-shine transition-transform ${estaAberto ? "rotate-180" : ""}`} />
                </button>
                {estaAberto && (
                  <div className="px-5 pb-4 text-sm text-steel-line leading-relaxed">{item.resposta}</div>
                )}
              </div>
            );
          })}
        </div>
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
