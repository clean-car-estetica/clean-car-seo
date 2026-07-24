"use client";

import { CONTATO } from "@/lib/config";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { usePathname } from "next/navigation";
import { parseRota } from "@/lib/track";

export default function AgendarButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const pathname = usePathname();

  function registrarClique() {
    const { service_slug, city_slug } = parseRota(pathname);
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "click_agendar", page_path: pathname, service_slug, city_slug })
      .then(() => {});
  }

  return (
    <a href={CONTATO.agendamentoUrl} onClick={registrarClique} className={className}>
      {children}
    </a>
  );
}
