"use client";

import { whatsappLink } from "@/lib/config";
import { useContato } from "@/components/ContatoProvider";

export default function Footer() {
  const contato = useContato();

  return (
    <footer id="contato" className="bg-carbon-soft border-t border-card-line text-steel-line mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-display font-extrabold text-xl text-steel">CLEAN <span className="text-verniz-shine">CAR</span></div>
          <p className="mt-3 text-sm leading-relaxed">
            Estúdio físico em Mogi das Cruzes, atendendo também clientes da região do Alto Tietê. Química Vonixx, hora marcada.
          </p>
        </div>
        <div>
          <div className="font-display font-bold text-sm uppercase tracking-wide text-verniz-shine mb-3">
            Estúdio
          </div>
          <p className="text-sm leading-relaxed">{contato.endereco}</p>
          <p className="text-sm leading-relaxed text-steel-line/80 mt-1">
            Recebemos clientes de Suzano, Poá, Ferraz de Vasconcelos e Itaquaquecetuba
          </p>
        </div>
        <div>
          <div className="font-display font-bold text-sm uppercase tracking-wide text-verniz-shine mb-3">
            Horário
          </div>
          <p className="text-sm leading-relaxed">Segunda a sexta: 9h às 18h</p>
          <p className="text-sm leading-relaxed">Sábado: 9h às 17h</p>
          <p className="text-sm leading-relaxed text-steel-line/80 mt-1">
            Feriados e feriados prolongados sujeitos a alteração
          </p>
        </div>
        <div>
          <div className="font-display font-bold text-sm uppercase tracking-wide text-verniz-shine mb-3">
            Contato
          </div>
          <p className="text-sm">
            <a href={whatsappLink(contato)} target="_blank" rel="noopener noreferrer" className="hover:text-verniz-shine">
              WhatsApp: {contato.whatsapp}
            </a>
          </p>
          <p className="text-sm">
            <a href={contato.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-verniz-shine">
              @{contato.instagram}
            </a>
          </p>
          <p className="text-sm">
            <a href={contato.googleUrl} target="_blank" rel="noopener noreferrer" className="hover:text-verniz-shine">
              Ver no Google Maps / avaliações
            </a>
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-steel-line/60 py-4 border-t border-card-line">
        © {new Date().getFullYear()} Clean Car Estética Automotiva
      </div>
    </footer>
  );
}
