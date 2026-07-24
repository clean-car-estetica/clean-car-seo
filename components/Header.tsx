"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import AgendarButton from "@/components/AgendarButton";

const LINKS = [
  { href: "/servicos/vitrificacao", label: "Vitrificação" },
  { href: "/servicos/polimento", label: "Polimento" },
  { href: "/servicos/higienizacao", label: "Higienização" },
  { href: "/blog", label: "Blog" },
];

export default function Header() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-carbon/85 backdrop-blur-md border-b border-card-line">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display font-extrabold text-2xl tracking-tight text-steel" onClick={() => setAberto(false)}>
          CLEAN <span className="text-verniz-shine glow-text">CAR</span>
        </Link>
        <nav className="hidden md:flex gap-6 font-display text-lg tracking-wide text-steel-line">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-verniz-shine">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <AgendarButton className="hidden sm:inline-block rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm tracking-wide hover:bg-verniz-shine transition-colors">
            Agendar
          </AgendarButton>
          <button
            onClick={() => setAberto(!aberto)}
            className="md:hidden text-steel p-2 -mr-2"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          >
            {aberto ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {aberto && (
        <nav className="md:hidden bg-carbon border-t border-card-line px-6 py-4 flex flex-col gap-4 font-display text-lg text-steel-line">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setAberto(false)} className="hover:text-verniz-shine">
              {l.label}
            </Link>
          ))}
          <AgendarButton className="sm:hidden inline-block text-center rounded-full bg-verniz text-carbon font-display font-bold px-5 py-3 text-sm tracking-wide hover:bg-verniz-shine transition-colors">
            Agendar
          </AgendarButton>
        </nav>
      )}
    </header>
  );
}
