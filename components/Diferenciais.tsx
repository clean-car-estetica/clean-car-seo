// Por que fechar com a Clean Car: quatro fatos do próprio atendimento
// (estão nas observações e no FAQ), sem promessa vaga.
const ITENS = [
  { titulo: "Avaliação gratuita", texto: "Olhamos o carro com você antes de começar e confirmamos o valor." },
  { titulo: "Garantia de execução", texto: "Notou alguma falha? Avise em até 48h e a gente corrige." },
  { titulo: "Produtos Vonixx", texto: "Química profissional em todas as etapas, do shampoo ao acabamento." },
  { titulo: "Hora marcada", texto: "Sem fila: você agenda pelo WhatsApp e já sabe quando buscar." },
];

export default function Diferenciais({ className = "" }: { className?: string }) {
  return (
    <section className={`mx-auto max-w-6xl px-6 ${className}`} aria-label="Por que escolher a Clean Car">
      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 lg:gap-x-0 border-y border-card-line lg:divide-x divide-card-line">
        {ITENS.map((i) => (
          <div key={i.titulo} className="py-5 lg:py-6 lg:px-6 first:lg:pl-0 last:lg:pr-0">
            <dt className="font-display font-bold text-lg lg:text-xl text-steel">{i.titulo}</dt>
            <dd className="mt-1 text-sm text-steel-line leading-relaxed">{i.texto}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
