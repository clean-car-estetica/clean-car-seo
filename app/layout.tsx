import type { Metadata } from "next";
import "./globals.css";
import PageviewTracker from "@/components/PageviewTracker";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CupomPopup from "@/components/CupomPopup";
import { ContatoProvider } from "@/components/ContatoProvider";
import { PromoProvider } from "@/components/PromoProvider";
import { TextosProvider } from "@/components/TextosProvider";
import { getContatoContent, getPromocoes, getTema, getMetadados, getTextosGerais } from "@/lib/site-content";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getMetadados();
  const palavrasChave = meta.palavrasChave.split(",").map((p) => p.trim()).filter(Boolean);
  return {
    metadataBase: new URL("https://clean-car-seo.vercel.app"),
    title: {
      default: meta.titulo,
      template: "%s | Clean Car Estética Automotiva",
    },
    description: meta.descricao,
    keywords: palavrasChave,
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: "Clean Car Estética Automotiva",
      title: meta.titulo,
      description: meta.descricao,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.titulo,
      description: meta.descricao,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [contato, promocoes, tema, meta, textos] = await Promise.all([getContatoContent(), getPromocoes(), getTema(), getMetadados(), getTextosGerais()]);

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
              description: meta.descricao,
              image: "https://clean-car-seo.vercel.app/opengraph-image",
              telephone: contato.whatsapp,
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
        <style>{`:root {
          --carbon: ${tema.carbon};
          --carbon-soft: ${tema.carbonSoft};
          --card: ${tema.card};
          --card-line: ${tema.cardLine};
          --verniz: ${tema.verniz};
          --verniz-shine: ${tema.vernizShine};
          --cera: ${tema.cera};
          --paper: ${tema.carbon};
        }`}</style>
      </head>
      <body className="min-h-full flex flex-col bg-paper text-ink">
        <GoogleAnalytics />
        <ContatoProvider contato={contato}>
          <PromoProvider promocoes={promocoes}>
            <TextosProvider textos={textos}>
              <PageviewTracker />
              {children}
              <CupomPopup />
            </TextosProvider>
          </PromoProvider>
        </ContatoProvider>
      </body>
    </html>
  );
}
