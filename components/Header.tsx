import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-carbon text-steel">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold text-2xl tracking-tight">
          CLEAN <span className="text-verniz-shine">CAR</span>
        </Link>
        <nav className="hidden md:flex gap-6 font-display text-lg tracking-wide">
          <Link href="/servicos/vitrificacao" className="hover:text-verniz-shine">Vitrificação</Link>
          <Link href="/servicos/polimento" className="hover:text-verniz-shine">Polimento</Link>
          <Link href="/servicos/higienizacao" className="hover:text-verniz-shine">Higienização</Link>
          <Link href="/blog" className="hover:text-verniz-shine">Blog</Link>
        </nav>
        <a
          href="#contato"
          className="rounded-full bg-cera text-carbon font-display font-bold px-5 py-2 text-sm tracking-wide hover:brightness-95"
        >
          Agendar
        </a>
      </div>
    </header>
  );
}
