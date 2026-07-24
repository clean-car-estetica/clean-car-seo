import { Star } from "lucide-react";
import type { DepoimentoDB } from "@/lib/site-data";

export default function Depoimentos({ itens }: { itens: DepoimentoDB[] }) {
  if (itens.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
          O que dizem <span className="text-verniz-shine">no Google</span>
        </h2>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((d) => (
          <div key={d.id} className="bg-card border border-card-line rounded-2xl p-6">
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={14} className={i < d.nota ? "fill-cera text-cera" : "text-card-line"} />
              ))}
            </div>
            <p className="text-sm text-steel-line leading-relaxed mb-4">"{d.texto}"</p>
            <p className="text-xs font-display font-bold text-steel-line">{d.autor}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
