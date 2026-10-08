import { SITE_URL } from "@/lib/config";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import { supabasePublico } from "@/lib/supabase";
import Midia from "@/components/Midia";

export const revalidate = 300;

async function getPagina(slug: string) {
  const { data } = await supabasePublico
    .from("paginas_customizadas")
    .select("*")
    .eq("slug", slug)
    .eq("publicado", true)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pagina = await getPagina(slug);
  if (!pagina) return {};
  return {
    title: pagina.titulo,
    description: pagina.meta_descricao || undefined,
    alternates: { canonical: `${SITE_URL}/paginas/${slug}` },
  };
}

export default async function PaginaCustomizada({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pagina = await getPagina(slug);
  if (!pagina) return notFound();

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        {pagina.imagem_url && (
          <div className="relative h-64 overflow-hidden">
            <Midia src={pagina.imagem_url} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-carbon/30 to-carbon/90" />
          </div>
        )}
        <section className="mx-auto max-w-2xl px-6 py-16">
          <h1 className="font-display font-extrabold text-3xl md:text-5xl text-steel mb-6">{pagina.titulo}</h1>
          <div className="text-steel-line leading-relaxed whitespace-pre-line">{pagina.conteudo}</div>
          <AgendarButton className="inline-block mt-10 rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 tracking-wide hover:bg-verniz-shine transition-colors">
            Agendar horário
          </AgendarButton>
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
