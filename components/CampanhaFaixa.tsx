import Midia from "@/components/Midia";
import type { Campanha } from "@/lib/site-content";
import type { Contato } from "@/lib/config";
import { linkCampanha, validadeCampanha, reais } from "@/lib/campanha";
import CampanhaBotao from "@/components/CampanhaBotao";

// Faixa da campanha na página inicial (logo depois do topo). Some sozinha
// quando a campanha é desligada no console ou passa da data de fim.
export default function CampanhaFaixa({ campanha: c, contato }: { campanha: Campanha; contato: Contato }) {
  if (!c.ativo) return null;
  const validade = validadeCampanha(c.termina_em);
  return (
    <section aria-label="Campanha" className="mx-auto max-w-6xl px-6 pt-10">
      <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden border border-verniz/50 bg-card">
        {c.imagem_url && (
          <Midia src={c.imagem_url} alt={c.titulo} className="w-full h-56 md:h-full object-cover" />
        )}
        <div className="p-6 md:p-10 flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-wide text-verniz-shine">{c.titulo}</p>
          {c.selo && (
            <p className="mt-1 font-display font-extrabold text-6xl md:text-7xl leading-none text-steel">{c.selo}</p>
          )}
          {c.texto && <p className="mt-3 text-steel-line leading-relaxed">{c.texto}</p>}
          {c.preco_por != null && (
            <p className="mt-4 flex items-baseline gap-3">
              {c.preco_de != null && <span className="text-steel-line line-through">de {reais(c.preco_de)}</span>}
              <span className="font-display font-extrabold text-4xl text-verniz-shine">por {reais(c.preco_por)}</span>
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <CampanhaBotao href={linkCampanha(c, contato)} className="rounded-full bg-verniz text-carbon font-display font-bold px-7 py-3 hover:bg-verniz-shine transition-colors">
              {c.texto_botao}
            </CampanhaBotao>
            {validade && <span className="text-sm font-bold text-steel-line">{validade}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
