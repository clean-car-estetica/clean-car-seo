import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peça seu Orçamento",
  description:
    "Solicite um orçamento gratuito de lavagem, polimento ou vitrificação para o seu carro em Mogi das Cruzes e região. Resposta rápida pelo WhatsApp.",
};

export default function OrcamentoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
