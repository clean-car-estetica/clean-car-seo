export type Service = {
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  duracao?: string;
  precoDesde?: number;
  imagem: string;
  tag?: string;
  ordem: number;
  /** Pontos de fidelidade ganhos ao contratar o serviço */
  pontosFidelidade?: number;
  /** Como as pessoas realmente buscam esse serviço no Google — usado no título/descrição da página, sem mudar o nome comercial */
  termoPopular?: string;
};

export type Cidade = {
  slug: string;
  nome: string;
  bairros: string[];
  sede: boolean; // true só para a cidade onde fica a loja física
};

export const servicos: Service[] = [
  { slug: "lavagem-bronze", nome: "Lavagem Bronze", resumo: "Manutenção do dia a dia, rápida e segura para a pintura.", descricao: "Lavagem de manutenção com espuma densa (snow foam) e shampoo neutro, esfregação com luva de microfibra que não agride o verniz, limpeza das rodas e caixas de roda, pretinho nos pneus e secagem com toalha macia. Por dentro, aspiração de manutenção de carpetes e bancos e limpeza básica. Ideal para manter o carro sempre apresentável.", duracao: "45min", precoDesde: 45, pontosFidelidade: 2, imagem: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80", ordem: 1, termoPopular: "Lavagem de Carro" },
  { slug: "lavagem-prata", nome: "Lavagem Prata", resumo: "Limpeza completa com selante: brilho e água escorrendo na chuva.", descricao: "Pré-lavagem e lavagem com espuma densa e shampoo neutro, esfregação com luva de microfibra, limpeza das rodas e caixas de roda, selante que protege a pintura e faz a água escorrer, pretinho e secagem com toalha macia. Por dentro: aspiração de carpetes, bancos e porta-malas, limpeza de painel, console, portas e volante, vidros internos e sanitizante perfumado. Brinde: saquinho de lixo para o carro e cheirinho. Garantia de 24h.", duracao: "1h30", precoDesde: 85, pontosFidelidade: 5, imagem: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80", ordem: 2, termoPopular: "Lavagem de Carro Completa" },
  { slug: "lavagem-ouro", nome: "Lavagem Ouro", resumo: "Padrão show-room, dentro e fora, com detalhamento a pincel.", descricao: "Nossa lavagem mais completa. Por fora: pré-lavagem, espuma densa e shampoo neutro, detalhamento a pincel de frestas, emblemas e molduras de portas e porta-malas, limpeza profunda das rodas e caixas de roda, selante na pintura, pretinho e secagem com toalha macia. Por dentro: pincel em painel, console, portas, colunas, volante, saídas de ar e pedaleiras, aspiração premium, vidros internos e sanitizante perfumado. Brinde: saquinho de lixo e cheirinho. Garantia de 24h.", duracao: "3h40", precoDesde: 220, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80", tag: "Mais pedido", ordem: 3, termoPopular: "Lavagem de Carro Premium" },
  { slug: "higienizacao", nome: "Higienização Interna VIP", resumo: "Interior limpo de verdade: bancos, teto e carpetes higienizados.", descricao: "Limpeza profunda de todo o interior: bancos, teto, carpetes e porta-malas com esfregação, bactericida e extração, que retiram a sujeira impregnada, ácaros, fungos e odores. Detalhamento a pincel de portas, colunas, volante, saídas de ar e pedaleiras, sanitizante perfumado e brinde. O carro fica o dia todo e sai levemente úmido: deixe os vidros abertos por 12h. Garantia de 72h para mancha ou odor que persistir.", duracao: "8h", precoDesde: 420, pontosFidelidade: 30, imagem: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80", tag: "Saúde da família", ordem: 4, termoPopular: "Higienização de Estofados e Bancos do Carro" },
  { slug: "higienizacao-banco-dianteiro", nome: "Higienização de Banco Dianteiro", resumo: "Banco do motorista ou do passageiro limpo por completo (valor por banco).", descricao: "Higienização profunda de um banco da frente: aspiração detalhada, esfregação com produto de limpeza profunda, bactericida e extração de sujeira e umidade, e sanitizante perfumado. Valor por banco. Sai levemente úmido: deixe os vidros abertos por 12h. Garantia de 72h para mancha ou odor que persistir.", duracao: "2h", precoDesde: 99, pontosFidelidade: 5, imagem: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=800&q=80", ordem: 5, termoPopular: "Limpeza de Banco de Carro" },
  { slug: "higienizacao-banco-traseiro", nome: "Higienização de Banco Traseiro", resumo: "Assento e encostos traseiros limpos por completo.", descricao: "Higienização profunda do banco traseiro: aspiração detalhada, esfregação com produto de limpeza profunda, bactericida e extração, que remove restos de comida, derramamentos e sujeira impregnada, e sanitizante perfumado. Ideal para quem transporta crianças, pets ou passageiros. Sai levemente úmido: deixe os vidros abertos por 12h. Garantia de 72h para mancha ou odor que persistir.", duracao: "2h", precoDesde: 120, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=800&q=80", ordem: 6, termoPopular: "Limpeza de Banco Traseiro do Carro" },
  { slug: "revitalizacao-plastico", nome: "Revitalização de Plásticos Internos", resumo: "Painel, console e portas com a cor de volta e protegidos.", descricao: "Descontaminação que remove gordura e poeira dos plásticos internos, limpeza profunda a pincel com sanitizante bactericida e aplicação de revitalizador com selante: devolve a cor original, protege e deixa acabamento seco ao toque, sem aspecto oleoso. Durabilidade média de 30 a 60 dias, conforme a exposição ao sol.", duracao: "1h", precoDesde: 120, pontosFidelidade: 5, imagem: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80", ordem: 7, termoPopular: "Plástico Interno do Carro Desbotado" },
  { slug: "revitalizacao-plastico-externo", nome: "Revitalização de Plásticos Externos", resumo: "Para-choques, retrovisores e frisos pretos de novo.", descricao: "Descontaminação que remove gordura e poeira dos plásticos externos (para-choques, retrovisores, molduras e frisos), limpeza profunda a pincel e aplicação de revitalizador com selante: devolve o preto original e protege do sol, sem aspecto oleoso. Durabilidade média de 30 a 60 dias, conforme a exposição ao sol.", duracao: "1h", precoDesde: 110, pontosFidelidade: 5, imagem: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80", ordem: 8, termoPopular: "Plástico do Carro Esbranquiçado ou Desbotado" },
  { slug: "restauracao-de-farol", nome: "Restauração de Faróis", resumo: "Faróis transparentes e mais segurança à noite.", descricao: "Descontaminação e isolamento da área, lixamento da lente quando necessário, polímero revitalizador e selante de proteção. A transparência volta e a iluminação melhora à noite, sem trocar a peça. Durabilidade média de 6 a 9 meses, conforme a exposição ao sol. Umidade dentro do farol não é revitalização: é vedação, feita pelo mecânico. Garantia de 48h para manchas que persistirem.", duracao: "2h", precoDesde: 200, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", ordem: 9, termoPopular: "Restauração de Faróis Amarelados" },
  { slug: "cristalizacao-de-vidros", nome: "Cristalização de Vidros", resumo: "Água escorrendo sozinha e visão clara na chuva.", descricao: "Descontaminação dos vidros, remoção de manchas de chuva ácida e marcas d'água, e aplicação de cristalizador com selante: a água escorre sozinha com o carro em movimento e a visão melhora na chuva. Durabilidade média de 3 meses; lavando na Clean Car a partir da Lavagem Prata, pelo menos 6 meses. Feito junto com uma lavagem.", duracao: "2h", precoDesde: 180, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80", ordem: 11, termoPopular: "Remoção de Chuva Ácida do Vidro do Carro" },
  { slug: "hidratacao-de-couro", nome: "Hidratação de Couro", resumo: "Bancos de couro macios e protegidos.", descricao: "Limpeza profunda e descontaminação do couro e aplicação de hidratante específico para couro automotivo: devolve a maciez e ajuda a evitar ressecamento, manchas e rachaduras. Durabilidade média de 3 a 6 meses, conforme a frequência de limpeza e a exposição ao sol ou à umidade.", duracao: "2h", precoDesde: 210, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=800&q=80", ordem: 12, termoPopular: "Hidratação de Banco de Couro do Carro" },
  { slug: "tratamento-anti-odor", nome: "Tratamento Anti-Odor com Ozônio", resumo: "Ozônio nos dutos do ar e na cabine contra o mau cheiro.", descricao: "Tratamento com ozônio que higieniza os dutos do ar-condicionado e o interior, ajudando a eliminar bactérias e odores. Feito junto com uma lavagem. Para cheiro forte e impregnado no tecido, como cigarro ou mofo, o ideal é combinar com a Higienização Interna.", duracao: "1h", precoDesde: 120, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80", ordem: 13, termoPopular: "Tirar Mau Cheiro do Carro" },
  { slug: "enceramento-tecnico", nome: "Enceramento Técnico", resumo: "Brilho espelhado e proteção da pintura por meses.", descricao: "Cera de carnaúba aplicada com politriz e acabamento em microfibra: realça a cor, dá brilho espelhado e protege a pintura contra raios UV, seiva de árvores e fezes de pássaros. Durabilidade média de 3 meses; lavando na Clean Car a partir da Lavagem Prata, pelo menos 6 meses. Precisa de uma Lavagem Prata ou Ouro antes.", duracao: "3h", precoDesde: 195, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80", ordem: 15, termoPopular: "Enceramento de Carro" },
  { slug: "higienizacao-de-estofados", nome: "Higienização de Estofados a Domicílio", resumo: "Sofás, poltronas, colchões e cadeiras limpos na sua casa.", descricao: "Vamos até a sua casa para higienizar sofás, poltronas, colchões e cadeiras: aspiração detalhada, esfregação com produto de limpeza profunda, bactericida e extração, e sanitizante perfumado. Cada peça é diferente, por isso o valor é passado depois de uma avaliação gratuita pelas fotos no WhatsApp. Mantenha o ambiente arejado depois. Garantia de 72h para odor ou mancha que persistir, exceto manchas que já tingiram o tecido.", pontosFidelidade: 10, imagem: "", tag: "A domicílio", ordem: 16, termoPopular: "Higienização de Sofá e Estofados" },

];

/** Avisos gerais exibidos junto dos valores e tempos de todos os serviços */
export const OBSERVACOES_SERVICOS: string[] = [
  "Lavagens, higienizações e cristalização de vidros: valores para porte médio (hatch e sedan). SUV, picape e veículos de grande porte têm acréscimo de 25% a 30%, conforme avaliação prévia. Os demais serviços têm valor fixo.",
  "O tempo pode variar conforme o grau de sujidade e o detalhamento necessário.",
  "Avaliação visual prévia gratuita.",
];

// Serviços PAUSADOS (vão voltar): o proxy redireciona as páginas para /precos
// com 307 e eles saem do sitemap e dos links. Para reativar: tirar daqui e
// marcar o serviço como ativo no banco do site. (16/10/2026: até o Glauber testar.)
export const SERVICOS_PAUSADOS: string[] = ["lavagem-motor", "lavagem-pesada-de-rodas"];

// Serviços com acréscimo de 25% a 30% para SUV, picape e veículos grandes
// (16/10/2026: lavagens, higienizações e vidros — muitos têm teto solar).
// Os demais têm valor fixo, qualquer porte.
export const SERVICOS_COM_ACRESCIMO_PORTE: string[] = [
  "lavagem-bronze", "lavagem-prata", "lavagem-ouro", "higienizacao",
  "higienizacao-banco-dianteiro", "higienizacao-banco-traseiro", "cristalizacao-de-vidros",
];

// Serviços que ficam só com a página geral (/servicos/slug) — sem páginas
// locais por cidade/bairro (decisão de não empurrar certos serviços via SEO).
export const SERVICOS_SEM_PAGINAS_LOCAIS: string[] = ["higienizacao-de-estofados"];

// Serviços feitos na casa do cliente (não na loja): sem preço fixo, valor
// depois de avaliação prévia pelas fotos (15/10/2026).
export const SERVICOS_DOMICILIO: string[] = ["higienizacao-de-estofados"];

export const cidades: Cidade[] = [
  {
    slug: "mogi-das-cruzes",
    nome: "Mogi das Cruzes",
    bairros: [
      "Centro", "Alto do Ipiranga", "Vila Oliveira", "Mogilar", "Socorro",
      "Jardim das Academias", "Chácara Jafet", "Vila Industrial", "Vila Rubens",
      "Vila Mobilian", "Nova Mogilar", "Loteamento Mogilar", "Jardim Rodeio",
      "Vila Nova Socorro", "Vila Humaitá", "Vila Partenio", "Cézar de Souza",
      "Jardim Rio Branco", "Vila Suíssa", "Jardim Bela Vista",
      "Conjunto Habitacional Pedro Aly", "Jardim São Pedro", "Vila Nova Cintra",
      "Brás Cubas", "Vila Cintra", "Jardim Aeroporto III", "Jardim Esperança",
      "Vila Lavínia", "Vila Jundiaí", "Itapety",
    ],
    sede: true,
  },
  { slug: "suzano", nome: "Suzano", bairros: ["Centro", "Palmeiras", "Cidade Boa Vista"], sede: false },
  { slug: "poa", nome: "Poá", bairros: ["Centro", "Jardim Silvina"], sede: false },
  { slug: "ferraz-de-vasconcelos", nome: "Ferraz de Vasconcelos", bairros: ["Centro", "Jardim Vitória Régia"], sede: false },
  { slug: "itaquaquecetuba", nome: "Itaquaquecetuba", bairros: ["Centro", "Jardim Odete"], sede: false },
  // Reserva caso o banco não responda: Guararema tem página local própria
  { slug: "guararema", nome: "Guararema", bairros: ["Centro", "Itaepó", "Nogueira", "Freguesia da Escada", "Lambari"], sede: false },
];
