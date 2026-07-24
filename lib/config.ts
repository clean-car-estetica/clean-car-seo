export const CONTATO = {
  whatsapp: "5511912630375",
  whatsappMsg: "Olá! Vim pelo site da Clean Car e gostaria de um orçamento.",
  instagram: "cleancar_est26",
  instagramUrl: "https://www.instagram.com/cleancar_est26/",
  agendamentoUrl: "https://www.gbr-sistemas.tec.br/agendar?e=cleancaresteticaautomotiva",
  googleUrl:
    "https://www.google.com/search?q=cleancar+estetica",
};

export function whatsappLink(mensagem?: string) {
  const texto = encodeURIComponent(mensagem ?? CONTATO.whatsappMsg);
  return `https://wa.me/${CONTATO.whatsapp}?text=${texto}`;
}
