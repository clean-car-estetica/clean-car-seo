"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import AgendarButton from "@/components/AgendarButton";
import { useContato } from "@/components/ContatoProvider";
import { useTextos } from "@/components/TextosProvider";
import { whatsappLink } from "@/lib/config";

function IconeWhatsapp({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.9C21.96 6.45 17.5 2 12.04 2zm5.8 14.13c-.24.68-1.42 1.3-1.96 1.38-.5.08-1.13.11-1.83-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12.99 2.06 1.31 2.35 1.45.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.94.29.14.48.21.55.33.08.12.08.68-.16 1.36z"/>
    </svg>
  );
}

function IconeInstagram({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Header() {
  const [aberto, setAberto] = useState(false);
  const contato = useContato();
  const t = useTextos();

  // 07/10/2026: topo enxuto — só o essencial na barra; o resto fica no menu
  // do celular e no rodapé.
  const LINKS = [
    { href: "/#servicos", label: t.navServicos },
    { href: "/#planos", label: t.navPlanos },
    { href: "/sobre", label: t.navSobre },
    { href: "/contato", label: t.navContato },
  ];
  const LINKS_MENU = [
    ...LINKS,
    { href: "/faq", label: t.navFaq },
    { href: "/#indicacao", label: t.navIndicacao },
    { href: "/beneficios", label: t.navBeneficios },
    { href: "/blog", label: t.navBlog },
  ];
  const pathname = usePathname();
  // Clicar na marca sempre leva ao início da página inicial, de qualquer página.
  function irParaInicio(e: React.MouseEvent) {
    setAberto(false);
    if (pathname === "/") {
      e.preventDefault();
      window.history.replaceState(null, "", "/");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const iconesSociais = (
    <>
      <a
        href={whatsappLink(contato)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="w-9 h-9 rounded-full bg-card border border-card-line flex items-center justify-center text-steel-line hover:text-[#25D366] hover:border-[#25D366]/50 transition-colors"
      >
        <IconeWhatsapp size={16} />
      </a>
      <a
        href={contato.instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="w-9 h-9 rounded-full bg-card border border-card-line flex items-center justify-center text-steel-line hover:text-verniz-shine hover:border-verniz/50 transition-colors"
      >
        <IconeInstagram size={16} />
      </a>
    </>
  );

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-carbon/85 backdrop-blur-md border-b border-card-line">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          onClick={irParaInicio}
          aria-label="Clean Car — voltar ao início"
          className="flex items-center gap-3 font-display font-extrabold text-2xl tracking-tight text-steel shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-verniz"
        >
          <img src="/logo-clean-car.png" alt="" width={44} height={44} className="w-11 h-11 rounded-full ring-2 ring-verniz/40" />
          <span>
            CLEAN <span className="text-verniz-shine glow-text">CAR</span>
          </span>
        </Link>
        <nav className="hidden lg:flex gap-7 font-display text-lg tracking-wide text-steel">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-verniz-shine">{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2">{iconesSociais}</div>
          <AgendarButton className="hidden sm:inline-block rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm tracking-wide hover:bg-verniz-shine transition-colors whitespace-nowrap">
            {t.navBotaoAgendar}
          </AgendarButton>
          <button
            onClick={() => setAberto(!aberto)}
            className="text-steel p-2 -mr-2 lg:ml-1"
            aria-label={aberto ? "Fechar menu" : "Abrir menu"}
          >
            {aberto ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {aberto && (
        <nav className="bg-carbon border-t border-card-line px-6 py-4 flex flex-col gap-4 lg:absolute lg:right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] lg:top-full lg:w-72 lg:rounded-b-2xl lg:border lg:shadow-2xl font-display text-lg text-steel-line">
          {LINKS_MENU.map((l, i) => (
            <Link key={l.href} href={l.href} onClick={() => setAberto(false)} className={`hover:text-verniz-shine ${i < LINKS.length ? "lg:hidden" : ""}`}>
              {l.label}
            </Link>
          ))}
          <div className="sm:hidden flex items-center gap-2 py-1">{iconesSociais}</div>
          <AgendarButton className="sm:hidden inline-block text-center rounded-full bg-verniz text-carbon font-display font-bold px-5 py-3 text-sm tracking-wide hover:bg-verniz-shine transition-colors">
            {t.navBotaoAgendar}
          </AgendarButton>
        </nav>
      )}
    </header>
  );
}
