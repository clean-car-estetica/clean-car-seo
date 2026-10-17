import { SITE_URL, filtrarLevaETraz, type Contato } from "@/lib/config";
import type { ContatoSincronizado } from "@/lib/gbr-sync";
import type { Metadata } from "next";
import "./globals.css";
import PageviewTracker from "@/components/PageviewTracker";
import ModoEdicao from "@/components/ModoEdicao";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import MetaPixel from "@/components/MetaPixel";
import CupomPopup from "@/components/CupomPopup";
import CampanhaPopup from "@/components/CampanhaPopup";
import { ContatoProvider } from "@/components/ContatoProvider";
import { PromoProvider } from "@/components/PromoProvider";
import { TextosProvider } from "@/components/TextosProvider";
import { getContatoContent, getPromocoes, getTema, getMetadados, getTextosGerais } from "@/lib/site-content";
import { getCampanha } from "@/lib/campanhas-servidor";

export async function generateMetadata(): Promise<Metadata> {
  const [metaBruto, contato] = await Promise.all([getMetadados(), getContatoContent()]);
  const meta = { ...metaBruto, descricao: filtrarLevaETraz(metaBruto.descricao, contato.levaETraz) };
  const palavrasChave = meta.palavrasChave.split(",").map((p) => p.trim()).filter(Boolean);
  return {
    metadataBase: new URL(SITE_URL),
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

// 17/10/2026: com o GBR SAS ligado, o horário do Google (dados estruturados)
// sai do sistema, inclusive feriados e horários especiais.
const DIAS_SCHEMA: Record<string, string> = { seg: "Monday", ter: "Tuesday", qua: "Wednesday", qui: "Thursday", sex: "Friday", sab: "Saturday", dom: "Sunday" };
function horarioJsonLd(contato: ContatoSincronizado<Contato>) {
  const f = contato.horarioSas;
  if (!f?.configurado) {
    return {
      openingHoursSpecification: [
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
        { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "17:00" },
      ],
    };
  }
  const grupos = new Map<string, string[]>();
  for (const d of f.semana) if (d.aberto && d.inicio && d.fim) grupos.set(`${d.inicio}|${d.fim}`, [...(grupos.get(`${d.inicio}|${d.fim}`) || []), DIAS_SCHEMA[d.dia]]);
  const especiais = f.excecoes.filter((e) => e.tipo !== "pausa").map((e) => ({
    "@type": "OpeningHoursSpecification",
    validFrom: e.data,
    validThrough: e.dataFim || e.data,
    // Fechado o dia todo: opens = closes = 00:00 (padrão do schema.org/Google)
    opens: e.tipo === "fechado" ? "00:00" : e.inicio,
    closes: e.tipo === "fechado" ? "00:00" : e.fim,
  }));
  return {
    openingHoursSpecification: [...grupos].map(([k, dias]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: dias, opens: k.split("|")[0], closes: k.split("|")[1] })),
    ...(especiais.length ? { specialOpeningHoursSpecification: especiais } : {}),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [contato, promocoes, tema, meta, textos, campanha] = await Promise.all([getContatoContent(), getPromocoes(), getTema(), getMetadados(), getTextosGerais(), getCampanha()]);

  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <head>
        {/* Antes de tudo: marca o modo de edição (prévia do editor visual), o modo
            "embutido" do painel lateral e desliga o Google Analytics no navegador
            do dono, para as visitas dele não entrarem nas métricas. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var q=location.search,d=document.documentElement,f=window.top!==window.self;if(f&&/[?&]embed=1/.test(q))window.name='cc-embed';if(f&&/[?&]editar=1/.test(q))window.name='cc-previa';if(f&&window.name==='cc-embed')d.classList.add('cc-embed');if(f&&window.name==='cc-previa')d.classList.add('cc-editar');if(localStorage.getItem('cleancar_interno')==='1'||d.classList.contains('cc-editar'))window['ga-disable-G-54H7DP2E49']=true;}catch(e){}})();`,
          }}
        />
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
              "@type": ["AutoWash", "AutoRepair"],
              "@id": `${SITE_URL}/#empresa`,
              name: "Clean Car Estética Automotiva",
              description: filtrarLevaETraz(meta.descricao, contato.levaETraz),
              image: `${SITE_URL}/opengraph-image`,
              logo: `${SITE_URL}/logo-clean-car.png`,
              telephone: `+${contato.whatsapp}`,
              url: `${SITE_URL}/`,
              hasMap: contato.googleUrl,
              geo: { "@type": "GeoCoordinates", latitude: -23.5457743, longitude: -46.2131629 },
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
              priceRange: "R$ 45 – R$ 420",
              ...horarioJsonLd(contato),
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
          <MetaPixel />
          <PromoProvider promocoes={promocoes}>
            <TextosProvider textos={textos}>
              <PageviewTracker />
              <ModoEdicao />
              {children}
              {campanha.ativo ? <CampanhaPopup campanha={campanha} /> : <CupomPopup />}
            </TextosProvider>
          </PromoProvider>
        </ContatoProvider>
      </body>
    </html>
  );
}
