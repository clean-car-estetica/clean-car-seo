"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { Campanha } from "@/lib/site-content";
import { gtagEvent } from "@/lib/gtag";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { parseRota, obterOrigem } from "@/lib/track";

const CHAVE_LOCAL = "cleancar_campanha_fechada";

export default function CampanhaPopup({ campanha }: { campanha: Campanha }) {
  const pathname = usePathname();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!campanha.ativo) return;
    if (pathname.startsWith("/admin") || pathname === "/avaliar" || pathname === "/orcamento") return;
    if (sessionStorage.getItem(CHAVE_LOCAL)) return;
    const t = setTimeout(() => setVisivel(true), 3000);
    return () => clearTimeout(t);
  }, [pathname, campanha.ativo]);

  function fechar() {
    setVisivel(false);
    sessionStorage.setItem(CHAVE_LOCAL, "1");
  }

  function registrarClique() {
    const { service_slug, city_slug } = parseRota(pathname);
    const origem = obterOrigem();
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "click_agendar", page_path: pathname, service_slug, city_slug, origem })
      .then(() => {});
    gtagEvent("click_campanha");
    fechar();
  }

  if (!visivel) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
      <div className="relative w-full max-w-md bg-card border border-verniz/40 rounded-2xl overflow-hidden">
        <button onClick={fechar} className="absolute top-3 right-3 z-10 text-steel-line hover:text-steel bg-black/40 rounded-full p-1" aria-label="Fechar">
          <X size={18} />
        </button>
        {campanha.imagem_url && (
          <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url('${campanha.imagem_url}')` }} />
        )}
        <div className="p-6">
          <h3 className="font-display font-bold text-xl text-steel mb-2">{campanha.titulo}</h3>
          <p className="text-sm text-steel-line leading-relaxed mb-5">{campanha.texto}</p>
          <a
            href={campanha.link_botao || "#"}
            onClick={registrarClique}
            target={campanha.link_botao?.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2.5 text-sm hover:bg-verniz-shine transition-colors"
          >
            {campanha.texto_botao}
          </a>
        </div>
      </div>
    </div>
  );
}
