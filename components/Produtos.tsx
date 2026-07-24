const PRODUTOS = [
  { nome: "V-Mol", uso: "Pré-lavagem que desincrusta sujeira mineral sem risco à pintura." },
  { nome: "V-Floc", uso: "Shampoo neutro que limpa e protege a pintura durante a lavagem." },
  { nome: "Delet", uso: "Descontaminação de rodas e caixas de roda." },
  { nome: "Sintra Pró", uso: "Limpeza e sanitização de painel, console e ambiente interno." },
  { nome: "Hidrox", uso: "Selante com alta hidrofobia — repele água e protege contra chuva ácida e raios UV." },
  { nome: "Glasy", uso: "Limpeza e descontaminação de vidros, internos e externos." },
];

export default function Produtos() {
  return (
    <section className="bg-carbon-soft border-y border-card-line py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-cera/10 border border-cera/30 px-4 py-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-cera" />
            <span className="text-xs font-display font-bold tracking-wide text-cera uppercase">Linha Vonixx</span>
          </span>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
            Produtos que <span className="text-verniz-shine">usamos</span>
          </h2>
          <p className="mt-2 text-steel-line max-w-xl mx-auto">
            Química de ponta em cada etapa — hidrofobia, descontaminação e proteção de verdade.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUTOS.map((p) => (
            <div key={p.nome} className="bg-card border border-card-line rounded-2xl p-5">
              <h3 className="font-display font-bold text-verniz-shine mb-1">{p.nome}</h3>
              <p className="text-sm text-steel-line leading-relaxed">{p.uso}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
