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
    default: "Clean Car Estética Automotiva",
    template: "%s | Clean Car Estética Automotiva",
  },
  description:
    "Lavagem, polimento, vitrificação e higienização automotiva em Mogi das Cruzes e região.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Clean Car Estética Automotiva",
    title: "Clean Car Estética Automotiva",
    description: "Lavagem, polimento, vitrificação e higienização automotiva em Mogi das Cruzes e região.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clean Car Estética Automotiva",
    description: "Lavagem, polimento, vitrificação e higienização automotiva em Mogi das Cruzes e região.",
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
              "@type": "AutoWash",
              name: "Clean Car Estética Automotiva",
              description:
                "Estética automotiva em Mogi das Cruzes com produtos Vonixx: lavagem, polimento técnico, vitrificação e cristalização de vidros com hidrofobia e proteção contra chuva ácida.",
              image: "https://clean-car-seo.vercel.app/opengraph-image",
              telephone: `+${contato.whatsapp}`,
              url: "https://clean-car-seo.vercel.app",
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
                "Suzano",
                "Poá",
                "Ferraz de Vasconcelos",
                "Itaquaquecetuba",
              ],
              sameAs: [contato.instagramUrl, contato.googleUrl],
              priceRange: "R$",
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
