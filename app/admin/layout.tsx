"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  LayoutDashboard, ImageIcon, Search, LogOut, Home, MapPin, Newspaper, HelpCircle,
  Phone, Building2, Smile, Inbox, MessageSquareQuote, Percent, Award, GitCompare, CreditCard, Link2,
  Palette, FileText, Layers, PackageSearch, Type, Plug, FilePlus2, Megaphone, Menu, X, ChevronDown,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [gruposFechados, setGruposFechados] = useState<Set<string>>(new Set());

  function alternarGrupo(titulo: string) {
    setGruposFechados((atual) => {
      const novo = new Set(atual);
      if (novo.has(titulo)) novo.delete(titulo);
      else novo.add(titulo);
      return novo;
    });
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  async function sair() {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const grupos = [
    {
      titulo: "Visão geral",
      links: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/leads", label: "Leads", icon: Inbox },
        { href: "/admin/nps", label: "NPS", icon: Smile },
        { href: "/admin/palavras-chave", label: "Palavras-chave", icon: Search },
        { href: "/admin/links", label: "Links de rastreamento", icon: Link2 },
      ],
    },
    {
      titulo: "Blocos da Home",
      links: [
        { href: "/admin/home", label: "Topo (hero)", icon: Home },
        { href: "/admin/processo", label: "Nosso processo", icon: Layers },
        { href: "/admin/produtos", label: "Produtos usados", icon: PackageSearch },
        { href: "/admin/transformacoes", label: "Antes e depois", icon: GitCompare },
        { href: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquareQuote },
      ],
    },
    {
      titulo: "Catálogo e páginas",
      links: [
        { href: "/admin/conteudo", label: "Serviços", icon: ImageIcon },
        { href: "/admin/cidades", label: "Cidades", icon: Building2 },
        { href: "/admin/paginas-locais", label: "Páginas locais", icon: MapPin },
        { href: "/admin/blog", label: "Blog", icon: Newspaper },
        { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
        { href: "/admin/paginas", label: "Páginas personalizadas", icon: FilePlus2 },
      ],
    },
    {
      titulo: "Fidelidade e promoções",
      links: [
        { href: "/admin/planos", label: "Planos mensais", icon: CreditCard },
        { href: "/admin/promocoes", label: "Promoções", icon: Percent },
        { href: "/admin/campanha", label: "Campanha (pop-up)", icon: Megaphone },
        { href: "/admin/beneficios", label: "Benefícios", icon: Award },
      ],
    },
    {
      titulo: "Configurações",
      links: [
        { href: "/admin/contato", label: "Contato e links", icon: Phone },
        { href: "/admin/tema", label: "Tema (cores)", icon: Palette },
        { href: "/admin/metadados", label: "Metadados", icon: FileText },
        { href: "/admin/textos", label: "Textos do site", icon: Type },
        { href: "/admin/integracao-gbr", label: "Integração GBR SAS", icon: Plug },
      ],
    },
  ];

  const conteudoSidebar = (
    <>
      <div className="font-display font-extrabold text-xl text-steel mb-8">
        CLEAN <span className="text-verniz-shine">CAR</span>
        <div className="text-xs font-sans font-normal text-steel-line mt-1">Console</div>
      </div>
      <nav className="flex flex-col gap-3 flex-1 overflow-y-auto">
        {grupos.map((grupo) => {
          const temPaginaAtiva = grupo.links.some((l) => l.href === pathname);
          const fechado = gruposFechados.has(grupo.titulo) && !temPaginaAtiva;
          return (
            <div key={grupo.titulo}>
              <button
                onClick={() => alternarGrupo(grupo.titulo)}
                className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-steel-line/60 hover:text-steel-line"
              >
                {grupo.titulo}
                <ChevronDown size={14} className={`transition-transform ${fechado ? "-rotate-90" : ""}`} />
              </button>
              {!fechado && (
                <div className="flex flex-col gap-1 mt-1">
                  {grupo.links.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuAberto(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                        pathname === href
                          ? "bg-verniz/10 text-verniz-shine"
                          : "text-steel-line hover:bg-card hover:text-steel"
                      }`}
                    >
                      <Icon size={18} />
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <button
        onClick={sair}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-steel-line hover:bg-card hover:text-warn mt-4"
      >
        <LogOut size={18} />
        Sair
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-carbon flex flex-col md:flex-row">
      {/* Topo mobile */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-card-line">
        <div className="font-display font-extrabold text-lg text-steel">
          CLEAN <span className="text-verniz-shine">CAR</span>
        </div>
        <button onClick={() => setMenuAberto(!menuAberto)} className="text-steel p-2" aria-label="Menu">
          {menuAberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuAberto && (
        <div className="md:hidden border-b border-card-line p-6 flex flex-col max-h-[80vh] overflow-y-auto">{conteudoSidebar}</div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-card-line p-6 flex-col h-screen sticky top-0">
        {conteudoSidebar}
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
