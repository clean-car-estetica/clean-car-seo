"use client";

import { useContato } from "@/components/ContatoProvider";
import { whatsappLink, mensagemAgendar } from "@/lib/config";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { usePathname } from "next/navigation";
import { parseRota, obterOrigem } from "@/lib/track";
import { gtagEvent } from "@/lib/gtag";

export default function AgendarButton({
  className,
  children,
  href,
  servico,
}: {
  className?: string;
  children: React.ReactNode;
  /** Link próprio (ex.: código de indicação). Sem ele, abre o WhatsApp. */
  href?: string;
  /** Nome do serviço: vai na mensagem do WhatsApp. */
  servico?: string;
}) {
  const pathname = usePathname();
  const contato = useContato();

  function registrarClique() {
    const { service_slug, city_slug } = parseRota(pathname);
    const origem = obterOrigem();
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "click_agendar", page_path: pathname, service_slug, city_slug, origem })
      .then(() => {});
    gtagEvent("click_agendar", { page_path: pathname, service_slug, city_slug });
  }

  return (
    <a
      href={href ?? whatsappLink(contato, mensagemAgendar(servico))}
      onClick={registrarClique}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
