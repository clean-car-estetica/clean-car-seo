import { gerarArte, TAMANHO_ARTE } from "@/lib/og-arte";

export const alt = "Clean Car Estética Automotiva em Mogi das Cruzes: seu carro limpo de verdade, com hora marcada. Agende pelo WhatsApp.";
export const size = TAMANHO_ARTE;
export const contentType = "image/jpeg";

export default async function Image() {
  return gerarArte({
    marca: true,
    chamada: "Estética automotiva · Mogi das Cruzes",
    titulo: "Clean Car",
    subtitulo: "Seu carro limpo de verdade,",
    destaque: "com hora marcada.",
    selos: ["Leva e traz", "Avaliação grátis", "Garantia 48 h"],
  });
}
