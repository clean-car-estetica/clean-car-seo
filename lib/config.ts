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
};

export type Contato = typeof CONTATO_PADRAO;

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
