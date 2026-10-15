import Link from "next/link";
import Midia from "@/components/Midia";
import AgendarButton from "@/components/AgendarButton";
import type { ServicoDB } from "@/lib/site-data";

// Cartões dos serviços que resolvem o assunto da página (guias, blog e
// perguntas). Cada um leva à página do serviço e ao WhatsApp.
export default function ServicosIndicados({
  servicos,
  titulo = "Como a Clean Car resolve",
}: {
  servicos: ServicoDB[];
  titulo?: string;
}) {
  if (servicos.length === 0) return null;
  return (
    <section className="mx-auto max-w-5xl px-6 py-14">
      <h2 className="font-display font-bold text-3xl md:text-4xl text-steel mb-8 text-balance">{titulo}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {servicos.map((s) => (
          <article key={s.slug} className="rounded-2xl bg-card border border-card-line overflow-hidden flex flex-col">
            {s.imagem_url ? (
              <Link href={`/servicos/${s.slug}`} className="block aspect-[16/9] bg-carbon overflow-hidden">
                <Midia src={s.imagem_url} alt={s.nome} className="foto-servico h-full w-full object-cover" lazy />
              </Link>
            ) : null}
            <div className="p-5 flex flex-col flex-1">
              <h3 className="font-display font-bold text-xl text-steel">
                <Link href={`/servicos/${s.slug}`} className="hover:text-verniz-shine">
                  {s.nome}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-steel-line leading-relaxed flex-1">{s.resumo}</p>
              <p className="mt-4 font-display font-bold text-verniz-shine">
                {s.preco_desde ? `A partir de R$ ${s.preco_desde}` : "Valor sob avaliação gratuita"}
                {s.duracao ? <span className="text-steel-line font-normal text-sm"> · {s.duracao}</span> : null}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={`/servicos/${s.slug}`}
                  className="rounded-full border border-card-line px-4 py-2 text-sm font-display font-bold text-steel hover:border-verniz hover:text-verniz-shine"
                >
                  Ver o serviço
                </Link>
                <AgendarButton
                  servico={s.nome}
                  className="rounded-full bg-verniz text-carbon px-4 py-2 text-sm font-display font-bold hover:bg-verniz-shine"
                >
                  Agendar
                </AgendarButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
