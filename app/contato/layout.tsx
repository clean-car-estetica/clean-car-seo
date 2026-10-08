import { SITE_URL } from "@/lib/config";

export const metadata = {
  title: "Contato, endereço e horário — Jardim Universo, Mogi das Cruzes",
  description: "Clean Car Estética Automotiva: Rua Prefeito Sebastião Cascardo, 438, Jardim Universo, Mogi das Cruzes. Segunda a sexta 9h às 18h, sábado 9h às 17h. Fale no WhatsApp.",
  alternates: { canonical: `${SITE_URL}/contato` },
};

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
