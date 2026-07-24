"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { LayoutDashboard, ImageIcon, Search, LogOut, Home, MapPin, Newspaper } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

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
    { href: "/admin/home", label: "Home", icon: Home },
    { href: "/admin/conteudo", label: "Serviços", icon: ImageIcon },
    { href: "/admin/paginas-locais", label: "Páginas locais", icon: MapPin },
    { href: "/admin/blog", label: "Blog", icon: Newspaper },
    { href: "/admin/palavras-chave", label: "Palavras-chave", icon: Search },
  ];

  return (
    <div className="min-h-screen bg-carbon flex">
      <aside className="w-60 shrink-0 border-r border-card-line p-6 flex flex-col">
        <div className="font-display font-extrabold text-xl text-steel mb-8">
          CLEAN <span className="text-verniz-shine">CAR</span>
          <div className="text-xs font-sans font-normal text-steel-line mt-1">Console</div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
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
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
