"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/config";
import { useContato } from "@/components/ContatoProvider";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { parseRota, obterOrigem } from "@/lib/track";
import { gtagEvent } from "@/lib/gtag";

export default function WhatsappCTA({ texto = "Falar no WhatsApp" }: { texto?: string }) {
  const pathname = usePathname();
  const contato = useContato();

  function registrarClique() {
    const { service_slug, city_slug } = parseRota(pathname);
    const origem = obterOrigem();
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "click_whatsapp", page_path: pathname, service_slug, city_slug, origem })
      .then(() => {});
    gtagEvent("click_whatsapp", { page_path: pathname, service_slug, city_slug });
  }

  return (
    <a
      href={whatsappLink(contato)}
      onClick={registrarClique}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border-2 border-[#25D366] text-[#25D366] font-display font-bold px-8 py-3 tracking-wide hover:bg-[#25D366] hover:text-carbon transition-colors"
    >
      {texto}
    </a>
  );
}
