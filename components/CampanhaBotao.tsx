"use client";

import { usePathname } from "next/navigation";
import { gtagEvent } from "@/lib/gtag";
import { parseRota, obterOrigem, registrarEvento } from "@/lib/track";

// Botão da campanha: conta o clique (console e GA4) e abre o link.
export default function CampanhaBotao({ href, className, children, aoClicar }: { href: string; className?: string; children: React.ReactNode; aoClicar?: () => void }) {
  const pathname = usePathname();
  const externo = href.startsWith("http");
  return (
    <a
      href={href}
      target={externo ? "_blank" : undefined}
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        const { service_slug, city_slug } = parseRota(pathname);
        registrarEvento(href.includes("wa.me") ? "click_whatsapp" : "click_agendar", pathname, { service_slug, city_slug, origem: obterOrigem(), detalhe: "campanha" });
        gtagEvent("click_campanha");
        aoClicar?.();
      }}
    >
      {children}
    </a>
  );
}
