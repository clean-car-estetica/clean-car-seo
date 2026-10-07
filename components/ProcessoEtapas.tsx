"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { PassoDB } from "@/lib/site-data";

// O processo é uma sequência de verdade, então as etapas são numeradas e
// abrem uma de cada vez.
export default function ProcessoEtapas({ passos }: { passos: PassoDB[] }) {
  const [aberto, setAberto] = useState(0);
  if (passos.length === 0) return null;

  return (
    <section className="bg-carbon-soft border-y border-card-line">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28 grid lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-10">
        <div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-steel leading-none">Não é só uma lavagem. É um processo.</h2>
          <p className="mt-4 text-steel-line max-w-sm">Todo carro que entra na Clean Car passa pelas mesmas etapas, nesta ordem.</p>
        </div>
        <ol className="border-t border-card-line">
          {passos.map((p, i) => {
            const sel = i === aberto;
            return (
              <li key={p.id} className="border-b border-card-line">
                <button
                  type="button"
                  onClick={() => setAberto(sel ? -1 : i)}
                  aria-expanded={sel}
                  className="w-full flex items-center gap-5 py-5 text-left focus-visible:outline-2 focus-visible:outline-verniz"
                >
                  <span className={`font-display font-bold text-sm tabular-nums ${sel ? "text-verniz-shine" : "text-steel-line"}`}>
                    {i + 1}/{passos.length}
                  </span>
                  <span className={`flex-1 font-display font-bold text-xl md:text-2xl ${sel ? "text-steel" : "text-steel/80"}`}>{p.titulo}</span>
                  <Plus size={20} className={`shrink-0 text-steel-line transition-transform duration-300 ${sel ? "rotate-45 text-verniz-shine" : ""}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ${sel ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <p className="overflow-hidden text-steel-line leading-relaxed pl-[3.25rem] pr-8">
                    <span className="block pb-6">{p.texto}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
