"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { parseRota, obterOrigem, registrarEvento } from "@/lib/track";

// 15/10/2026: a visita só conta depois de 2 s com a página visível. Robôs que
// só abrem a página para tirar foto ou ler o texto (e páginas pré-carregadas
// em segundo plano) saem antes disso e deixam de inflar o número de visitas.
const TEMPO_MINIMO_MS = 2000;

export default function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let contou = false;
    const contar = () => {
      if (contou) return;
      contou = true;
      const { service_slug, city_slug } = parseRota(pathname);
      registrarEvento("pageview", pathname, { service_slug, city_slug, origem: obterOrigem() });
    };
    const agendar = () => {
      if (timer || contou) return;
      timer = setTimeout(() => {
        timer = null;
        if (document.visibilityState === "visible") contar();
      }, TEMPO_MINIMO_MS);
    };
    const aoMudar = () => {
      if (document.visibilityState === "visible") agendar();
      else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    if (document.visibilityState === "visible") agendar();
    document.addEventListener("visibilitychange", aoMudar);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", aoMudar);
    };
  }, [pathname]);

  return null;
}
