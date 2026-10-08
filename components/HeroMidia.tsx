"use client";

import { useEffect, useState } from "react";
import Midia from "@/components/Midia";

// Fundo do topo: vídeo (computador e celular separados) ou foto, conforme o
// painel. Quem pediu menos movimento no aparelho vê só a imagem parada.
export default function HeroMidia({
  tipo,
  videoUrl,
  videoCelularUrl,
  imagemUrl,
}: {
  tipo: "video" | "imagem";
  videoUrl: string;
  videoCelularUrl: string;
  imagemUrl: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (tipo !== "video" || !videoUrl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const celular = window.matchMedia("(max-width: 767px)").matches;
    setSrc(celular && videoCelularUrl ? videoCelularUrl : videoUrl);
  }, [tipo, videoUrl, videoCelularUrl]);

  return (
    <div className="absolute inset-0 -z-10 bg-carbon" aria-hidden="true">
      {imagemUrl && (
        <Midia src={imagemUrl} prioridade className="absolute inset-0 w-full h-full object-cover" />
      )}
      {src && (
        <video
          key={src}
          src={src}
          poster={imagemUrl && !/\.(mp4|webm|mov|m4v)/i.test(imagemUrl) ? imagemUrl : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="hero-video absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
