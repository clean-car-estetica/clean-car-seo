import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import QuizCuidado from "@/components/QuizCuidado";
import { SITE_URL } from "@/lib/config";
import { getServicosPublicos } from "@/lib/site-data";
import { getGuiasPublicadas, caminhoGuia } from "@/lib/guias";

export const revalidate = 300;

// Situação comum → serviços (slugs do catálogo do SAS). Serviço pausado ou
// fora do catálogo some sozinho do texto.
const SITUACOES: { titulo: string; texto: string; servicos: string[] }[] = [
  {
    titulo: "O carro só está sujo por fora",
    texto: "Poeira, barro e marcas de chuva na lataria e nas rodas, mas o interior está em ordem. Uma lavagem bem feita resolve e devolve o brilho sem riscar a pintura.",
    servicos: ["lavagem-bronze", "lavagem-prata", "lavagem-ouro"],
  },
  {
    titulo: "Bancos manchados, cheiro ruim ou muita gente usando o carro",
    texto: "Café, refrigerante, suor, pelo de pet ou criança no banco de trás deixam manchas e cheiro que a lavagem comum não tira. Aqui o caminho é a higienização interna, que limpa a fundo bancos, teto e carpete; para o cheiro que vem do ar-condicionado, o tratamento com ozônio higieniza os dutos.",
    servicos: ["higienizacao", "higienizacao-banco-dianteiro", "higienizacao-banco-traseiro", "tratamento-anti-odor"],
  },
  {
    titulo: "Farol amarelado ou opaco",
    texto: "Com o sol, o farol fica amarelo, ilumina menos à noite e deixa o carro com cara de velho. A restauração devolve a transparência e melhora a visibilidade.",
    servicos: ["restauracao-de-farol"],
  },
  {
    titulo: "Plásticos esbranquiçados e banco de couro ressecado",
    texto: "Sol forte resseca plásticos de painel, para-choque e caixa de roda, e o couro começa a rachar. Revitalizar e hidratar recupera a cor e protege antes que o dano fique permanente.",
    servicos: ["revitalizacao-plastico", "revitalizacao-plastico-externo", "hidratacao-de-couro"],
  },
  {
    titulo: "Dificuldade de enxergar na chuva",
    texto: "Quando a água fica espalhada no para-brisa e o limpador não dá conta, a cristalização faz a água escorrer e melhora a visão em dia de chuva.",
    servicos: ["cristalizacao-de-vidros"],
  },
  {
    titulo: "Rodas escuras de pó de freio e motor sujo",
    texto: "Pó de freio gruda nas rodas e não sai com lavagem comum. Já com o motor limpo fica mais fácil perceber um vazamento novo. São limpezas específicas, feitas com o cuidado certo para cada parte (o motor é limpo a seco, sem água sob pressão).",
    servicos: ["lavagem-pesada-de-rodas", "lavagem-motor"],
  },
  {
    titulo: "Pintura sem brilho ou carro para vender",
    texto: "Para quem vai vender o carro ou quer a pintura com aquele brilho de novo, o enceramento técnico protege e realça a cor por mais tempo.",
    servicos: ["enceramento-tecnico"],
  },
  {
    titulo: "Sofá ou estofado de casa manchado",
    texto: "Também higienizamos sofás e estofados, tirando manchas, ácaros e cheiro de pet.",
    servicos: ["higienizacao-de-estofados"],
  },
];

export const metadata: Metadata = {
  title: { absolute: "Qual cuidado o seu carro precisa? Teste rápido | Clean Car Mogi das Cruzes" },
  description:
    "Marque o que incomoda no seu carro (sujeira, banco manchado, cheiro, plástico esbranquiçado, vai vender...) e veja a combinação de serviços certa, com preço de referência. Clean Car Estética Automotiva, Mogi das Cruzes.",
  alternates: { canonical: `${SITE_URL}/qual-cuidado` },
};

