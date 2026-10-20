"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { parseRota, obterOrigem, registrarEvento } from "@/lib/track";

// 15/10/2026: a visita só conta depois de 2 s com a página visível.
// 20/10/2026: e só depois de um gesto de gente (rolar, tocar, clicar, teclar ou
// mexer o mouse). Os robôs que rodam o site como navegador (Google, prévias de
// link, verificadores) adiantam o relógio da página e passavam pelos 2 s: em
// 15/10 foram 41 "pessoas" de uma página só, cada uma numa página diferente.
// Robô não rola nem toca a tela. Quem abre e sai sem encostar em nada deixa de
// contar, o que é aceitável: não chegou a ver o site.
const TEMPO_MINIMO_MS = 2000;
const GESTOS = ["scroll", "pointerdown", "touchstart", "keydown", "wheel", "mousemove"] as const;

export default function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let contou = false;
    let tempoOk = false;
    let gesto = false;
    const contar = () => {
      if (contou || !tempoOk || !gesto || document.visibilityState !== "visible") return;
      contou = true;
      soltar();
      const { service_slug, city_slug } = parseRota(pathname);
      registrarEvento("pageview", pathname, { service_slug, city_slug, origem: obterOrigem() });
    };
    const aoGesto = () => {
      gesto = true;
      contar();
    };
    const soltar = () => GESTOS.forEach((g) => window.removeEventListener(g, aoGesto));
    const agendar = () => {
      if (timer || contou || tempoOk) return;
      timer = setTimeout(() => {
        timer = null;
        if (document.visibilityState === "visible") {
          tempoOk = true;
          contar();
        }
      }, TEMPO_MINIMO_MS);
    };
    const aoMudar = () => {
      if (document.visibilityState === "visible") agendar();
      else if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    GESTOS.forEach((g) => window.addEventListener(g, aoGesto, { passive: true }));
    if (document.visibilityState === "visible") agendar();
    document.addEventListener("visibilitychange", aoMudar);
    return () => {
      if (timer) clearTimeout(timer);
      soltar();
      document.removeEventListener("visibilitychange", aoMudar);
    };
  }, [pathname]);

  return null;
}
