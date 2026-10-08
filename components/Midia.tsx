// Foto ou vídeo: qualquer campo de imagem do painel aceita os dois
// (08/10/2026). Se o endereço for de vídeo (.mp4, .webm, .mov), toca em
// loop, mudo, sem controles — como uma foto em movimento.
export function ehVideo(url?: string | null) {
  return !!url && /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
}

export default function Midia({ src, alt = "", className = "", lazy = false, style }: { src: string; alt?: string; className?: string; lazy?: boolean; style?: React.CSSProperties }) {
  if (!src) return null;
  if (ehVideo(src)) {
    return <video src={src} autoPlay muted loop playsInline preload="metadata" aria-label={alt || undefined} className={className} style={style} />;
  }
  return <img src={src} alt={alt} className={className} style={style} loading={lazy ? "lazy" : undefined} />;
}
