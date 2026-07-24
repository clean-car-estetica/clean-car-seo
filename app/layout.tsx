import type { Metadata } from "next";
import "./globals.css";
import PageviewTracker from "@/components/PageviewTracker";

export const metadata: Metadata = {
  title: {
    default: "Clean Car Estética Automotiva",
    template: "%s | Clean Car Estética Automotiva",
  },
  description:
    "Lavagem, polimento, vitrificação e higienização automotiva em Mogi das Cruzes e região.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
              telephone: "+5511912630375",
              url: "https://clean-car-seo.vercel.app",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Mogi das Cruzes",
                addressRegion: "SP",
                addressCountry: "BR",
              },
              areaServed: [
                "Mogi das Cruzes",
                "Suzano",
                "Poá",
                "Ferraz de Vasconcelos",
                "Itaquaquecetuba",
              ],
              sameAs: ["https://www.instagram.com/cleancar_est26/"],
              priceRange: "R$",
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <PageviewTracker />
        {children}
      </body>
    </html>
  );
}
