import { SITE_URL } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avalie nosso Atendimento",
  description:
    "Deixe sua avaliação sobre o atendimento da Clean Car Estética Automotiva em Mogi das Cruzes.",
  alternates: { canonical: `${SITE_URL}/avaliar` },
  // Formulário de NPS para clientes: não é página de busca
  robots: { index: false, follow: true },
};

export default function AvaliarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
