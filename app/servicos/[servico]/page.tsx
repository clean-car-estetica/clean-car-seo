import Bloco from "@/components/Bloco";
import { SITE_URL } from "@/lib/config";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import { servicos, SERVICOS_SEM_PAGINAS_LOCAIS } from "@/lib/data";
import { getServicoPublico, getCidadesPublicas, getServicosPublicos, getProcessoPassos, getTransformacoesPublicas, getFaqsPublicos } from "@/lib/site-data";
import ServicoTopo from "@/components/ServicoTopo";
import Diferenciais from "@/components/Diferenciais";
import BarraAgendarCelular from "@/components/BarraAgendarCelular";
import ProcessoEtapas from "@/components/ProcessoEtapas";
import ServicosLista from "@/components/ServicosLista";
import BeforeAfter from "@/components/BeforeAfter";
import Faq from "@/components/Faq";

export const revalidate = 60;

export function generateStaticParams() {
  return servicos.map((s) => ({ servico: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ servico: string }>;
}): Promise<Metadata> {
  const { servico: servicoSlug } = await params;
  const servico = await getServicoPublico(servicoSlug);
  if (!servico) return {};
  const tituloBase = servico.termo_popular || servico.nome;
  // 08/10/2026: preço e cidade no título/descrição — é o que faz a pessoa
  // clicar no resultado do Google (o "| Clean Car..." entra pelo template).
  const preco = servico.preco_desde ? ` a partir de R$ ${servico.preco_desde}` : "";
  // Título curto o bastante para o Google não cortar o preço.
  const titulo = `${tituloBase} em Mogi das Cruzes${servico.preco_desde ? ` · R$ ${servico.preco_desde}` : ""} | Clean Car`;
  const descricao = `${servico.nome} na Clean Car, em Mogi das Cruzes: ${servico.resumo}${preco ? ` A partir de R$ ${servico.preco_desde}` : ""}${servico.duracao ? ` (${servico.duracao})` : ""}. Produtos Vonixx e hora marcada. Agende pelo WhatsApp.`;
  return {
    title: { absolute: titulo },
    description: descricao,
    openGraph: { title: titulo, description: descricao, images: servico.imagem_url && !/\.(mp4|webm|mov)/i.test(servico.imagem_url) ? [servico.imagem_url] : undefined },
    alternates: { canonical: `${SITE_URL}/servicos/${servico.slug}` },
  };
}

export default async function ServicoPage({
  params,
}: {
  params: Promise<{ servico: string }>;
}) {
  const { servico: servicoSlug } = await params;
  const semPaginasLocais = SERVICOS_SEM_PAGINAS_LOCAIS.includes(servicoSlug);
  const [servico, cidades, todos, passos, transformacoes, faqs] = await Promise.all([
    getServicoPublico(servicoSlug),
    semPaginasLocais ? Promise.resolve([]) : getCidadesPublicas(),
    getServicosPublicos(),
    getProcessoPassos(),
    getTransformacoesPublicas(),
    getFaqsPublicos(),
  ]);
  if (!servico) return notFound();
  const outros = todos.filter((x) => x.slug !== servico.slug).slice(0, 6);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <Bloco id="servico" ancora={servico.slug}>
        <ServicoTopo
          titulo={servico.termo_popular || servico.nome}
          nomeServico={servico.nome}
          contexto={servico.tag ? `${servico.tag} · Mogi das Cruzes` : "Mogi das Cruzes e Alto Tietê"}
          descricao={servico.descricao}
          duracao={servico.duracao}
          preco={servico.preco_desde}
          midia={servico.imagem_url}
        />
        </Bloco>
        <Diferenciais className="py-10" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Início", item: `${SITE_URL}/` },
                { "@type": "ListItem", position: 2, name: "Serviços", item: `${SITE_URL}/#servicos` },
                { "@type": "ListItem", position: 3, name: servico.nome, item: `${SITE_URL}/servicos/${servico.slug}` },
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Service",
              serviceType: servico.termo_popular || servico.nome,
              name: servico.nome,
              description: servico.descricao,
              provider: { "@id": `${SITE_URL}/#empresa` },
              areaServed: "Mogi das Cruzes e região",
              ...(servico.preco_desde
                ? { offers: { "@type": "Offer", price: servico.preco_desde, priceCurrency: "BRL" } }
                : {}),
            }),
          }}
        />

        <Bloco id="processo"><ProcessoEtapas passos={passos} /></Bloco>

        {transformacoes.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-steel leading-none">Arraste e veja a diferença</h2>
            <p className="mt-3 text-steel-line max-w-xl mb-10">Resultados reais de carros que passaram pela Clean Car.</p>
            <div className="grid md:grid-cols-2 gap-6">
              {transformacoes.slice(0, 2).map((t) => (
                <BeforeAfter key={t.id} title={t.titulo} description={t.descricao} before={t.imagem_antes} after={t.imagem_depois} />
              ))}
            </div>
          </section>
        )}

        <ServicosLista servicos={outros} titulo="Combina com outros cuidados" subtitulo="Aproveite a visita e cuide do carro por completo." />

        {!semPaginasLocais && cidades.length > 0 && (
          <section className="mx-auto max-w-6xl px-6 pb-20">
            <h2 className="font-display font-bold text-3xl text-steel mb-2">{servico.nome} perto de você</h2>
            <p className="text-steel-line mb-6">A loja fica em Mogi das Cruzes e recebe clientes de toda a região.</p>
            <div className="flex flex-wrap gap-3">
              {cidades.map((c) => (
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

        {faqs.length > 0 && <Bloco id="faq"><Faq itens={faqs.slice(0, 4)} /></Bloco>}
      </main>
      <Footer />
      <WhatsappFloat servico={servico.nome} esconderNoCelular />
      <BarraAgendarCelular servico={servico.nome} preco={servico.preco_desde} />
    </>
  );
}
