"use client";

import { usePathname } from "next/navigation";
import { useContato } from "@/components/ContatoProvider";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { parseRota, obterOrigem } from "@/lib/track";
import { gtagEvent } from "@/lib/gtag";

export default function AssinarPlanoButton({ nomePlano, preco, className }: { nomePlano: string; preco: number; className?: string }) {
  const pathname = usePathname();
  const contato = useContato();

  const mensagem = encodeURIComponent(
    `Olá! Quero assinar o ${nomePlano} (R$ ${preco}/mês) da Clean Car. Pode me passar os detalhes de pagamento?`
  );

  function registrarClique() {
    const { service_slug, city_slug } = parseRota(pathname);
    const origem = obterOrigem();
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "click_whatsapp", page_path: pathname, service_slug, city_slug, origem })
      .then(() => {});
    gtagEvent("click_assinar_plano", { plano: nomePlano });
  }

  return (
    <a
      href={`https://wa.me/${contato.whatsapp}?text=${mensagem}`}
      onClick={registrarClique}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      Assinar
    </a>
  );
}
