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
  { slug: "lavagem-bronze", nome: "Lavagem Bronze", resumo: "Manutenção essencial, ágil e econômica.", descricao: "Cuidado ágil e econômico para manter o carro conservado no dia a dia: ducha externa, produto de limpeza técnica, luva especial que não agride o verniz, secagem com microfibra, limpeza de rodas e aspiração básica. Ideal para manutenção frequente.", duracao: "45min", precoDesde: 45, pontosFidelidade: 2, imagem: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80", ordem: 1, termoPopular: "Lavagem de Carro" },
  { slug: "lavagem-prata", nome: "Lavagem Prata", resumo: "Limpeza com proteção: brilho e toque aveludado.", descricao: "Pré-lavagem com espuma densa que não arranha, lavagem manual com shampoo neutro e enceramento técnico com Tokfinal Vonixx: brilho profundo, toque aveludado e proteção que faz a água escorrer. Inclui aspiração completa, limpeza bactericida e vidros internos sem manchas.", duracao: "1h30", precoDesde: 85, pontosFidelidade: 5, imagem: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80", ordem: 2, termoPopular: "Lavagem de Carro Completa" },
  { slug: "lavagem-ouro", nome: "Lavagem Ouro", resumo: "Padrão show-room, dentro e fora.", descricao: "Pré-lavagem técnica e lavagem de alta lubrificação, com atenção aos detalhes em frestas, emblemas e molduras. Enceramento técnico com máquina (politriz), que espalha a cera de forma uniforme, e acabamento com microfibra. Aspiração premium, limpeza de saídas de ar e botões, interior completo, vidros, acabamento premium e aromatização. Aspecto de carro novo.", duracao: "3h40", precoDesde: 250, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80", tag: "Mais pedido", ordem: 3, termoPopular: "Lavagem de Carro Premium" },
  { slug: "higienizacao", nome: "Higienização Interna VIP", resumo: "Saúde e renovação para o interior do carro.", descricao: "Limpeza profunda que retira a sujeira impregnada em estofados, teto, carpetes e porta-malas. Higienização de plásticos, volante e pedais e sanitização do ar-condicionado com troca de filtro. Elimina ácaros, fungos, bactérias e odores: ar mais limpo para a sua família.", duracao: "8h", precoDesde: 380, pontosFidelidade: 30, imagem: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80", tag: "Saúde da família", ordem: 4, termoPopular: "Higienização de Estofados e Bancos do Carro" },
  { slug: "higienizacao-banco-dianteiro", nome: "Higienização de Banco Dianteiro", resumo: "Solução rápida para manchas e sujeira nos bancos da frente (valor por banco).", descricao: "Limpador bactericida de ação profunda, escovação técnica que não danifica tecido nem couro e extração mecânica de sujeira e umidade. Valor por banco.", duracao: "2h", precoDesde: 99, pontosFidelidade: 5, imagem: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=800&q=80", ordem: 5, termoPopular: "Limpeza de Banco de Carro" },
  { slug: "higienizacao-banco-traseiro", nome: "Higienização de Banco Traseiro", resumo: "Assento e encostos traseiros limpos por completo.", descricao: "Extração profunda que remove restos de alimentos, derramamentos e sujeira impregnada, elimina microrganismos e renova tecido ou couro. Ideal para quem transporta crianças, pets ou passageiros.", duracao: "2h", precoDesde: 120, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=800&q=80", ordem: 6, termoPopular: "Limpeza de Banco Traseiro do Carro" },
  { slug: "revitalizacao-plastico", nome: "Revitalização de Plásticos", resumo: "Plásticos internos e externos de volta à cor original.", descricao: "Descontaminação profunda e aplicação de restaurador técnico. Devolve a cor ressecada pelo sol, protege contra raios UV e deixa o acabamento seco ao toque, sem atrair poeira. Aparência de peça nova, sem aspecto oleoso ou grudento.", duracao: "1h", precoDesde: 99, pontosFidelidade: 5, imagem: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80", ordem: 7, termoPopular: "Plástico do Carro Esbranquiçado ou Desbotado" },
  { slug: "restauracao-de-farol", nome: "Restauração de Faróis", resumo: "Faróis transparentes e mais segurança à noite.", descricao: "Removemos o amarelado e a opacidade dos faróis com lixamento técnico e acabamento de alta precisão, e finalizamos com uma proteção contra raios UV específica para faróis. A transparência volta, a iluminação alcança mais longe e você dirige com mais segurança à noite. Evita a troca de peças.", duracao: "2h", precoDesde: 200, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80", ordem: 8, termoPopular: "Restauração de Faróis Amarelados" },
  { slug: "lavagem-motor", nome: "Lavagem de Motor a Seco", resumo: "Motor limpo e protegido, sem jato de água.", descricao: "Limpeza segura com desengraxante de alta performance e pincéis de detalhamento, sem jato de água sob pressão, protegendo fiação e componentes eletrônicos. Um verniz protetor previne a oxidação e hidrata as mangueiras, e a limpeza facilita a detecção de vazamentos.", duracao: "2h", precoDesde: 125, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80", ordem: 9, termoPopular: "Lavagem de Motor de Carro" },
  { slug: "cristalizacao-de-vidros", nome: "Cristalização de Vidros", resumo: "Visibilidade máxima no sol e na chuva.", descricao: "Remoção de manchas de chuva ácida, marcas d'água e resíduos, seguida da aplicação de cristalizador repelente de longa duração. Com o carro em movimento a água escorre sozinha, dispensando o uso constante do limpador. Visão clara, sem reflexos.", duracao: "2h", precoDesde: 180, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80", ordem: 10, termoPopular: "Remoção de Chuva Ácida do Vidro do Carro" },
  { slug: "hidratacao-de-couro", nome: "Hidratação de Couro", resumo: "Bancos de couro macios e protegidos.", descricao: "Limpeza profunda com produto específico, condicionamento que devolve a maciez e uma camada protetora contra ressecamento, manchas e desbotamento. Evita rachaduras e mantém o couro com aspecto de novo por muito mais tempo.", duracao: "2h", precoDesde: 210, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=800&q=80", ordem: 11, termoPopular: "Hidratação de Banco de Couro do Carro" },
  { slug: "tratamento-anti-odor", nome: "Tratamento Anti-Odor / Purificação", resumo: "Acaba com o mau cheiro na origem.", descricao: "Ação profunda que ataca a causa do mau cheiro, seja cigarro, mofo, derramamentos ou animais. Purifica o ar interno e as superfícies sem deixar resíduos e restaura o ambiente da cabine em pouco tempo.", duracao: "1h", precoDesde: 120, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80", ordem: 12, termoPopular: "Tirar Mau Cheiro do Carro" },
  { slug: "protecao-de-rodas", nome: "Proteção de Rodas — Jogo Completo", resumo: "Rodas brilhantes e protegidas por meses.", descricao: "Limpeza profunda dos resíduos de freio e da sujeira acumulada, seguida da aplicação de selante específico para rodas. Facilita as lavagens futuras e previne oxidação e corrosão.", duracao: "2h", precoDesde: 150, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80", ordem: 13, termoPopular: "Proteção de Rodas do Carro" },
  { slug: "enceramento-tecnico", nome: "Enceramento Técnico", resumo: "Brilho espelhado e proteção entre as lavagens.", descricao: "Aplicação profissional da cera Tokfinal Vonixx com máquina (politriz), que espalha a cera de forma uniforme, e acabamento com pano de microfibra. Brilho espelhado, proteção de carnaúba, toque aveludado e efeito que faz a água escorrer. Realça a cor e protege a pintura entre as lavagens.", duracao: "3h", precoDesde: 195, pontosFidelidade: 10, imagem: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80", ordem: 14, termoPopular: "Enceramento de Carro" },
];

/** Avisos gerais exibidos junto dos valores e tempos de todos os serviços */
export const OBSERVACOES_SERVICOS: string[] = [
  "Valores e tempos referem-se a veículos de porte médio (hatch e sedan). SUV, picape e veículos de grande porte: acréscimo de 25% a 30%, conforme avaliação prévia.",
  "O tempo pode variar conforme o grau de sujidade e o detalhamento necessário.",
  "Avaliação visual prévia gratuita.",
];

// Serviços que ficam só com a página geral (/servicos/slug) — sem páginas
// locais por cidade/bairro (decisão de não empurrar certos serviços via SEO).
export const SERVICOS_SEM_PAGINAS_LOCAIS: string[] = [];

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
];
