import { whatsappLink, type Contato } from "@/lib/config";
import type { Campanha } from "@/lib/site-content";

/** Botão da campanha: link do console ou, se vazio, WhatsApp já citando a campanha */
export function linkCampanha(c: Campanha, contato: Contato) {
  if (c.link_botao) return c.link_botao;
  return whatsappLink(contato, `Olá! Vim pelo site e quero aproveitar a campanha: ${c.titulo}${c.selo ? ` (${c.selo})` : ""}.`);
}

export function validadeCampanha(termina_em: string | null) {
  if (!termina_em) return "";
  const [, m, d] = termina_em.split("-");
  return `Válido até ${d}/${m}`;
}

export const reais = (v: number) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;
