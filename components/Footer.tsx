export default function Footer() {
  return (
    <footer id="contato" className="bg-carbon text-steel-line mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="font-display font-extrabold text-xl text-steel">CLEAN CAR</div>
          <p className="mt-2 text-sm text-steel-line/80">
            Estética automotiva em Mogi das Cruzes e região do Alto Tietê.
          </p>
        </div>
        <div>
          <div className="font-display font-bold text-sm uppercase tracking-wide text-verniz-shine mb-2">
            Atendimento
          </div>
          <p className="text-sm">Mogi das Cruzes · Suzano · Poá · Ferraz de Vasconcelos · Itaquaquecetuba</p>
        </div>
        <div>
          <div className="font-display font-bold text-sm uppercase tracking-wide text-verniz-shine mb-2">
            Contato
          </div>
          <p className="text-sm">WhatsApp em breve · contato@cleancar.com.br</p>
        </div>
      </div>
      <div className="text-center text-xs text-steel-line/60 py-4 border-t border-white/10">
        © {new Date().getFullYear()} Clean Car Estética Automotiva
      </div>
    </footer>
  );
}
