import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import BeforeAfter from "@/components/BeforeAfter";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import { getHeroContent } from "@/lib/site-content";
import Processo from "@/components/Processo";
import Produtos from "@/components/Produtos";
import Indicacao from "@/components/Indicacao";
import Planos from "@/components/Planos";
import Depoimentos from "@/components/Depoimentos";
import { getServicosPublicos, getTransformacoesPublicas, getCidadesPublicas, getDepoimentosPublicos, getPlanosPublicos, getProcessoPassos, getProdutosLista } from "@/lib/site-data";

export const revalidate = 60;

export default async function Home() {
  const [hero, servicos, transformacoes, cidades, depoimentos, planos, passos, produtos] = await Promise.all([
    getHeroContent(),
    getServicosPublicos(),
    getTransformacoesPublicas(),
    getCidadesPublicas(),
    getDepoimentosPublicos(),
    getPlanosPublicos(),
    getProcessoPassos(),
    getProdutosLista(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section
          className="shine-sweep bg-carbon text-steel bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,10,13,0.55), rgba(10,10,13,0.95)), url('${hero.imagem_url}')`,
          }}
        >
          <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
            <span className="inline-flex items-center gap-2 rounded-full bg-cera/10 border border-cera/30 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-cera" />
              <span className="text-xs font-display font-bold tracking-wide text-cera uppercase">
                {hero.badge_texto}
              </span>
            </span>
            <h1 className="font-display font-extrabold text-5xl md:text-7xl leading-[0.95] max-w-3xl mt-6">
              {hero.titulo_parte1} <span className="text-verniz-shine glow-text">{hero.titulo_destaque}</span>
            </h1>
            <p className="mt-6 max-w-xl text-steel-line text-lg leading-relaxed">{hero.subtitulo}</p>
            <AgendarButton className="inline-block mt-8 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
              Agendar horário
            </AgendarButton>
          </div>
        </section>

        <Processo passos={passos} />
        <Produtos produtos={produtos} />

        {/* Antes e depois */}
        {transformacoes.length > 0 && (
          <section className="bg-carbon py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="text-center mb-12">
                <h2 className="font-display font-bold text-3xl md:text-4xl text-steel">
                  Arraste e veja a <span className="text-verniz-shine">transformação</span>
                </h2>
                <p className="mt-2 text-steel-line max-w-xl mx-auto">
                  Resultados reais dos nossos serviços de polimento e vitrificação.
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

        {/* Serviços */}
        <section id="servicos" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-2 text-steel">Catálogo de serviços</h2>
          <p className="text-steel-line mb-10">Química Vonixx, do dia a dia à proteção de longa duração.</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {servicos.map((s) => (
              <ServiceCard
                key={s.slug}
                slug={s.slug}
                nome={s.nome}
                resumo={s.resumo}
                precoDesde={s.preco_desde ?? undefined}
                image={s.imagem_url}
                tag={s.tag ?? undefined}
              />
            ))}
          </div>
        </section>

        <Planos itens={planos} />

        {/* Cidades */}
        <section className="bg-carbon-soft py-20 border-y border-card-line">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display font-bold text-3xl md:text-4xl mb-2 text-steel">
              Nosso estúdio fica em Mogi das Cruzes
            </h2>
            <p className="text-steel-line mb-10 max-w-xl">
              Recebemos também clientes de toda a região do Alto Tietê, sempre com hora marcada.
            </p>
            <div className="flex flex-wrap gap-3">
              {cidades.map((c) => (
                <Link
                  key={c.slug}
                  href={`/servicos/vitrificacao/${c.slug}`}
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

        {/* Prévia do FAQ — lista completa está em /faq */}
        <section id="faq" className="bg-carbon-soft border-y border-card-line py-16 text-center">
          <div className="mx-auto max-w-2xl px-6">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-steel mb-3">
              Dúvidas <span className="text-verniz-shine">frequentes</span>
            </h2>
            <p className="text-steel-line mb-6">
              Vitrificação, polimento, hidrofobia, prazos — tiramos as principais dúvidas.
            </p>
            <Link
              href="/faq"
              className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 hover:bg-verniz-shine transition-colors"
            >
              Ver todas as perguntas
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
