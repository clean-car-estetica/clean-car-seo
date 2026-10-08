import { gerarArte, nomeCurto, TAMANHO_ARTE } from "@/lib/og-arte";
import { getServicoPublico } from "@/lib/site-data";
import { fotoServico } from "@/lib/fotos";
import { servicos } from "@/lib/data";

export const alt = "Serviço da Clean Car Estética Automotiva em Mogi das Cruzes";
export const size = TAMANHO_ARTE;
export const contentType = "image/jpeg";
export const revalidate = 3600;

export function generateStaticParams() {
  return servicos.map((s) => ({ servico: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ servico: string }> }) {
  const { servico: slug } = await params;
  const s = await getServicoPublico(slug).catch(() => null);
  const nome = s?.nome ?? servicos.find((x) => x.slug === slug)?.nome ?? "Estética automotiva";
  const foto = fotoServico(slug, s?.imagem_url);
  return gerarArte({
    chamada: "Clean Car · Mogi das Cruzes",
    titulo: nomeCurto(nome),
    subtitulo: s?.preco_desde ? "Com hora marcada," : "Com hora marcada",
    destaque: s?.preco_desde ? `a partir de R$ ${s.preco_desde}` : "e avaliação grátis",
    selos: ["Produtos Vonixx", "Leva e traz", "Garantia 48 h"],
    foto: foto && !/\.(mp4|webm|mov)/i.test(foto) ? foto : null,
  });
}
