// Faixa que corre com os nomes dos serviços, logo abaixo do topo.
// É o único movimento automático da página além do vídeo.
export default function FaixaServicos({ nomes }: { nomes: string[] }) {
  if (nomes.length === 0) return null;
  const itens = [...nomes, ...nomes];
  return (
    <div className="faixa border-y border-card-line bg-carbon-soft overflow-hidden" aria-hidden="true">
      <div className="faixa-trilho flex w-max gap-10 py-4">
        {itens.map((n, i) => (
          <span key={i} className="flex items-center gap-10 font-display font-bold text-lg md:text-xl text-steel-line whitespace-nowrap">
            {n}
            <span className="h-1.5 w-1.5 rotate-45 bg-verniz" />
          </span>
        ))}
      </div>
    </div>
  );
}
