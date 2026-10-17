"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useContato } from "@/components/ContatoProvider";

// Pixel da Meta (Facebook/Instagram), 15/10/2026. Só carrega quando o ID foi
// preenchido no console (Contato e endereço) e nunca no /admin. Serve para
// anunciar depois só para quem já visitou o site e medir quem abriu o WhatsApp.
// Aparelho marcado como "interno" (o dono/equipe): o pixel nem é baixado. Antes ele era
// baixado e o fbq trocado por uma função vazia, o que fazia o fbevents.js dar erro no console.
export default function MetaPixel() {
  const pathname = usePathname();
  const { metaPixelId } = useContato();
  const id = (metaPixelId || "").replace(/\D/g, "");
  if (!id || pathname.startsWith("/admin")) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`(function(){var interno=false;try{interno=localStorage.getItem('cleancar_interno')==='1';}catch(e){}
if(interno){window.fbq=window.fbq||function(){};return;}
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${id}');fbq('track','PageView');})();`}
    </Script>
  );
}
