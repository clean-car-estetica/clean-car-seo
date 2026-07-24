"use client";

import { CONTATO } from "@/lib/config";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { usePathname } from "next/navigation";

export default function AgendarButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const pathname = usePathname();

  function registrarClique() {
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "click_agendar", page_path: pathname })
      .then(() => {});
  }

  return (
    <a href={CONTATO.agendamentoUrl} onClick={registrarClique} className={className}>
      {children}
    </a>
  );
}
