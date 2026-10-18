import { CalendarClock } from "lucide-react";
import Midia from "@/components/Midia";
import type { CampanhaItem } from "@/lib/site-content";
import { whatsappLink, type Contato } from "@/lib/config";
import { mensagemCampanhaProxima, quandoComeca, reais } from "@/lib/campanha";
import CampanhaBotao from "@/components/CampanhaBotao";

// 18/10/2026: "Vem aí" — a próxima campanha cadastrada no SAS (ex.: a do
// mês seguinte). Aparece sozinha quando há campanha agendada e some quando
// ela começa (aí vira a faixa da campanha normal).
export default function CampanhaEmBreve({ campanha: c, contato }: { campanha: CampanhaItem | null; contato: Contato }) {
  if (!c || !c.inicia_em) return null;
  return (
    <section aria-label="Próxima campanha" className="mx-auto max-w-6xl px-6 pt-8">
      <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] rounded-3xl overflow-hidden border border-dashed border-cera/60 bg-card">
        {c.imagem_url && <Midia src={c.imagem_url} alt={c.titulo} className="w-full h-44 md:h-full object-cover" />}
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cera">
            <CalendarClock size={16} aria-hidden /> Vem aí · {quandoComeca(c.inicia_em)}
          </p>
          <h2 className="mt-2 font-display font-extrabold text-3xl md:text-4xl text-steel leading-tight">{c.titulo}</h2>
          {c.selo && <p className="mt-1 font-display font-bold text-xl text-verniz-shine">{c.selo}</p>}
          {c.texto && <p className="mt-3 text-steel-line leading-relaxed">{c.texto}</p>}
          {c.preco_por != null && (
            <p className="mt-3 text-steel">
              {c.preco_de != null && <span className="text-steel-line line-through mr-2">{reais(c.preco_de)}</span>}
              <b className="text-verniz-shine">{reais(c.preco_por)}</b> na campanha
            </p>
          )}
          <div className="mt-5">
            <CampanhaBotao href={whatsappLink(contato, mensagemCampanhaProxima(c))} className="inline-block rounded-full border border-cera text-cera font-display font-bold px-6 py-2.5 hover:bg-cera hover:text-carbon transition-colors">
              Quero garantir meu horário
            </CampanhaBotao>
          </div>
          {c.observacao && <p className="mt-4 text-xs text-steel-line">{c.observacao}</p>}
        </div>
      </div>
    </section>
  );
}
