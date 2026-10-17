import Link from "next/link";
import { SITE_URL } from "@/lib/config";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import Faq, { type FaqItem } from "@/components/Faq";
import { getServicosPublicos } from "@/lib/site-data";
import { temPaginaLocal } from "@/lib/paginas-locais";

// 17/10/2026: quem procura no Google escreve "lava rápido", não "estética
// automotiva". Esta página responde a essa busca com texto de verdade (o Google
// ignora a meta keywords), explicando o que a Clean Car oferece a quem procura
// um lava-rápido. Serviços e preços vêm do SAS, como no resto do site.
export const revalidate = 3600;

export const metadata = {
  title: "Lava-Rápido em Mogi das Cruzes | Lavagem de Carro com Hora Marcada",
  description:
    "Procurando lava-rápido em Mogi das Cruzes? Na Clean Car você lava o carro com hora marcada, sem fila, com produtos Vonixx e garantia. Jardim Universo, perto de Suzano e do Alto Tietê.",
  alternates: { canonical: `${SITE_URL}/lava-rapido-mogi-das-cruzes` },
};

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const PERGUNTAS: FaqItem[] = [
  {
    id: 9001,
    pergunta: "A Clean Car é um lava-rápido?",
    resposta:
      "Somos uma estética automotiva, mas fazemos tudo o que você procura num lava-rápido: lavagem por fora e por dentro, aspiração, pneu pretinho e limpeza dos vidros. A diferença é o cuidado: hora marcada, produtos profissionais Vonixx e um processo que não risca a pintura.",
  },
  {
    id: 9002,
    pergunta: "Quanto custa lavar o carro em Mogi das Cruzes?",
    resposta:
      "Depende do tamanho do carro e do tipo de lavagem. Os preços atualizados de cada lavagem estão nesta página e na página de preços, e a avaliação do carro é gratuita.",
  },
  {
    id: 9003,
    pergunta: "Preciso agendar ou posso chegar?",
    resposta:
      "Trabalhamos com hora marcada para você não pegar fila. Dá para agendar pelo site ou pelo WhatsApp em poucos segundos, e o horário fica reservado para o seu carro.",
  },
  {
    id: 9004,
    pergunta: "Quanto tempo demora uma lavagem?",
    resposta:
      "Depende da lavagem escolhida: a mais simples é a mais rápida, e as completas e as higienizações levam mais tempo. A duração de cada uma aparece na lista de lavagens desta página.",
  },
  {
    id: 9005,
    pergunta: "Atendem quem é de Suzano, Poá e outras cidades do Alto Tietê?",
    resposta:
      "Sim. Ficamos no Jardim Universo, em Mogi das Cruzes, e recebemos clientes de Suzano, Poá, Ferraz de Vasconcelos, Itaquaquecetuba, Guararema e de toda a região.",
  },
];

export default async function LavaRapidoMogiPage() {
  const servicos = await getServicosPublicos();
  const lavagens = servicos.filter((s) => /lavagem|lava/i.test(`${s.slug} ${s.nome}`));
  const outros = servicos.filter((s) => !lavagens.includes(s)).slice(0, 6);
  const link = (slug: string) =>
    temPaginaLocal(slug, "mogi-das-cruzes") ? `/servicos/${slug}/mogi-das-cruzes` : `/servicos/${slug}`;

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="bg-carbon text-steel">
          <div className="mx-auto max-w-4xl px-6 py-20">
            <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">
              Mogi das Cruzes · Alto Tietê
            </p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight">
              Lava-rápido em Mogi das Cruzes, com hora marcada
            </h1>
            <p className="mt-6 text-lg text-steel-line max-w-2xl leading-relaxed">
              Precisa lavar o carro? Na Clean Car você agenda o horário, chega e não pega fila. Lavagem por fora e por
              dentro com produtos Vonixx, sem riscar a pintura, e garantia de 24 horas.
            </p>
            <AgendarButton className="inline-block mt-8 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
              Agendar lavagem
            </AgendarButton>
          </div>
        </section>

        {lavagens.length > 0 && (
          <section className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="font-display font-bold text-2xl mb-6 text-steel">Lavagens e preços</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {lavagens.map((s) => (
                <Link
                  key={s.slug}
                  href={link(s.slug)}
                  className="rounded-xl bg-card border border-card-line px-4 py-4 hover:border-verniz"
                >
                  <span className="block font-display font-bold text-steel">{s.nome}</span>
                  <span className="block text-sm text-steel-line mt-1">
                    {s.preco_desde ? `a partir de ${reais(s.preco_desde)}` : "consulte o valor"}
                    {s.duracao ? ` · ${s.duracao}` : ""}
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-sm text-steel-line">
              Veja todos os valores na <Link href="/precos" className="text-verniz-shine underline underline-offset-2">página de preços</Link>.
            </p>
          </section>
        )}

        <section className="bg-carbon-soft border-y border-card-line py-16">
          <div className="mx-auto max-w-4xl px-6 space-y-4 text-steel-line leading-relaxed">
            <h2 className="font-display font-bold text-2xl text-steel">Por que lavar na Clean Car em vez de um lava-rápido comum</h2>
            <p>
              Num lava-rápido comum o carro entra na fila e a lavagem é feita com pressa. Aqui cada carro tem horário
              reservado, então o serviço é feito com calma e você sabe exatamente a hora de buscar.
            </p>
            <p>
              Usamos pré-lavagem com espuma, shampoo neutro e luvas de microfibra exclusivas, o que evita os riscos
              finos que aparecem na pintura com o tempo. Os produtos são profissionais da Vonixx.
            </p>
            <p>
              Ficamos no Jardim Universo, em Mogi das Cruzes, e atendemos quem vem de Suzano, Poá, Ferraz de
              Vasconcelos, Itaquaquecetuba e Guararema. Veja também nossa{" "}
              <Link href="/mogi-das-cruzes" className="text-verniz-shine underline underline-offset-2">estética automotiva em Mogi das Cruzes</Link>.
            </p>
          </div>
        </section>

        {outros.length > 0 && (
          <section className="mx-auto max-w-4xl px-6 py-16">
            <h2 className="font-display font-bold text-2xl mb-6 text-steel">Além da lavagem</h2>
            <div className="flex flex-wrap gap-2">
              {outros.map((s) => (
                <Link
                  key={s.slug}
                  href={link(s.slug)}
                  className="rounded-full bg-card border border-card-line px-4 py-2 text-sm text-steel-line hover:border-verniz hover:text-verniz-shine"
                >
                  {s.termo_popular || s.nome}
                </Link>
              ))}
            </div>
          </section>
        )}

        <Faq itens={PERGUNTAS} />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
