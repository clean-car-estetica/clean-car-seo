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

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

/** "Em novembro" quando começa no dia 1 do mês; senão "A partir de 15/11". */
export function quandoComeca(inicia_em: string) {
  const [, m, d] = inicia_em.split("-");
  return d === "01" ? `Em ${MESES[Number(m) - 1]}` : `A partir de ${dataCurta(inicia_em)}`;
}

/** Mensagem do "Vem aí": a pessoa já garante o horário para quando a campanha começar. */
export function mensagemCampanhaProxima(c: CampanhaItem) {
  const quando = c.inicia_em ? quandoComeca(c.inicia_em).toLowerCase() : "em breve";
  return `Olá! Vi no site que vem aí a *${c.titulo || "nova campanha"}* (${quando}). Quero saber mais e já garantir meu horário.`;
}

/** Botão da campanha: link do console ou, se vazio, WhatsApp com a mensagem da campanha */
export function linkCampanha(c: CampanhaItem, contato: Contato) {
  return c.link_botao || whatsappLink(contato, mensagemCampanha(c));
}
