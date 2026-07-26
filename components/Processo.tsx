import { Sparkles } from "lucide-react";
import type { PassoDB } from "@/lib/site-data";

export default function Processo({ passos }: { passos: PassoDB[] }) {
  if (passos.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
          Não é só uma lavagem. <span className="text-verniz-shine">É um processo.</span>
        </h2>
        <p className="mt-2 text-steel-line max-w-xl mx-auto">
          Cada carro que entra na Clean Car passa pelas mesmas etapas técnicas, sempre.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {passos.map((p) => (
          <div key={p.id} className="bg-card border border-card-line rounded-2xl p-5">
            <div className="w-10 h-10 rounded-full bg-verniz/10 flex items-center justify-center mb-4">
              <Sparkles size={20} className="text-verniz-shine" />
            </div>
            <h3 className="font-display font-bold text-steel mb-2">{p.titulo}</h3>
            <p className="text-sm text-steel-line leading-relaxed">{p.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
