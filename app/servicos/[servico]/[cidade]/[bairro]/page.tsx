import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import { servicos, cidades } from "@/lib/data";
import { getServicoPublico, getCidadePublica } from "@/lib/site-data";
import { slugify } from "@/lib/slug";

export const revalidate = 3600;

// Só a cidade-sede (Mogi das Cruzes) tem bairros configurados — essas páginas
// existem só pra ela, com foco em "perto de mim" / busca de bairro.
export function generateStaticParams() {
  const sede = cidades.find((c) => c.sede);
  if (!sede) return [];
  return servicos.flatMap((s) =>
    sede.bairros.map((bairro) => ({ servico: s.slug, cidade: sede.slug, bairro: slugify(bairro) }))
  );
}

async function resolver(servicoSlug: string, cidadeSlug: string, bairroSlug: string) {
  const [servico, cidade] = await Promise.all([getServicoPublico(servicoSlug), getCidadePublica(cidadeSlug)]);
  if (!servico || !cidade || !cidade.sede) return null;
  const bairroNome = cidade.bairros.find((b) => slugify(b) === bairroSlug);
  if (!bairroNome) return null;
  return { servico, cidade, bairroNome };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ servico: string; cidade: string; bairro: string }>;
}): Promise<Metadata> {
  const { servico: servicoSlug, cidade: cidadeSlug, bairro: bairroSlug } = await params;
  const resolvido = await resolver(servicoSlug, cidadeSlug, bairroSlug);
  if (!resolvido) return {};
  const { servico, cidade, bairroNome } = resolvido;
  const tituloBase = servico.termo_popular || servico.nome;
  return {
    title: `${tituloBase} no ${bairroNome}, ${cidade.nome} | Clean Car`,
    description: `${tituloBase} perto de você no ${bairroNome} e região, em ${cidade.nome}. ${servico.resumo}`,
    alternates: {
      canonical: `https://clean-car-seo.vercel.app/servicos/${servico.slug}/${cidade.slug}/${bairroSlug}`,
    },
  };
}

export default async function ServicoBairroPage({
  params,
}: {
  params: Promise<{ servico: string; cidade: string; bairro: string }>;
}) {
  const { servico: servicoSlug, cidade: cidadeSlug, bairro: bairroSlug } = await params;
  const resolvido = await resolver(servicoSlug, cidadeSlug, bairroSlug);
  if (!resolvido) return notFound();
  const { servico, cidade, bairroNome } = resolvido;
  const tituloBase = servico.termo_popular || servico.nome;
  const outrosBairros = cidade.bairros.filter((b) => b !== bairroNome);

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section
          className="bg-carbon text-steel bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,10,13,0.65), rgba(10,10,13,0.97)), url('${servico.imagem_url}')`,
          }}
        >
          <div className="mx-auto max-w-4xl px-6 py-20">
            <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">
              {bairroNome} · {cidade.nome}
            </p>
            <h1 className="font-display font-extrabold text-4xl md:text-6xl leading-tight">
              {tituloBase} no {bairroNome}
            </h1>
            {servico.termo_popular && (
              <p className="mt-2 text-steel-line text-sm">Serviço: {servico.nome}</p>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          <p className="mb-5 text-steel-line leading-relaxed text-lg">
            Mora ou trabalha perto do {bairroNome}? A Clean Car fica em {cidade.nome}, bem perto de você —
            e é aqui que fazemos {servico.nome.toLowerCase()} com toda a técnica e os produtos Vonixx que
            você já conhece.
          </p>
          <p className="mb-5 text-steel-line leading-relaxed text-lg">{servico.descricao}</p>
          <p className="mb-5 text-steel-line leading-relaxed text-lg">
            Quem procura "{tituloBase.toLowerCase()} perto de mim" no {bairroNome} encontra a Clean Car
            como a opção mais próxima com esse padrão de qualidade — sempre com horário marcado, sem fila
            de espera.
          </p>

          {outrosBairros.length > 0 && (
            <div className="mt-10 rounded-2xl bg-card border border-card-line p-6">
              <h2 className="font-display font-bold text-lg mb-2 text-steel">
                Também atendemos perto do {bairroNome}
              </h2>
              <p className="text-sm text-steel-line">{outrosBairros.join(", ")}</p>
            </div>
          )}

          <AgendarButton className="inline-block mt-8 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
            Agendar perto do {bairroNome}
          </AgendarButton>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
