import { blocosDeTexto } from "@/lib/guias";

/**
 * Texto simples do console (parágrafos separados por linha em branco, listas
 * com "- " e subtítulos com "## ") virando HTML legível. Sem markdown
 * completo de propósito: o que se digita no console é o que aparece.
 */
export default function TextoRico({ texto, className = "" }: { texto: string; className?: string }) {
  // Subtítulos "## " viram h2 e separam blocos
  const partes = texto.split(/\n(?=##\s)/);
  return (
    <div className={`space-y-5 ${className}`}>
      {partes.map((parte, i) => {
        const m = parte.match(/^##\s+(.+)\n?([\s\S]*)$/);
        const titulo = m ? m[1].trim() : null;
        const corpo = m ? m[2] : parte;
        return (
          <div key={i} className="space-y-5">
            {titulo && <h2 className="font-display font-bold text-2xl md:text-3xl text-steel pt-4 text-balance">{titulo}</h2>}
            {blocosDeTexto(corpo).map((b, j) =>
              b.tipo === "ul" ? (
                <ul key={j} className="grid gap-2 pl-1">
                  {b.itens.map((item) => (
                    <li key={item} className="flex gap-3 text-steel-line leading-relaxed">
                      <span aria-hidden className="mt-2.5 h-1.5 w-1.5 rounded-full bg-verniz-shine shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p key={j} className="text-steel-line leading-relaxed text-lg">
                  {b.texto}
                </p>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}
