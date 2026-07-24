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
          <p className="text-sm">WhatsApp: (11) 99999-9999</p>
          <p className="text-sm">@cleancar_est26</p>
        </div>
      </div>
      <div className="text-center text-xs text-steel-line/60 py-4 border-t border-card-line">
        © {new Date().getFullYear()} Clean Car Estética Automotiva
      </div>
    </footer>
  );
}
