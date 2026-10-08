import { SITE_URL } from "@/lib/config";
import ObservacoesServicos from "@/components/ObservacoesServicos";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BeforeAfter from "@/components/BeforeAfter";
import WhatsappFloat from "@/components/WhatsappFloat";
import WhatsappCTA from "@/components/WhatsappCTA";
import AgendarButton from "@/components/AgendarButton";
import { getHeroContent } from "@/lib/site-content";
import ProcessoEtapas from "@/components/ProcessoEtapas";
import HeroMidia from "@/components/HeroMidia";
import EscolhaLavagem from "@/components/EscolhaLavagem";
import ServicosLista from "@/components/ServicosLista";
import FaixaServicos from "@/components/FaixaServicos";
import Diferenciais from "@/components/Diferenciais";
import Produtos from "@/components/Produtos";
import Indicacao from "@/components/Indicacao";
import Planos from "@/components/Planos";
import Depoimentos from "@/components/Depoimentos";
import Faq from "@/components/Faq";
import { getServicosPublicos, getTransformacoesPublicas, getCidadesPublicas, getDepoimentosPublicos, getPlanosPublicos, getProcessoPassos, getProdutosLista, getFaqsPublicos } from "@/lib/site-data";
import { getTextosGerais } from "@/lib/site-content";

export const revalidate = 60;

export const metadata = {
  alternates: { canonical: `${SITE_URL}/` },
};

export default async function Home() {
  const [hero, servicos, transformacoes, cidades, depoimentos, planos, passos, produtos, textos, faqs] = await Promise.all([
    getHeroContent(),
    getServicosPublicos(),
    getTransformacoesPublicas(),
    getCidadesPublicas(),
    getDepoimentosPublicos(),
    getPlanosPublicos(),
    getProcessoPassos(),
    getProdutosLista(),
    getTextosGerais(),
    getFaqsPublicos(),
  ]);
  const lavagens = ["lavagem-bronze", "lavagem-prata", "lavagem-ouro"];
  const outros = servicos.filter((x) => !lavagens.includes(x.slug));

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        {/* Topo: vídeo (ou foto) escolhido no painel, texto à esquerda */}
        <section className="relative isolate min-h-[calc(100svh-5rem)] flex items-end md:items-center text-steel overflow-hidden">
          <HeroMidia
            tipo={hero.tipo_midia}
            videoUrl={hero.video_url}
            videoCelularUrl={hero.video_mobile_url}
            imagemUrl={hero.imagem_url}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t md:bg-gradient-to-r from-carbon via-carbon/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-32 -z-10 bg-gradient-to-t from-carbon to-transparent" />
          <div className="mx-auto w-full max-w-6xl px-6 pb-14 pt-32 md:py-24">
            <span className="inline-flex items-center gap-2 rounded-full bg-carbon/60 backdrop-blur border border-cera/30 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-cera" />
              <span className="text-xs font-display font-bold tracking-wide text-cera">{hero.badge_texto}</span>
            </span>
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-8xl leading-[0.9] max-w-3xl mt-6 text-balance">
              {hero.titulo_parte1} <span className="text-verniz-shine glow-text">{hero.titulo_destaque}</span>
            </h1>
            <p className="mt-6 max-w-xl text-steel text-lg leading-relaxed">{hero.subtitulo}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <AgendarButton className="inline-block rounded-full bg-verniz text-carbon font-display font-bold text-lg px-8 py-3 hover:bg-verniz-shine transition-colors">
                Agendar horário
              </AgendarButton>
              <WhatsappCTA />
            </div>
          </div>
        </section>

        <FaixaServicos nomes={servicos.map((x) => x.nome)} />
        <Diferenciais className="pt-14" />

        <EscolhaLavagem servicos={servicos} />


        {/* Antes e depois */}
        {transformacoes.length > 0 && (
          <section className="bg-carbon py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="text-center mb-12">
                <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
                  Arraste e veja a <span className="text-verniz-shine">transformação</span>
                </h2>
                <p className="mt-2 text-steel-line max-w-xl mx-auto">
                  Resultados reais dos nossos serviços de estética automotiva.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {transformacoes.map((t) => (
                  <BeforeAfter
                    key={t.id}
                    title={t.titulo}
                    description={t.descricao}
                    before={t.imagem_antes}
                    after={t.imagem_depois}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <ProcessoEtapas passos={passos} />

        <ServicosLista servicos={outros} titulo={textos.homeServicosTitulo} subtitulo={textos.homeServicosSubtitulo} />
        <div className="mx-auto max-w-6xl px-6 -mt-12 mb-16">
          <ObservacoesServicos className="max-w-3xl" />
        </div>

        <Produtos produtos={produtos} />

        <Planos itens={planos} />

        {/* Cidades */}
        <section className="bg-carbon-soft py-20 border-y border-card-line">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-2 text-steel">
              {textos.homeCidadesTitulo}
            </h2>
            <p className="text-steel-line mb-10 max-w-xl">
              {textos.homeCidadesSubtitulo}
            </p>
            <div className="flex flex-wrap gap-3">
              {cidades.map((c) => (
                <Link
                  key={c.slug}
                  href={`/servicos/lavagem-bronze/${c.slug}`}
                  className="rounded-full bg-card border border-card-line px-5 py-2 font-display font-bold text-sm text-steel-line hover:border-verniz hover:text-verniz-shine transition-colors"
                >
                  {c.nome}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Depoimentos itens={depoimentos} />
        <Indicacao />

        {/* Prévia do FAQ — 3 primeiras perguntas, lista completa em /faq */}
        {faqs.length > 0 && (
          <Faq
            itens={faqs.slice(0, 3)}
            rodape={
              <Link
                href="/faq"
                className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 hover:bg-verniz-shine transition-colors"
              >
                Ver todas as perguntas
              </Link>
            }
          />
        )}
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
