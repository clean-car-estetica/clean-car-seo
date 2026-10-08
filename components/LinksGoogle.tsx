"use client";

import { useContato } from "@/components/ContatoProvider";

// Ver avaliações e deixar uma avaliação no Google. Avaliação é o que mais
// pesa para aparecer no mapa do Google em buscas como "estética perto de mim".
export default function LinksGoogle() {
  const contato = useContato();
  return (
    <div className="mt-10 flex flex-wrap justify-center gap-3">
      <a href={contato.googleUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-card-line px-6 py-2.5 font-display font-bold text-steel hover:border-verniz hover:text-verniz-shine transition-colors">
        Ver todas as avaliações no Google
      </a>
      {contato.googleReviewUrl && (
        <a href={contato.googleReviewUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-cera text-carbon px-6 py-2.5 font-display font-bold hover:brightness-95 transition-all">
          Já é cliente? Avalie a Clean Car
        </a>
      )}
    </div>
  );
}
