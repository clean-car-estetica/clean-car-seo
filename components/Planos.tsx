import { Check } from "lucide-react";
import type { PlanoDB } from "@/lib/site-data";
import AssinarPlanoButton from "@/components/AssinarPlanoButton";

export default function Planos({ itens }: { itens: PlanoDB[] }) {
  if (itens.length === 0) return null;

  return (
    <section id="planos" className="bg-carbon-soft border-y border-card-line py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
            Planos <span className="text-verniz-shine">mensais</span>
          </h2>
          <p className="mt-2 text-steel-line max-w-xl mx-auto">
            Cuide do seu carro com regularidade e economize no plano certo pra sua rotina.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {itens.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl p-6 border ${p.destaque ? "bg-card border-verniz shadow-[0_0_25px_var(--verniz-glow)]" : "bg-card border-card-line"}`}
            >
              {p.destaque && (
                <span className="inline-block text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-verniz/15 text-verniz-shine mb-3">
                  Mais popular
                </span>
              )}
              <h3 className="font-display font-bold text-xl text-steel">{p.nome}</h3>
              <p className="mt-3">
                <span className="font-display font-extrabold text-3xl text-verniz-shine">R$ {p.preco}</span>
                <span className="text-steel-line text-sm">/mês</span>
              </p>
              <p className="mt-3 text-sm text-steel-line leading-relaxed">{p.descricao}</p>
              {p.itens.length > 0 && (
                <ul className="mt-4 grid gap-2">
                  {p.itens.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-steel-line">
                      <Check size={16} className="text-verniz-shine shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <AssinarPlanoButton
                nomePlano={p.nome}
                preco={p.preco}
                className="inline-block mt-6 w-full text-center rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2.5 text-sm hover:bg-verniz-shine transition-colors"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
