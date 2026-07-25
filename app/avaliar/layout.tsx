import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Avalie nosso Atendimento",
  description:
    "Deixe sua avaliação sobre o atendimento da Clean Car Estética Automotiva em Mogi das Cruzes.",
};

export default function AvaliarLayout({ children }: { children: React.ReactNode }) {
  return children;
}
