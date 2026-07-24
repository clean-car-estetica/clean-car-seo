"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, Gift } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { usePromocoes } from "@/components/PromoProvider";

const CHAVE_LOCAL = "cleancar_cupom_fechado";

export default function CupomPopup() {
  const pathname = usePathname();
  const { cupom } = usePromocoes();
  const [visivel, setVisivel] = useState(false);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname === "/avaliar" || pathname === "/orcamento") return;
    if (sessionStorage.getItem(CHAVE_LOCAL)) return;
    const t = setTimeout(() => setVisivel(true), 12000);
    return () => clearTimeout(t);
  }, [pathname]);

  function fechar() {
    setVisivel(false);
    sessionStorage.setItem(CHAVE_LOCAL, "1");
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await supabaseBrowser().from("leads").insert({ tipo: "cupom_primeira_visita", nome, whatsapp });
    setEnviando(false);
    setEnviado(true);
    sessionStorage.setItem(CHAVE_LOCAL, "1");
  }

  if (!visivel) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 px-4 pb-4 sm:pb-0">
      <div className="relative w-full max-w-sm bg-card border border-card-line rounded-2xl p-6">
        <button onClick={fechar} className="absolute top-4 right-4 text-steel-line hover:text-steel" aria-label="Fechar">
          <X size={20} />
        </button>

        {enviado ? (
          <div className="text-center py-4">
            <Gift className="mx-auto text-verniz-shine mb-3" size={32} />
            <h3 className="font-display font-bold text-lg text-steel mb-2">Cupom reservado! 🎉</h3>
            <p className="text-sm text-steel-line">Vamos te chamar no WhatsApp com os detalhes.</p>
          </div>
        ) : (
          <>
            <Gift className="text-verniz-shine mb-3" size={28} />
            <h3 className="font-display font-bold text-lg text-steel mb-1">{cupom.titulo}</h3>
            <p className="text-sm text-steel-line mb-4">{cupom.texto}</p>
            <form onSubmit={enviar} className="grid gap-3">
              <input
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome"
                className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
              />
              <input
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp com DDD"
                className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
              />
              <button
                type="submit"
                disabled={enviando}
                className="rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine disabled:opacity-40"
              >
                {enviando ? "Enviando..." : "Quero meu cupom"}
              </button>
              {cupom.regras && <p className="text-[11px] text-steel-line/70 leading-relaxed">{cupom.regras}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
