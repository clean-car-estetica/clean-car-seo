"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LayoutDashboard, ImageIcon, Search, LogOut, Home, MapPin, Newspaper, HelpCircle, Phone, Building2, Smile, Inbox, MessageSquareQuote, Percent, Award, GitCompare, Menu, X } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

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

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/leads", label: "Leads", icon: Inbox },
    { href: "/admin/promocoes", label: "Promoções", icon: Percent },
    { href: "/admin/beneficios", label: "Benefícios", icon: Award },
    { href: "/admin/home", label: "Home", icon: Home },
    { href: "/admin/transformacoes", label: "Antes e depois", icon: GitCompare },
    { href: "/admin/contato", label: "Contato", icon: Phone },
    { href: "/admin/conteudo", label: "Serviços", icon: ImageIcon },
    { href: "/admin/cidades", label: "Cidades", icon: Building2 },
    { href: "/admin/paginas-locais", label: "Páginas locais", icon: MapPin },
    { href: "/admin/blog", label: "Blog", icon: Newspaper },
    { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
    { href: "/admin/depoimentos", label: "Depoimentos", icon: MessageSquareQuote },
    { href: "/admin/palavras-chave", label: "Palavras-chave", icon: Search },
    { href: "/admin/nps", label: "NPS", icon: Smile },
  ];

  const conteudoSidebar = (
    <>
      <div className="font-display font-extrabold text-xl text-steel mb-8">
        CLEAN <span className="text-verniz-shine">CAR</span>
        <div className="text-xs font-sans font-normal text-steel-line mt-1">Console</div>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ href, label, icon: Icon }) => (
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
      </nav>
      <button
        onClick={sair}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-steel-line hover:bg-card hover:text-warn"
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
        <div className="md:hidden border-b border-card-line p-6 flex flex-col">{conteudoSidebar}</div>
      )}

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-card-line p-6 flex-col">
        {conteudoSidebar}
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
