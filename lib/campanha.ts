import { whatsappLink, type Contato } from "@/lib/config";
import type { CampanhaItem } from "@/lib/site-content";

export const reais = (v: number) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`;

export function dataCurta(d: string | null) {
  if (!d) return "";
  const [, m, dia] = d.split("-");
  return `${dia}/${m}`;
}

export function validadeCampanha(termina_em: string | null) {
  return termina_em ? `Válido até ${dataCurta(termina_em)}` : "";
}

/**
 * Mensagem que vai pronta para o WhatsApp. Diz com todas as letras que é a
 * campanha, o serviço, o preço e a validade, e a observação vai em *negrito*
 * — assim o bot (e quem atende) entende e não estranha o valor.
 */
export function mensagemCampanha(c: CampanhaItem) {
  if (c.mensagem_whatsapp.trim()) return c.mensagem_whatsapp.trim();
  const partes = [`Olá! Vim pelo site e quero aproveitar a *${c.titulo || "campanha"}*`];
  const oferta = [c.selo, c.servico && `na ${c.servico}`].filter(Boolean).join(" ");
  if (oferta) partes.push(`: ${oferta}`);
  if (c.preco_por != null) partes.push(`${c.preco_de != null ? `, de ${reais(c.preco_de)}` : ","} por ${reais(c.preco_por)}`);
  if (c.termina_em) partes.push(`, válida até ${dataCurta(c.termina_em)}`);
  let msg = partes.join("") + ".";
  if (c.observacao.trim()) msg += `\n\n*${c.observacao.trim()}*`;
  return msg;
}

/** Botão da campanha: link do console ou, se vazio, WhatsApp com a mensagem da campanha */
export function linkCampanha(c: CampanhaItem, contato: Contato) {
  return c.link_botao || whatsappLink(contato, mensagemCampanha(c));
}
