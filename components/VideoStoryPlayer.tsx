"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { gtagEvent } from "@/lib/gtag";

// Player no formato "story" de celular: começa sozinho, sem som, quando
// aparece na tela (como Reels/Stories). Um toque liga o som e volta pro início.
export default function VideoStoryPlayer({
  src,
  capa,
  nome,
  legenda,
  ariaLabel,
}: {
  src: string;
  capa: string;
  nome: string;
  legenda: string;
  ariaLabel: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [mudo, setMudo] = useState(true);
  const [tocando, setTocando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [comSom, setComSom] = useState(false); // já tocou com som alguma vez

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && e.intersectionRatio >= 0.5) {
          if (!reduzir && v.paused && !comSom) {
            v.preload = "auto";
            v.play().catch(() => {});
          }
        } else if (!v.paused) {
          v.pause();
        }
      },
      { threshold: [0, 0.5] },
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, [comSom]);

  function tocarComSom() {
    const v = ref.current;
    if (!v) return;
    if (!comSom) {
      v.currentTime = 0;
      setComSom(true);
      gtagEvent("video_cliente_play", { video: "depoimento-cliente" });
    }
    v.muted = false;
    setMudo(false);
    v.play().catch(() => {});
  }

  function alternar() {
    const v = ref.current;
    if (!v) return;
    if (mudo) return tocarComSom();
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      {/* brilho atrás do "celular" */}
      <div aria-hidden className="absolute -inset-8 -z-10 rounded-[3rem] bg-[radial-gradient(closest-side,var(--verniz-glow),transparent)] blur-2xl" />

      <div className="relative aspect-[9/16] overflow-hidden rounded-[2rem] border border-card-line bg-card shadow-2xl shadow-black/60 ring-1 ring-white/5">
        <video
          ref={ref}
          src={src}
          poster={capa}
          muted
          playsInline
          loop={!comSom}
          preload="none"
          aria-label={ariaLabel}
          onPlay={() => setTocando(true)}
          onPause={() => setTocando(false)}
          onEnded={() => setTocando(false)}
          onTimeUpdate={(e) => {
            const v = e.currentTarget;
            if (v.duration) setProgresso(v.currentTime / v.duration);
          }}
          onClick={alternar}
          className="absolute inset-0 h-full w-full cursor-pointer object-cover"
        />

        {/* topo estilo story: barra de progresso */}
        <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/50 to-transparent px-3 pb-6 pt-3">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/30">
            <div className="h-full bg-white transition-[width] duration-200 ease-linear" style={{ width: `${progresso * 100}%` }} />
          </div>
        </div>

        {/* chamada pra ligar o som enquanto toca mudo */}
        {mudo ? (
          <button
            type="button"
            onClick={tocarComSom}
            className="absolute inset-0 flex items-end justify-center pb-6"
            aria-label="Assistir o vídeo com som"
          >
            {!tocando && (
              <span aria-hidden className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-carbon shadow-xl">
                <Play size={34} className="ml-1 fill-carbon" />
              </span>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur animate-pulse">
              <VolumeX size={16} aria-hidden /> Toque para ouvir
            </span>
          </button>
        ) : (
          <>
            {!tocando && (
              <button
                type="button"
                onClick={alternar}
                aria-label="Continuar o vídeo"
                className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-carbon shadow-xl"
              >
                <Play size={34} className="ml-1 fill-carbon" aria-hidden />
              </button>
            )}
            <span aria-hidden className="pointer-events-none absolute bottom-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white">
              <Volume2 size={16} />
            </span>
          </>
        )}
      </div>

      {/* quem postou — fora do vídeo pra não cobrir os adesivos do story dela */}
      <div className="mt-4 flex items-center justify-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cera to-verniz p-[2px]">
          <span className="grid h-full w-full place-items-center rounded-full bg-carbon font-display text-sm font-bold text-steel">
            {nome.charAt(0)}
          </span>
        </span>
        <span className="leading-tight">
          <span className="block text-sm font-semibold text-steel">{nome}</span>
          <span className="block text-xs text-steel-line">{legenda}</span>
        </span>
      </div>
    </div>
  );
}
