import { Star, Quote } from "lucide-react";
import { SITE_URL } from "@/lib/config";

export const VIDEO_CLIENTE = {
  src: "/midia/relato-cliente.mp4",
  capa: "/midia/relato-cliente-capa.jpg",
  data: "2026-10-15",
  duracao: "PT33S",
};

// Falas da cliente, do jeito que ela disse (sem corrigir).
const FALAS = [
  "Olha como que o carro sai.",
  "Você é doido, não sei se saiu do lava rápido ou da concessionária.",
  "Top demais, os meninos é super caprichado, olha isso.",
  "O carro ficou zero, zero, zero, brilhando.",
  "Quem quiser vir lavar sua nave aqui, ó, já sabem.",
  "Melhor lava rápido de Mogi.",
  "Nossa, as meninas arrasaram demais, mas demais.",
];

export default function VideoCliente({ notaGoogle }: { notaGoogle?: string }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: "Cliente mostra o carro na retirada da Clean Car Estética Automotiva",
    description: "Cliente grava o carro na retirada da Clean Car, em Mogi das Cruzes: " + FALAS.join(" "),
    thumbnailUrl: `${SITE_URL}${VIDEO_CLIENTE.capa}`,
    contentUrl: `${SITE_URL}${VIDEO_CLIENTE.src}`,
    uploadDate: VIDEO_CLIENTE.data,
    duration: VIDEO_CLIENTE.duracao,
    inLanguage: "pt-BR",
    transcript: FALAS.join(" "),
    publisher: { "@id": `${SITE_URL}/#empresa` },
  };

  return (
    <section aria-labelledby="video-cliente-titulo" className="mx-auto max-w-6xl px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid gap-10 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] items-center">
        <video
          src={VIDEO_CLIENTE.src}
          poster={VIDEO_CLIENTE.capa}
          controls
          playsInline
          preload="none"
          className="w-full max-w-[320px] mx-auto aspect-[9/16] rounded-3xl border border-card-line bg-card object-cover"
        />

        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-verniz-shine">Quem já passou pela Clean Car</p>
          <h2 id="video-cliente-titulo" className="mt-2 font-display font-bold text-3xl md:text-4xl text-steel leading-tight text-balance">
            “Não sei se saiu do lava rápido ou da concessionária.”
          </h2>
          <p className="mt-4 text-steel-line max-w-xl">
            Vídeo gravado pela própria cliente na hora de buscar o carro. Sem roteiro, do jeito que ela falou.
          </p>

          <details className="mt-6 max-w-xl rounded-2xl bg-card border border-card-line p-5 group">
            <summary className="cursor-pointer font-display font-bold text-steel flex items-center gap-2">
              <Quote size={16} className="text-verniz-shine" aria-hidden /> O que ela diz no vídeo
            </summary>
            <ul className="mt-3 space-y-1.5 text-sm text-steel-line">
              {FALAS.map((f) => (
                <li key={f}>“{f}”</li>
              ))}
            </ul>
          </details>

          {notaGoogle && (
            <p className="mt-6 inline-flex items-center gap-2 text-sm text-steel-line">
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={14} className="fill-cera text-cera" aria-hidden />
                ))}
              </span>
              Nota {notaGoogle} no Google
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
