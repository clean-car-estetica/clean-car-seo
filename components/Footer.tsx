import { CONTATO, whatsappLink } from "@/lib/config";

export default function Footer() {
  return (
    <footer id="contato" className="bg-carbon-soft border-t border-card-line text-steel-line mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-3">
        <div>
          <div className="font-display font-extrabold text-xl text-steel">CLEAN <span className="text-verniz-shine">CAR</span></div>
          <p className="mt-3 text-sm leading-relaxed">
            Estética automotiva de estúdio em Mogi das Cruzes e região do Alto Tietê. Química Vonixx, hora marcada.
          </p>
        </div>
        <div>
          <div className="font-display font-bold text-sm uppercase tracking-wide text-verniz-shine mb-3">
            Atendimento
          </div>
          <p className="text-sm leading-relaxed">Mogi das Cruzes · Suzano · Poá · Ferraz de Vasconcelos · Itaquaquecetuba</p>
        </div>
        <div>
          <div className="font-display font-bold text-sm uppercase tracking-wide text-verniz-shine mb-3">
            Contato
          </div>
          <p className="text-sm">
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="hover:text-verniz-shine">
              WhatsApp: (11) 91263-0375
            </a>
          </p>
          <p className="text-sm">
            <a href={CONTATO.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-verniz-shine">
              @{CONTATO.instagram}
            </a>
          </p>
          <p className="text-sm">
            <a href={CONTATO.googleUrl} target="_blank" rel="noopener noreferrer" className="hover:text-verniz-shine">
              Ver avaliações no Google
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
