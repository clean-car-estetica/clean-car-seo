"use client";

import { useContato } from "@/components/ContatoProvider";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { usePathname } from "next/navigation";
import { parseRota, obterOrigem } from "@/lib/track";

export default function AgendarButton({
  className,
  children,
  href,
}: {
  className?: string;
  children: React.ReactNode;
  href?: string;
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
  }

  return (
    <a href={href ?? contato.agendamentoUrl} onClick={registrarClique} className={className}>
      {children}
    </a>
  );
}
