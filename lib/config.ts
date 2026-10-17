// Endereço público do site (domínio próprio desde 07/10/2026). Canonical,
// sitemap, robots e dados estruturados usam ele. NEXT_PUBLIC_SITE_URL na
// Vercel sobrescreve, se um dia precisar.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://cleancarestetica.com.br").replace(/\/$/, "");

export const CONTATO_PADRAO = {
  whatsapp: "5511912630375",
  whatsappMsg: "Olá! Vim pelo site da Clean Car e gostaria de um orçamento.",
  instagram: "cleancar_est26",
  instagramUrl: "https://www.instagram.com/cleancar_est26/",
  agendamentoUrl: "https://www.gbr-sistemas.tec.br/agendar?e=cleancaresteticaautomotiva",
  codigoIndicacaoUrl: "https://www.gbr-sistemas.tec.br/codigo?e=cleancaresteticaautomotiva",
  googleUrl: "https://www.google.com/maps/place/?q=place_id:ChIJMZEnptZ3zpQR1y0wizguiwM",
  googleReviewUrl: "https://g.page/r/CdctMIs4LosDEBM/review",
  endereco: "Rua Prefeito Sebastião Cascardo, 438 - Jardim Universo, Mogi das Cruzes - SP, 08740-450",
  horarioSemana: "Segunda a sexta: 9h às 18h",
  horarioSabado: "Sábado: 9h às 17h",
  observacaoHorario: "Feriados e feriados prolongados sujeitos a alteração",
  formasPagamento: "",
  /** Leva e traz ligado/desligado no console (Contato e endereço). Desligado:
   * o site esconde toda menção ao serviço, inclusive nos textos cadastrados. */
  levaETraz: false as boolean,
  /** Nota e número de avaliações do Google, digitados no console (prova social no topo do site) */
  notaGoogle: "",
  totalAvaliacoes: "",
  /** ID do Pixel da Meta (Facebook/Instagram). Vazio = pixel desligado. */
  metaPixelId: "",
};

export type Contato = typeof CONTATO_PADRAO & {
  /** Preenchidos pelo GBR SAS quando a integração está ligada (lib/gbr-sync.ts). */
  horarioLinhas?: string[];
  horarioAvisoHoje?: string;
};

const RE_LEVA = /leva[\s-]+e[\s-]+tr[aá][sz]|buscamos (o carro )?e devolvemos/i;

/**
 * Tira as menções ao leva e traz de um texto quando o serviço está desligado.
 * Os textos cadastrados no banco ficam intactos: ao religar no console, tudo
 * volta a aparecer sozinho.
 */
export function filtrarLevaETraz(texto: string, ativo: boolean): string {
  if (ativo || !texto || !RE_LEVA.test(texto)) return texto;
  let t = texto
    // "... depois — ou pedir o leva e traz, conforme o bairro"
    .replace(/\s*[—–,]\s*ou (peça |pedir |combinar )?o leva[\s-]+e[\s-]+tr[aá][sz][^.!?\n]*/gi, "")
    // "Leva e traz, hora marcada..." / "Leva e traz · Hora marcada..."
    .replace(/leva[\s-]+e[\s-]+tr[aá][sz]\s*[,·]\s*/gi, "")
    // "... com hora marcada e leva e traz."
    .replace(/\s+e\s+leva[\s-]+e[\s-]+tr[aá][sz]/gi, "");
  // O que sobrar: tira a frase inteira, mantendo quebras de linha
  t = t
    .split(/(?<=[.!?])(\s+)/)
    .filter((parte) => !RE_LEVA.test(parte))
    .join("")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+(\r?\n)/g, "$1")
    .trim();
  // Primeira letra de cada frase em maiúscula (após cortes no começo)
  return t.replace(/(^|[.!?]\s+)([a-zà-ú])/g, (_, a, b) => a + b.toUpperCase());
}

// 08/10/2026: a agenda online saiu do site — todo "Agendar" abre o WhatsApp
// (o bot agenda) com a mensagem dizendo que veio do site e qual serviço.
export function mensagemAgendar(servico?: string) {
  return servico
    ? `Olá! Vim pelo site da Clean Car e gostaria de agendar: ${servico}.`
    : "Olá! Vim pelo site da Clean Car e gostaria de agendar um horário.";
}
// WhatsApp das páginas de serviço: mensagem geral, sem citar o serviço da
// página (o cliente pode ter chegado ali sem querer aquele serviço).
export function mensagemSaberMais(_servico?: string) {
  return "Olá! Vim pelo site da Clean Car e gostaria de saber mais sobre os serviços e preços.";
}

export function whatsappLink(contato: Contato, mensagem?: string) {
  const texto = encodeURIComponent(mensagem ?? contato.whatsappMsg);
  return `https://wa.me/${contato.whatsapp}?text=${texto}`;
}

/** Serviços que saem com brinde (lixinho descartável + cheirinho de retrovisor) */
export const SERVICOS_COM_BRINDE = ["lavagem-prata", "lavagem-ouro", "higienizacao"];
export const TEXTO_BRINDE = "Brinde: lixinho descartável para o carro e cheirinho para pendurar no retrovisor.";

/**
 * Linhas de horário para mostrar no site. Com a integração do GBR SAS ligada
 * vêm do sistema (lib/gbr-sync.ts → horarioLinhas); sem ela, dos dois campos
 * digitados no console.
 */
export function linhasHorario(contato: Contato): string[] {
  if (contato.horarioLinhas?.length) return contato.horarioLinhas;
  return [contato.horarioSemana, contato.horarioSabado].filter(Boolean);
}
