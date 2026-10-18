import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import WhatsappCTA from "@/components/WhatsappCTA";
import AgendarButton from "@/components/AgendarButton";
import { SITE_URL } from "@/lib/config";
import { getServicosPublicos, type ServicoDB } from "@/lib/site-data";
import { SERVICOS_DOMICILIO, OBSERVACOES_SERVICOS } from "@/lib/data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "Tabela de preços de estética automotiva em Mogi das Cruzes | Clean Car" },
  description:
    "Quanto custa lavar, higienizar, restaurar farol ou revitalizar plástico na Clean Car, em Mogi das Cruzes: todos os serviços com preço, tempo e o que inclui.",
  alternates: { canonical: `${SITE_URL}/precos` },
};

// Grupos da tabela, na ordem em que o cliente costuma procurar
const GRUPOS: { titulo: string; slugs: string[] }[] = [
  { titulo: "Lavagens", slugs: ["lavagem-bronze", "lavagem-prata", "lavagem-ouro"] },
  { titulo: "Interior e higienização", slugs: ["higienizacao", "higienizacao-banco-dianteiro", "higienizacao-banco-traseiro", "revitalizacao-plastico", "tratamento-anti-odor", "hidratacao-de-couro"] },
  { titulo: "Por fora: proteção e acabamento", slugs: ["revitalizacao-plastico-externo", "restauracao-de-farol", "cristalizacao-de-vidros", "lavagem-pesada-de-rodas", "enceramento-tecnico"] },
  { titulo: "Motor", slugs: ["lavagem-motor"] },
  { titulo: "Na sua casa", slugs: ["higienizacao-de-estofados"] },
];

export default async function PrecosPage() {
  const servicos = await getServicosPublicos();
  const porSlug = new Map(servicos.map((s) => [s.slug, s]));
  const usados = new Set(GRUPOS.flatMap((g) => g.slugs));
  // Serviço novo criado no console e ainda sem grupo aparece em "Outros"
  const outros = servicos.filter((s) => !usados.has(s.slug));
  const grupos = [...GRUPOS.map((g) => ({ titulo: g.titulo, itens: g.slugs.map((s) => porSlug.get(s)).filter((s): s is ServicoDB => Boolean(s)) })), { titulo: "Outros", itens: outros }].filter((g) => g.itens.length);
  const precos = servicos.map((s) => s.preco_desde).filter((p): p is number => Boolean(p)).map(Number);
  const atualizado = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-8">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">Tabela de preços</p>
          <h1 className="font-display font-extrabold text-4xl md:text-6xl text-steel text-balance leading-[0.95]">Quanto custa cada serviço na Clean Car</h1>
          <p className="mt-5 text-lg text-steel-line max-w-2xl">
            Preços na loja do Jardim Universo, em Mogi das Cruzes. Atualizado em {atualizado}.
            {precos.length ? ` Serviços de R$ ${Math.min(...precos)} a R$ ${Math.max(...precos)}.` : ""}
          </p>
          <ul className="mt-5 grid gap-1 text-sm text-steel-line">
            {OBSERVACOES_SERVICOS.map((o) => (
              <li key={o}>· {o}</li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <AgendarButton className="rounded-full bg-verniz text-carbon font-display font-bold px-7 py-3 hover:bg-verniz-shine">Agendar pelo WhatsApp</AgendarButton>
            <Link href="/qual-cuidado" className="rounded-full border border-card-line px-6 py-3 font-display font-bold text-steel hover:border-verniz">
              Não sabe qual escolher? Faça o teste rápido
            </Link>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 pb-16 grid gap-12">
          {grupos.map((g) => (
            <section key={g.titulo}>
              <h2 className="font-display font-bold text-2xl md:text-3xl text-steel mb-4">{g.titulo}</h2>
              <div className="overflow-x-auto rounded-2xl border border-card-line">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-card text-steel-line">
                    <tr>
                      <th className="px-4 py-3 font-display font-bold uppercase tracking-wide text-xs">Serviço</th>
                      <th className="px-4 py-3 font-display font-bold uppercase tracking-wide text-xs">Tempo</th>
                      <th className="px-4 py-3 font-display font-bold uppercase tracking-wide text-xs text-right">Preço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.itens.map((s) => (
                      <tr key={s.slug} className="border-t border-card-line align-top">
                        <td className="px-4 py-4">
                          <Link href={`/servicos/${s.slug}`} className="font-display font-bold text-lg text-steel hover:text-verniz-shine">
                            {s.nome}
                          </Link>
                          <p className="text-steel-line mt-1 max-w-xl">{s.resumo}</p>
                        </td>
                        <td className="px-4 py-4 text-steel-line whitespace-nowrap tabular-nums">
                          {SERVICOS_DOMICILIO.includes(s.slug) ? "Na sua casa" : s.duracao ?? "—"}
                        </td>
                        <td className="px-4 py-4 text-right whitespace-nowrap">
                          {s.preco_desde ? (
                            <>
                              <span className="block text-xs text-steel-line">a partir de</span>
                              <span className="font-display font-extrabold text-2xl text-verniz-shine tabular-nums">R$ {s.preco_desde}</span>
                              {s.avaliacao_previa && <span className="block text-xs text-steel-line">com avaliação prévia</span>}
                            </>
                          ) : (
                            <span className="font-display font-bold text-verniz-shine">Sob avaliação gratuita</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}

          <section className="rounded-2xl bg-card border border-card-line p-6 md:p-8 grid gap-4">
            <h2 className="font-display font-bold text-2xl text-steel">Quer saber o valor exato do seu carro?</h2>
            <p className="text-steel-line max-w-2xl">
              Mande o modelo e uma foto pelo WhatsApp. A avaliação é gratuita e você recebe o valor antes de agendar. Cada serviço tem
              garantia: 24 horas nas lavagens e 72 horas nas higienizações.
            </p>
            <div className="flex flex-wrap gap-3">
              <WhatsappCTA texto="Pedir o valor do meu carro" />
            </div>
          </section>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "OfferCatalog",
              name: "Tabela de preços da Clean Car Estética Automotiva",
              url: `${SITE_URL}/precos`,
              provider: { "@id": `${SITE_URL}/#empresa` },
              itemListElement: servicos
                .filter((s) => s.preco_desde)
                .map((s) => ({
                  "@type": "Offer",
                  price: Number(s.preco_desde),
                  priceCurrency: "BRL",
                  url: `${SITE_URL}/servicos/${s.slug}`,
                  itemOffered: { "@type": "Service", name: s.nome, description: s.resumo, areaServed: "Mogi das Cruzes e região" },
                })),
            }),
          }}
        />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
