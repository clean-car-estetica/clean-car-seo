"use client";

import { useEffect, useState } from "react";
import AgendarButton from "@/components/AgendarButton";

// Barra fixa no rodapé do celular nas páginas de serviço: preço e botão de
// agendar sempre à mão. Aparece depois que a pessoa rola um pouco.
export default function BarraAgendarCelular({ servico, preco }: { servico: string; preco?: number | null }) {
  const [visivel, setVisivel] = useState(false);
  useEffect(() => {
    const aoRolar = () => setVisivel(window.scrollY > 420);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  return (
    <div
      className={`md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-card-line bg-carbon/95 backdrop-blur px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center gap-3 transition-transform duration-300 ${visivel ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-steel truncate">{servico}</p>
        {preco ? <p className="text-xs text-steel-line">a partir de <span className="text-verniz-shine font-bold">R$ {preco}</span></p> : null}
      </div>
      <AgendarButton servico={servico} className="shrink-0 rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2.5">
        Agendar
      </AgendarButton>
    </div>
  );
}
