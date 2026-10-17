import Link from "next/link";
import { Star, Gift, CheckCircle2 } from "lucide-react";
import { SITE_URL, TEXTO_BRINDE } from "@/lib/config";
import VideoStoryPlayer from "@/components/VideoStoryPlayer";
import WhatsappCTA from "@/components/WhatsappCTA";

export const VIDEO_CLIENTE = {
  src: "/midia/lavagem-de-carro-mogi-das-cruzes-cliente.mp4",
  capa: "/midia/lavagem-de-carro-mogi-das-cruzes-cliente.jpg",
  data: "2026-10-15",
  duracao: "PT33S",
  // Primeiro nome só — a cliente autorizou o uso do vídeo no site.
  cliente: "Juliana",
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
    name: "Lavagem Ouro em Mogi das Cruzes: cliente mostra o resultado na Clean Car",
    description: "Resultado da Lavagem Ouro (lavagem detalhada) em Mogi das Cruzes. A cliente grava o carro na retirada, posta no Instagram dela e diz: \"não sei se saiu do lava rápido ou da concessionária\". Clean Car Estética Automotiva, Jardim Universo.",
    thumbnailUrl: `${SITE_URL}${VIDEO_CLIENTE.capa}`,
    contentUrl: `${SITE_URL}${VIDEO_CLIENTE.src}`,
    uploadDate: VIDEO_CLIENTE.data,
    duration: VIDEO_CLIENTE.duracao,
    inLanguage: "pt-BR",
    transcript: FALAS.join(" "),
    publisher: { "@id": `${SITE_URL}/#empresa` },
  };

  return (
    <section
      id="video-cliente"
      aria-labelledby="video-cliente-titulo"
      className="relative isolate overflow-hidden border-y border-card-line bg-carbon-soft py-20 md:py-28 scroll-mt-24"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* fundo com brilho suave pra seção se destacar das vizinhas */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_30%_50%,color-mix(in_srgb,var(--verniz)_14%,transparent),transparent)]" />

      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[minmax(0,380px)_minmax(0,1fr)] md:grid-rows-[auto_1fr] md:gap-x-16 md:gap-y-0">
        {/* celular: título → vídeo → resto. Computador: vídeo à esquerda ocupando as duas linhas */}
        <div className="md:row-span-2 md:self-center">
          <VideoStoryPlayer
            src={VIDEO_CLIENTE.src}
            capa={VIDEO_CLIENTE.capa}
            nome={VIDEO_CLIENTE.cliente}
            legenda="Story no Instagram dela · marcou @cleancar_est26"
            ariaLabel="Vídeo: cliente mostra o carro depois da lavagem na Clean Car, em Mogi das Cruzes"
          />
        </div>

        <div className="-order-1 md:order-none md:col-start-2 md:row-start-1 md:self-end">
          <p className="inline-flex items-center gap-2 rounded-full border border-cera/30 bg-carbon/60 px-4 py-1.5 text-xs font-display font-bold uppercase tracking-wide text-cera">
            <span className="h-2 w-2 rounded-full bg-cera" aria-hidden /> Vídeo real de cliente
          </p>
          <h2 id="video-cliente-titulo" className="mt-4 font-display font-extrabold text-4xl md:text-5xl text-steel leading-[1.05] text-balance">
            Ela buscou o carro e <span className="text-verniz-shine glow-text">postou no Instagram</span>
          </h2>
          <p className="mt-4 max-w-xl text-steel-line">
            A {VIDEO_CLIENTE.cliente} gravou com o próprio celular na hora da retirada, depois de uma{" "}
            <Link href="/servicos/lavagem-ouro" className="text-verniz-shine underline underline-offset-2">Lavagem Ouro</Link>,
            e marcou a Clean Car no story dela. A gente só pediu pra mostrar aqui.
          </p>
        </div>

        <div className="md:col-start-2 md:row-start-2">
          <figure className="max-w-xl md:mt-8 border-l-4 border-cera pl-5">
            <blockquote className="font-display text-2xl md:text-3xl font-bold italic leading-snug text-steel">
              “Não sei se saiu do lava rápido ou da concessionária.”
            </blockquote>
            <figcaption className="mt-2 text-sm text-steel-line">— {VIDEO_CLIENTE.cliente}, cliente em Mogi das Cruzes</figcaption>
          </figure>

          <ul className="mt-8 grid max-w-xl gap-2 text-sm text-steel-line sm:grid-cols-2">
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-verniz-shine" aria-hidden /> Gravado pela cliente, não por nós</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={16} className="text-verniz-shine" aria-hidden /> Do jeito que ela postou</li>
            <li className="flex items-center gap-2 sm:col-span-2"><Gift size={16} className="text-cera" aria-hidden /> {TEXTO_BRINDE}</li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <WhatsappCTA texto="Quero meu carro assim" />
            {notaGoogle && (
              <p className="inline-flex items-center gap-2 text-sm text-steel-line">
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} className="fill-cera text-cera" aria-hidden />
                  ))}
                </span>
                Nota {notaGoogle} no Google
              </p>
            )}
          </div>

          {/* Transcrição: discreta pro visitante, mas no HTML pro Google e IAs */}
          <details className="mt-6 max-w-xl text-sm text-steel-line">
            <summary className="cursor-pointer underline underline-offset-2 hover:text-steel">Ler a transcrição do vídeo</summary>
            <p className="mt-2 leading-relaxed">{FALAS.join(" ")}</p>
          </details>
        </div>
      </div>
    </section>
  );
}
