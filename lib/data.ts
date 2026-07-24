export type Service = {
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  duracao?: string;
  precoDesde?: number;
};

export type Cidade = {
  slug: string;
  nome: string;
  bairros: string[];
};

export const servicos: Service[] = [
  { slug: "lavagem-bronze", nome: "Lavagem Bronze", resumo: "Lavagem de manutenção para o dia a dia.", descricao: "Lavagem de manutenção pensada para manter o cuidado do seu veículo em dia, feita por nossa equipe especializada com produtos de qualidade.", duracao: "1h30", precoDesde: 85 },
  { slug: "lavagem-prata", nome: "Lavagem Prata", resumo: "Lavagem completa, dentro e fora.", descricao: "Lavagem completa com atenção extra a detalhes externos e internos, ideal para quem quer um cuidado mais aprofundado no dia a dia.", duracao: "2h30", precoDesde: 130 },
  { slug: "lavagem-ouro", nome: "Lavagem Ouro", resumo: "Nossa lavagem premium.", descricao: "Limpeza minuciosa por dentro e por fora, com produtos de alta performance para um acabamento impecável do início ao fim.", duracao: "3h30", precoDesde: 180 },
  { slug: "polimento", nome: "Polimento Automotivo", resumo: "Remove riscos e devolve o brilho.", descricao: "Processo técnico que remove riscos superficiais, marcas de oxidação e imperfeições da pintura, devolvendo o brilho original da lataria.", duracao: "12h", precoDesde: 800 },
  { slug: "vitrificacao", nome: "Vitrificação de Pintura", resumo: "Proteção duradoura com brilho intenso.", descricao: "Aplicação de camada protetora de alta durabilidade sobre a pintura, criando uma barreira contra sol, chuva e sujeira, com brilho intenso e efeito hidrofóbico.", duracao: "1 dia" },
  { slug: "higienizacao", nome: "Higienização Interna", resumo: "Limpeza profunda do interior.", descricao: "Limpeza profunda de todo o interior do veículo — bancos, forração, teto e carpetes — eliminando sujeira, odores e ácaros.", duracao: "8h", precoDesde: 420 },
  { slug: "higienizacao-banco-dianteiro", nome: "Higienização de Banco Dianteiro", resumo: "Limpeza focada nos bancos da frente.", descricao: "Limpeza focada nos bancos dianteiros, ideal para manutenção pontual entre higienizações completas.", duracao: "2h", precoDesde: 98 },
  { slug: "restauracao-de-farol", nome: "Restauração de Farol", resumo: "Faróis transparentes novamente.", descricao: "Remove a opacidade e o amarelado dos faróis, recuperando a transparência e melhorando a segurança e a estética do veículo.", duracao: "4h", precoDesde: 250 },
  { slug: "lavagem-chassi", nome: "Lavagem de Chassi", resumo: "Limpeza da parte inferior do veículo.", descricao: "Limpeza da parte inferior do veículo, removendo lama, graxa e resíduos que aceleram o desgaste e a corrosão.", duracao: "1h", precoDesde: 80 },
  { slug: "lavagem-motor", nome: "Lavagem de Motor", resumo: "Compartimento do motor sem sujeira.", descricao: "Limpeza cuidadosa do compartimento do motor, removendo sujeira e graxa acumulada com segurança para os componentes elétricos.", duracao: "1h30", precoDesde: 120 },
  { slug: "revitalizacao-plastico", nome: "Revitalização de Plástico", resumo: "Plásticos externos como novos.", descricao: "Renova plásticos externos desbotados (para-choques, molduras), devolvendo a cor original e protegendo contra ressecamento.", duracao: "30min", precoDesde: 80 },
  { slug: "cristalizacao-de-vidros", nome: "Cristalização de Vidros", resumo: "Visibilidade melhor em dias de chuva.", descricao: "Tratamento que repele água e sujeira dos vidros, melhorando a visibilidade em dias de chuva e facilitando a limpeza.", duracao: "1h", precoDesde: 110 },
  { slug: "ducha", nome: "Ducha", resumo: "Lavagem rápida entre uma completa e outra.", descricao: "Lavagem rápida e prática para manter o veículo limpo entre uma lavagem completa e outra.", duracao: "30min", precoDesde: 40 },
];

export const cidades: Cidade[] = [
  { slug: "mogi-das-cruzes", nome: "Mogi das Cruzes", bairros: ["Centro", "Vila Oliveira", "Jundiapeba", "Braz Cubas"] },
  { slug: "suzano", nome: "Suzano", bairros: ["Centro", "Palmeiras", "Cidade Boa Vista"] },
  { slug: "poa", nome: "Poá", bairros: ["Centro", "Jardim Silvina"] },
  { slug: "ferraz-de-vasconcelos", nome: "Ferraz de Vasconcelos", bairros: ["Centro", "Jardim Vitória Régia"] },
  { slug: "itaquaquecetuba", nome: "Itaquaquecetuba", bairros: ["Centro", "Jardim Odete"] },
];
