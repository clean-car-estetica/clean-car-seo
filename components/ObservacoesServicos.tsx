import { OBSERVACOES_SERVICOS } from "@/lib/data";

export default function ObservacoesServicos({ className = "" }: { className?: string }) {
  return (
    <div className={`text-xs text-steel-line/80 leading-relaxed ${className}`}>
      <p className="font-display font-bold uppercase tracking-wide text-steel-line mb-2">Observações gerais</p>
      <ul className="grid gap-1 list-disc pl-4">
        {OBSERVACOES_SERVICOS.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ul>
    </div>
  );
}
