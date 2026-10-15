import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import { SITE_URL } from "@/lib/config";
import { caminhoGuia, getGuiasPublicadas, NOME_TIPO, ROTA_GUIA, type TipoGuia } from "@/lib/guias";

const TEXTOS: Record<TipoGuia, { titulo: string; descricao: string; h1: string; sub: string }> = {
  problema: {
    titulo: "Problemas e soluções para o seu carro | Clean Car Mogi das Cruzes",
    descricao:
      "Cheiro ruim, banco manchado, farol amarelado, plástico esbranquiçado: veja o que causa cada problema e como a Clean Car resolve, em Mogi das Cruzes.",
    h1: "Qual é o problema do seu carro?",
    sub: "Escolha o que está incomodando e veja o que causa e como a gente resolve.",
  },
  publico: {
    titulo: "Cuidado automotivo para o seu dia a dia | Clean Car Mogi das Cruzes",
    descricao:
      "Motorista de aplicativo, família com crianças, quem tem pet, quem vai vender o carro: o cuidado certo para cada rotina, na Clean Car em Mogi das Cruzes.",
    h1: "O cuidado certo para a sua rotina",
    sub: "Cada uso do carro pede um cuidado diferente. Encontre o seu.",
  },
};

export async function metadataIndice(tipo: TipoGuia): Promise<Metadata> {
  const guias = await getGuiasPublicadas(tipo);
  const t = TEXTOS[tipo];
  return {
    title: { absolute: t.titulo },
    description: t.descricao,
    alternates: { canonical: `${SITE_URL}${ROTA_GUIA[tipo]}` },
    // Enquanto não houver guia publicada, a lista vazia não entra no Google
    ...(guias.length ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function GuiasIndice({ tipo }: { tipo: TipoGuia }) {
  const guias = await getGuiasPublicadas(tipo);
  const t = TEXTOS[tipo];
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">{NOME_TIPO[tipo]}</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-steel text-balance">{t.h1}</h1>
          <p className="mt-4 text-lg text-steel-line max-w-2xl">{t.sub}</p>

          {guias.length === 0 ? (
            <p className="mt-10 text-steel-line">Estamos preparando este conteúdo — volte em breve.</p>
          ) : (
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {guias.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={caminhoGuia(g)}
                    className="block h-full rounded-2xl bg-card border border-card-line p-6 hover:border-verniz transition-colors"
                  >
                    {g.chamada && <span className="block text-sm font-display font-bold text-verniz-shine">{g.chamada}</span>}
                    <span className="block mt-1 font-display font-bold text-xl text-steel text-balance">{g.titulo}</span>
                    {g.meta_descricao && <span className="block mt-2 text-sm text-steel-line leading-relaxed line-clamp-3">{g.meta_descricao}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
