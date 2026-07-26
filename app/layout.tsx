import type { Metadata } from "next";
import "./globals.css";
import PageviewTracker from "@/components/PageviewTracker";
import CupomPopup from "@/components/CupomPopup";
import { ContatoProvider } from "@/components/ContatoProvider";
import { PromoProvider } from "@/components/PromoProvider";
import { getContatoContent, getPromocoes } from "@/lib/site-content";

export const metadata: Metadata = {
  metadataBase: new URL("https://clean-car-seo.vercel.app"),
  title: {
    default: "Clean Car | Estética Automotiva em Mogi das Cruzes e Alto Tietê",
    template: "%s | Clean Car Estética Automotiva",
  },
  description:
    "Lavagem profissional, higienização, polimento, vitrificação e restauração. Produtos Vonixx, leva-e-trás e atendimento em toda região.",
  keywords: [
    "lava rapido Mogi das Cruzes", "lava-rápido Mogi das Cruzes", "lava car Mogi das Cruzes",
    "estetica automotiva Mogi das Cruzes", "estética automotiva Mogi das Cruzes",
    "limpeza de carro Mogi das Cruzes", "lavar carro Mogi das Cruzes", "lavagem de carro Mogi das Cruzes",
    "proteção de pintura Mogi das Cruzes", "descontaminação de pintura Mogi das Cruzes",
    "limpeza de carpete Mogi das Cruzes", "limpeza de sofá Mogi das Cruzes", "limpeza de estofado Mogi das Cruzes",
    "higienização Mogi das Cruzes", "higienização de banco Mogi das Cruzes", "higienização de estofado Mogi das Cruzes",
    "Alto Tietê", "Suzano", "Poá", "Ferraz de Vasconcelos", "Itaquaquecetuba", "Guararema",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Clean Car Estética Automotiva",
    title: "Clean Car | Estética Automotiva em Mogi das Cruzes e Alto Tietê",
    description: "Lavagem profissional, higienização, polimento, vitrificação e restauração. Produtos Vonixx, leva-e-trás e atendimento em toda região.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clean Car | Estética Automotiva em Mogi das Cruzes e Alto Tietê",
    description: "Lavagem profissional, higienização, polimento, vitrificação e restauração. Produtos Vonixx, leva-e-trás e atendimento em toda região.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [contato, promocoes] = await Promise.all([getContatoContent(), getPromocoes()]);

  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoRepair",
              name: "Clean Car Estética Automotiva",
              description:
                "Lavagem profissional, higienização, polimento, vitrificação e restauração automotiva em Mogi das Cruzes e Alto Tietê. Produtos Vonixx, leva-e-trás e atendimento em toda região.",
              image: "https://clean-car-seo.vercel.app/opengraph-image",
              telephone: "(11) 91263-0375",
              url: "https://clean-car-seo.vercel.app/",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Rua Prefeito Sebastião Cascardo, 438 - Jardim Universo",
                addressLocality: "Mogi das Cruzes",
                addressRegion: "SP",
                postalCode: "08740-450",
                addressCountry: "BR",
              },
              areaServed: [
                "Mogi das Cruzes",
                "Alto Tietê",
                "Suzano",
                "Poá",
                "Ferraz de Vasconcelos",
                "Itaquaquecetuba",
                "Guararema",
              ],
              sameAs: [contato.instagramUrl, contato.googleUrl],
              priceRange: "R$",
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  opens: "09:00",
                  closes: "18:00",
                },
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Saturday"],
                  opens: "09:00",
                  closes: "17:00",
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <ContatoProvider contato={contato}>
          <PromoProvider promocoes={promocoes}>
            <PageviewTracker />
            {children}
            <CupomPopup />
          </PromoProvider>
        </ContatoProvider>
      </body>
    </html>
  );
}
