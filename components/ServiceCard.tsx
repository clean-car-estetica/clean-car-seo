import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ServiceCard({
  slug,
  nome,
  resumo,
  precoDesde,
  image,
  tag,
}: {
  slug: string;
  nome: string;
  resumo: string;
  precoDesde?: number;
  image: string;
  tag?: string;
}) {
  return (
    <Link
      href={`/servicos/${slug}`}
      className="group rounded-2xl bg-card border border-card-line overflow-hidden hover:border-verniz/60 transition-colors"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={image}
          alt={nome}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {tag && (
          <span className="absolute top-3 right-3 text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-black/70 backdrop-blur text-verniz-shine border border-verniz-glow">
            {tag}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display font-bold text-xl text-steel group-hover:text-verniz-shine">{nome}</h3>
        <p className="mt-2 text-sm text-steel-line leading-relaxed">{resumo}</p>
        <div className="mt-5 flex items-center justify-between border-t border-card-line pt-4">
          {precoDesde ? (
            <span className="font-display font-extrabold text-verniz-shine">A partir de R$ {precoDesde}</span>
          ) : (
            <span className="text-xs text-steel-line">Consulte valores</span>
          )}
          <span className="flex items-center gap-1 text-xs font-bold text-steel-line group-hover:text-verniz-shine">
            Ver mais <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
