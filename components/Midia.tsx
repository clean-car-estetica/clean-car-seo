// Foto ou vídeo: qualquer campo de imagem do painel aceita os dois
// (08/10/2026). Se o endereço for de vídeo (.mp4, .webm, .mov), toca em
// loop, mudo, sem controles — como uma foto em movimento.
//
// Fotos passam pelo otimizador da Vercel (/_next/image): saem em AVIF/WebP,
// no tamanho certo para cada tela, e carregam só quando chegam perto da tela
// — exceto as marcadas como prioridade (topo da página).
export function ehVideo(url?: string | null) {
  return !!url && /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url);
}

const LARGURAS = [480, 768, 1080, 1440, 1920];
const OTIMIZAVEL = /^(\/(?!_next)|https:\/\/(images\.pexels\.com|images\.unsplash\.com|lvxunawzyvdaqduyrqem\.supabase\.co)\/)/;

function otimizada(src: string, w: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;
}

export default function Midia({
  src,
  alt = "",
  className = "",
  lazy,
  prioridade = false,
  sizes = "100vw",
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  /** Mantido por compatibilidade: as fotos já carregam sob demanda por padrão. */
  lazy?: boolean;
  /** Foto do topo da página: carrega primeiro, sem esperar. */
  prioridade?: boolean;
  /** Largura que a foto ocupa na tela (ajuda a escolher o tamanho certo). */
  sizes?: string;
  style?: React.CSSProperties;
}) {
  if (!src) return null;
  if (ehVideo(src)) {
    return <video src={src} autoPlay muted loop playsInline preload="metadata" aria-label={alt || undefined} className={className} style={style} />;
  }
  void lazy;
  const carregamento = prioridade ? "eager" : "lazy";
  if (!OTIMIZAVEL.test(src) || /\.svg(\?|$)/i.test(src)) {
    return <img src={src} alt={alt} className={className} style={style} loading={carregamento} decoding="async" />;
  }
  return (
    <img
      src={otimizada(src, 1080)}
      srcSet={LARGURAS.map((w) => `${otimizada(src, w)} ${w}w`).join(", ")}
      sizes={sizes}
      alt={alt}
      className={className}
      style={style}
      loading={carregamento}
      decoding="async"
      fetchPriority={prioridade ? "high" : undefined}
    />
  );
}
