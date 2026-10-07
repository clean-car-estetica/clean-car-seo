import { SITE_URL } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Peça seu Orçamento",
  description:
    "Solicite um orçamento gratuito de lavagem ou higienização para o seu carro em Mogi das Cruzes e região. Resposta rápida pelo WhatsApp.",
  alternates: { canonical: `${SITE_URL}/orcamento` },
};

export default function OrcamentoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
