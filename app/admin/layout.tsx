"use client";

import { useEffect, useState } from "react";
import { marcarNavegadorInterno } from "@/lib/track";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LayoutDashboard, Search, LogOut, Smile, Inbox, Link2, Plug, UserSearch, Menu, X, MousePointerClick } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);

  // Quem entra no console é o dono: este navegador deixa de contar nas métricas.
  // No painel lateral do editor (modo embutido), avisa o editor quando algo é salvo
  // para ele recarregar a prévia.
  useEffect(() => {
    marcarNavegadorInterno(true);
    if (!document.documentElement.classList.contains("cc-embed")) return;
    const avisar = () => window.parent.postMessage({ origem: "cc-painel", tipo: "salvo" }, window.location.origin);
    const aoEnviar = () => {
      setTimeout(avisar, 1200);
      setTimeout(avisar, 3500);
    };
    document.addEventListener("submit", aoEnviar, true);
    return () => document.removeEventListener("submit", aoEnviar, true);
  }, []);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  if (pathname === "/admin/editor") {
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

  // Menu enxuto: tudo que muda o conteúdo do site agora se edita pelo
  // Editor do site (clicando na prévia). Aqui ficam só as telas que não
  // são "pedaços do site".
  const grupos = [
    {
      titulo: "Painel",
      links: [
        { href: "/admin", label: "Resultados", icon: LayoutDashboard },
        { href: "/admin/editor", label: "Editor do site", icon: MousePointerClick },
        { href: "/admin/leads", label: "Contatos recebidos", icon: Inbox },
        { href: "/admin/nps", label: "Avaliações (NPS)", icon: Smile },
      ],
    },
    {
      titulo: "Ferramentas",
      links: [
        { href: "/admin/palavras-chave", label: "Palavras-chave", icon: Search },
        { href: "/admin/links", label: "Links de rastreamento", icon: Link2 },
        { href: "/admin/consulta-gbr", label: "Consultar cliente (GBR)", icon: UserSearch },
        { href: "/admin/integracao-gbr", label: "Integração GBR", icon: Plug },
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
          return (
            <div key={grupo.titulo}>
              <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-steel-line/60">{grupo.titulo}</p>
              {(
                <div className="flex flex-col gap-1 mt-1">
                  {grupo.links.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuAberto(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                        (pathname === href || (href !== "/admin" && pathname.startsWith(href + "/")))
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
      <div className="admin-chrome md:hidden flex items-center justify-between p-4 border-b border-card-line">
        <div className="font-display font-extrabold text-lg text-steel">
          CLEAN <span className="text-verniz-shine">CAR</span>
        </div>
        <button onClick={() => setMenuAberto(!menuAberto)} className="text-steel p-2" aria-label="Menu">
          {menuAberto ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {menuAberto && (
        <div className="admin-chrome md:hidden border-b border-card-line p-6 flex flex-col max-h-[80vh] overflow-y-auto">{conteudoSidebar}</div>
      )}

      {/* Sidebar desktop */}
      <aside className="admin-chrome hidden md:flex w-64 shrink-0 border-r border-card-line p-6 flex-col h-screen sticky top-0">
        {conteudoSidebar}
      </aside>

      <main className="admin-main flex-1 min-w-0 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
