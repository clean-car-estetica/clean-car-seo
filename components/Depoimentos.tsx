import { Star } from "lucide-react";
import type { AvaliacaoGoogle, DepoimentoDB, ResumoGoogle } from "@/lib/site-data";
import LinksGoogle from "@/components/LinksGoogle";

function Estrelas({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${n} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={14} className={i < n ? "fill-cera text-cera" : "text-card-line"} />
      ))}
    </div>
  );
}

function quando(iso: string) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (dias < 1) return "hoje";
  if (dias < 30) return `há ${dias} dia${dias > 1 ? "s" : ""}`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return `há ${meses} ${meses > 1 ? "meses" : "mês"}`;
  return new Date(iso).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

// Avaliações reais do Google primeiro (com foto, nota e data); depois os
// depoimentos escritos à mão no painel, até completar a grade.
export default function Depoimentos({
  itens,
  google = [],
  resumo,
}: {
  itens: DepoimentoDB[];
  google?: AvaliacaoGoogle[];
  resumo?: ResumoGoogle;
}) {
  const manuais = itens.slice(0, Math.max(0, 6 - google.length));
  if (google.length === 0 && manuais.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
          O que dizem <span className="text-verniz-shine">no Google</span>
        </h2>
        {resumo?.nota && resumo.total ? (
          <p className="mt-3 inline-flex items-center gap-2 text-steel-line">
            <Estrelas n={Math.round(resumo.nota)} />
            <b className="text-steel">{resumo.nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</b> de 5 · {resumo.total} avaliações
          </p>
        ) : null}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {google.map((a) => (
          <figure key={a.chave} className="bg-card border border-card-line rounded-2xl p-6 flex flex-col">
            <Estrelas n={a.nota} />
            <blockquote className="text-sm text-steel-line leading-relaxed my-4 line-clamp-6">&ldquo;{a.texto}&rdquo;</blockquote>
            <figcaption className="mt-auto flex items-center gap-3">
              {a.foto_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.foto_url} alt="" width={32} height={32} loading="lazy" referrerPolicy="no-referrer" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <span className="w-8 h-8 rounded-full bg-carbon grid place-items-center text-xs font-bold text-steel-line">{a.autor[0]}</span>
              )}
              <span className="min-w-0">
                <span className="block text-xs font-display font-bold text-steel">{a.autor}</span>
                <span className="block text-[11px] text-steel-line">Google · {quando(a.publicado_em)}</span>
              </span>
            </figcaption>
          </figure>
        ))}
        {manuais.map((d) => (
          <div key={d.id} className="bg-card border border-card-line rounded-2xl p-6">
            <div className="mb-3"><Estrelas n={d.nota} /></div>
            <p className="text-sm text-steel-line leading-relaxed mb-4">&ldquo;{d.texto}&rdquo;</p>
            <p className="text-xs font-display font-bold text-steel-line">{d.autor}</p>
          </div>
        ))}
      </div>
      <LinksGoogle />
    </section>
  );
}
