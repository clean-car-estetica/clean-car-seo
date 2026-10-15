"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import type { Campanha } from "@/lib/site-content";
import { useContato } from "@/components/ContatoProvider";
import { linkCampanha, validadeCampanha, reais } from "@/lib/campanha";
import CampanhaBotao from "@/components/CampanhaBotao";
import Midia from "@/components/Midia";

const CHAVE_LOCAL = "cleancar_campanha_fechada";

export default function CampanhaPopup({ campanha: c }: { campanha: Campanha }) {
  const pathname = usePathname();
  const contato = useContato();
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!c.ativo) return;
    // Na página inicial a campanha já aparece na faixa do topo
    if (pathname === "/" || pathname.startsWith("/admin") || pathname === "/avaliar" || pathname === "/orcamento") return;
    if (document.documentElement.classList.contains("cc-editar")) return;
    try { if (sessionStorage.getItem(CHAVE_LOCAL)) return; } catch {}
    const t = setTimeout(() => setVisivel(true), 6000);
    return () => clearTimeout(t);
  }, [pathname, c.ativo]);

  function fechar() {
    setVisivel(false);
    try { sessionStorage.setItem(CHAVE_LOCAL, "1"); } catch {}
  }

  if (!visivel) return null;
  const validade = validadeCampanha(c.termina_em);

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0" onClick={fechar}>
      <div className="relative w-full max-w-md bg-card border border-verniz/40 rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button onClick={fechar} className="absolute top-3 right-3 z-10 text-steel bg-black/50 rounded-full p-1.5" aria-label="Fechar">
          <X size={18} />
        </button>
        {c.imagem_url && <Midia src={c.imagem_url} alt={c.titulo} className="w-full aspect-[4/3] object-cover" />}
        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-verniz-shine">{c.titulo}</p>
          {c.selo && <p className="mt-1 font-display font-extrabold text-5xl leading-none text-steel">{c.selo}</p>}
          {c.texto && <p className="mt-2 text-sm text-steel-line leading-relaxed">{c.texto}</p>}
          {c.preco_por != null && (
            <p className="mt-3 flex items-baseline gap-2">
              {c.preco_de != null && <span className="text-sm text-steel-line line-through">de {reais(c.preco_de)}</span>}
              <span className="font-display font-extrabold text-3xl text-verniz-shine">por {reais(c.preco_por)}{c.observacao ? "*" : ""}</span>
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <CampanhaBotao href={linkCampanha(c, contato)} aoClicar={fechar} className="rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2.5 text-sm hover:bg-verniz-shine transition-colors">
              {c.texto_botao}
            </CampanhaBotao>
            {validade && <span className="text-xs font-bold text-steel-line">{validade}</span>}
          </div>
          {c.observacao && <p className="mt-3 text-[11px] text-steel-line">* {c.observacao}</p>}
        </div>
      </div>
    </div>
  );
}