export default async function QualCuidadoPage() {
  const [servicos, guias] = await Promise.all([getServicosPublicos(), getGuiasPublicadas()]);
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-3xl px-6 py-14 md:py-20 grid gap-8">
          <div className="grid gap-3">
            <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm">Teste rápido · 30 segundos</p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl text-steel text-balance leading-[0.95]">Qual cuidado o seu carro precisa?</h1>
            <p className="text-lg text-steel-line">
              Marque tudo o que você quer resolver — pode ser mais de uma coisa — e veja a combinação de serviços indicada, com preço
              de referência. Sem cadastro: o resultado aparece na hora e você manda para a gente pelo WhatsApp se quiser.
            </p>
          </div>
          <QuizCuidado
            servicos={servicos.map((s) => ({ slug: s.slug, nome: s.nome, preco: s.preco_desde, duracao: s.duracao }))}
            guiasPublicadas={guias.map((g) => caminhoGuia(g))}
          />
          <p className="text-sm text-steel-line">
            Prefere ver todos os valores? Veja a <Link href="/precos" className="text-verniz-shine underline underline-offset-2">tabela de preços</Link>.
          </p>
        </section>

        {/* 22/10/2026: o Google rastreou esta página e não indexou ("rastreada,
            atualmente não indexada") — ela era quase só o teste, ~150 palavras.
            Este guia em texto dá conteúdo próprio à página e liga cada situação
            ao serviço certo. Só aparecem links de serviços que existem no SAS. */}
        <section className="mx-auto max-w-3xl px-6 pb-16 grid gap-6 text-steel-line leading-relaxed">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-steel">Como escolher o cuidado certo para o seu carro</h2>
          <p>
            Nem todo carro precisa do serviço mais completo. O que decide é como o carro está hoje e como ele é usado no dia a dia.
            Abaixo estão as situações que mais aparecem aqui na loja em Mogi das Cruzes e o cuidado que costuma resolver cada uma.
            Na dúvida, mande uma foto pelo WhatsApp: a gente olha e indica sem compromisso.
          </p>
          {SITUACOES.map((sit) => {
            const links = sit.servicos.map((slug) => servicos.find((x) => x.slug === slug)).filter(Boolean) as typeof servicos;
            if (!links.length) return null;
            return (
              <div key={sit.titulo} className="grid gap-2">
                <h3 className="font-display font-semibold text-xl text-steel">{sit.titulo}</h3>
                <p>{sit.texto}</p>
                <p className="text-sm">
                  Serviço indicado:{" "}
                  {links.map((sv, i) => (
                    <span key={sv.slug}>
                      {i > 0 && (i === links.length - 1 ? " ou " : ", ")}
                      <Link href={`/servicos/${sv.slug}`} className="text-verniz-shine underline underline-offset-2">{sv.nome}</Link>
                    </span>
                  ))}
                  .
                </p>
              </div>
            );
          })}
          <h2 className="font-display font-bold text-2xl md:text-3xl text-steel mt-4">Lavagem ou estética automotiva?</h2>
          <p>
            Lavagem tira a sujeira. Estética automotiva vai além: cuida da pintura, do plástico, do couro, dos vidros e do interior para
            o carro durar bonito por mais tempo. Por isso o tempo de serviço é maior e o atendimento é com hora marcada, sem fila.
            Atendemos na nossa loja no Jardim Universo, em Mogi das Cruzes, e recebemos clientes de todo o Alto Tietê.
          </p>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Qual cuidado o seu carro precisa?",
              url: `${SITE_URL}/qual-cuidado`,
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              inLanguage: "pt-BR",
              offers: { "@type": "Offer", price: 0, priceCurrency: "BRL" },
              provider: { "@id": `${SITE_URL}/#empresa` },
              description: "Teste gratuito: marque o que incomoda no carro e veja a combinação de serviços de estética automotiva indicada, com preço de referência da Clean Car em Mogi das Cruzes.",
            }),
          }}
        />
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
