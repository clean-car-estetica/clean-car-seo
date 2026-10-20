"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { GA_MEDICAO } from "@/lib/gtag";

export default function GoogleAnalytics() {
  const pathname = usePathname();

  // Não carrega o GA4 nas páginas do console — evita contar visitas e
  // cliques do painel administrativo como se fossem acesso de cliente.
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEDICAO}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEDICAO}');
        `}
      </Script>
    </>
  );
}
