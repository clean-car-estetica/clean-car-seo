export const CONTATO_PADRAO = {
  whatsapp: "5511912630375",
  whatsappMsg: "Olá! Vim pelo site da Clean Car e gostaria de um orçamento.",
  instagram: "cleancar_est26",
  instagramUrl: "https://www.instagram.com/cleancar_est26/",
  agendamentoUrl: "https://www.gbr-sistemas.tec.br/agendar?e=cleancaresteticaautomotiva",
  googleUrl: "https://www.google.com/maps/place/?q=place_id:ChIJMZEnptZ3zpQR1y0wizguiwM",
  endereco: "Rua Prefeito Sebastião Cascardo, 438 - Jardim Universo, Mogi das Cruzes - SP, 08740-450",
};

export type Contato = typeof CONTATO_PADRAO;

export function whatsappLink(contato: Contato, mensagem?: string) {
  const texto = encodeURIComponent(mensagem ?? contato.whatsappMsg);
  return `https://wa.me/${contato.whatsapp}?text=${texto}`;
}
