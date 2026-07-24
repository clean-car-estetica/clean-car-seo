import Link from "next/link";
import { CONTATO } from "@/lib/config";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-carbon/85 backdrop-blur-md border-b border-card-line">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold text-2xl tracking-tight text-steel">
          CLEAN <span className="text-verniz-shine glow-text">CAR</span>
        </Link>
        <nav className="hidden md:flex gap-6 font-display text-lg tracking-wide text-steel-line">
          <Link href="/servicos/vitrificacao" className="hover:text-verniz-shine">Vitrificação</Link>
          <Link href="/servicos/polimento" className="hover:text-verniz-shine">Polimento</Link>
          <Link href="/servicos/higienizacao" className="hover:text-verniz-shine">Higienização</Link>
          <Link href="/blog" className="hover:text-verniz-shine">Blog</Link>
        </nav>
        <a
          href={CONTATO.agendamentoUrl}
          className="rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm tracking-wide hover:bg-verniz-shine transition-colors"
        >
          Agendar
        </a>
      </div>
    </header>
  );
}
