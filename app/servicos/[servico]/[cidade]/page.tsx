import { SITE_URL } from "@/lib/config";
import { fotoServico } from "@/lib/fotos";
import ServicoTopo from "@/components/ServicoTopo";
import Diferenciais from "@/components/Diferenciais";
import BarraAgendarCelular from "@/components/BarraAgendarCelular";
import ServicosLista from "@/components/ServicosLista";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import { servicos, cidades, SERVICOS_SEM_PAGINAS_LOCAIS } from "@/lib/data";
import { getServicoPublico, getConteudoLocalPublico, getCidadesPublicas, getCidadePublica, getServicosPublicos } from "@/lib/site-data";

export const revalidate = 60;

export function generateStaticParams() {
  return servicos
    .filter((s) => !SERVICOS_SEM_PAGINAS_LOCAIS.includes(s.slug))
    .flatMap((s) => cidades.map((c) => ({ servico: s.slug, cidade: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ servico: string; cidade: string }>;
}): Promise<Metadata> {
  const { servico: servicoSlug, cidade: cidadeSlug } = await params;
  const servico = await getServicoPublico(servicoSlug);
  const cidade = await getCidadePublica(cidadeSlug);
  if (!servico || !cidade) return {};
  const tituloBase = servico.termo_popular || servico.nome;
  // Só indexa se a página tiver texto próprio cadastrado (Páginas locais);
  // texto genérico repetido em todas as cidades o Google descarta.
  const conteudo = await getConteudoLocalPublico(servico, cidade);
  const preco = servico.preco_desde ? ` a partir de R$ ${servico.preco_desde}` : "";
  const titulo = `${tituloBase} em ${cidade.nome}${servico.preco_desde ? ` · R$ ${servico.preco_desde}` : ""} | Clean Car`;
  const descricao = `${servico.nome} para quem é de ${cidade.nome}: ${servico.resumo}${preco ? ` A partir de R$ ${servico.preco_desde}` : ""}, na nossa loja em Mogi das Cruzes, com hora marcada. Agende pelo WhatsApp.`;
  return {
    title: { absolute: titulo },
    description: descricao,
    alternates: { canonical: conteudo.proprio ? `${SITE_URL}/servicos/${servico.slug}/${cidade.slug}` : `${SITE_URL}/servicos/${servico.slug}` },
    robots: conteudo.proprio ? undefined : { index: false, follow: true },
  };
}

export default async function ServicoCidadePage({
  params,
}: {
  params: Promise<{ servico: string; cidade: string }>;
}) {
  const { servico: servicoSlug, cidade: cidadeSlug } = await params;
  if (SERVICOS_SEM_PAGINAS_LOCAIS.includes(servicoSlug)) return notFound();
  const servico = await getServicoPublico(servicoSlug);
  const cidade = await getCidadePublica(cidadeSlug);
  if (!servico || !cidade) return notFound();

  const [conteudo, todos, cidades] = await Promise.all([
    getConteudoLocalPublico(servico, cidade),
    getServicosPublicos(),
    getCidadesPublicas(),
  ]);
  const outros = todos.filter((x) => x.slug !== servico.slug).slice(0, 6);
  const imagemFundo = fotoServico(servico.slug, conteudo.imagemOverride || servico.imagem_url);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <ServicoTopo
          titulo={`${servico.termo_popular || servico.nome} em ${cidade.nome}`}
          nomeServico={servico.nome}
          contexto={`${cidade.nome} · Alto Tietê`}
          descricao={servico.descricao}
          duracao={servico.duracao}
          preco={servico.preco_desde}
          midia={imagemFundo}
          textoAgendar={`Agendar ${servico.nome}`}
        />
        <Diferenciais className="pt-10" />

        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20 grid lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] gap-10">
          <div>
            {conteudo.paragrafos.map((p, i) => (
              <p key={i} className="mb-5 text-steel leading-relaxed text-lg max-w-2xl">
                {p}
              </p>
            ))}
          </div>
          <aside className="self-start rounded-2xl bg-card border border-card-line p-6">
            <h2 className="font-display font-bold text-xl text-steel mb-2">Bairros atendidos em {cidade.nome}</h2>
            <p className="text-sm text-steel-line leading-relaxed">{cidade.bairros.join(", ")}</p>
            <p className="mt-4 text-sm text-steel-line">
              O serviço é feito na nossa loja em Mogi das Cruzes, com hora marcada.
            </p>
          </aside>
        </section>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: servico.termo_popular || servico.nome,
              name: `${servico.nome} em ${cidade.nome}`,
              description: `${servico.nome} em ${cidade.nome} e região. ${servico.resumo}`,
              provider: {
                "@type": "AutoRepair",
                name: "Clean Car Estética Automotiva",
                url: `${SITE_URL}/`,
              },
              areaServed: cidade.nome,
              ...(servico.preco_desde
                ? { offers: { "@type": "Offer", price: servico.preco_desde, priceCurrency: "BRL" } }
                : {}),
            }),
          }}
        />
        <ServicosLista servicos={outros} titulo="Combina com outros cuidados" subtitulo="Aproveite a visita e cuide do carro por completo." />

        {cidades.length > 1 && (
          <section className="mx-auto max-w-6xl px-6 pb-20">
            <h2 className="font-display font-bold text-3xl text-steel mb-6">{servico.nome} em outras cidades</h2>
            <div className="flex flex-wrap gap-3">
              {cidades.filter((c) => c.slug !== cidade.slug).map((c) => (
                <Link
                  key={c.slug}
                  href={`/servicos/${servico.slug}/${c.slug}`}
                  className="rounded-full bg-card border border-card-line px-5 py-2 font-display font-bold text-steel-line hover:border-verniz hover:text-verniz-shine transition-colors"
                >
                  {c.nome}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      <WhatsappFloat servico={servico.nome} esconderNoCelular />
      <BarraAgendarCelular servico={servico.nome} preco={servico.preco_desde} />
    </>
  );
}
