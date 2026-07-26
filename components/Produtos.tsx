export default function Produtos({ produtos }: { produtos: string[] }) {
  if (produtos.length === 0) return null;
  return (
    <section className="bg-carbon-soft border-y border-card-line py-16">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-steel mb-2">
          Produtos que <span className="text-verniz-shine">usamos</span>
        </h2>
        <p className="text-steel-line text-sm max-w-lg mx-auto mb-8">
          Trabalhamos com produtos profissionais adquiridos de fornecedores especializados,
          aplicados por técnicos treinados.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {produtos.map((p) => (
            <span
              key={p}
              className="px-4 py-2 rounded-full bg-card border border-card-line text-sm font-display font-bold text-steel-line"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
