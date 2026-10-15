import { gerarArte, TAMANHO_ARTE } from "@/lib/og-arte";
import { getContatoContent } from "@/lib/site-content";

export const alt = "Clean Car Estética Automotiva em Mogi das Cruzes: seu carro limpo de verdade, com hora marcada. Agende pelo WhatsApp.";
export const size = TAMANHO_ARTE;
export const contentType = "image/jpeg";

export const revalidate = 3600;

export default async function Image() {
  const contato = await getContatoContent().catch(() => null);
  return gerarArte({
    marca: true,
    chamada: "Estética automotiva · Mogi das Cruzes",
    titulo: "Clean Car",
    subtitulo: "Seu carro limpo de verdade,",
    destaque: "com hora marcada.",
    selos: [contato?.levaETraz ? "Leva e traz" : "Hora marcada", "Avaliação grátis", "Garantia 48 h"],
  });
}
