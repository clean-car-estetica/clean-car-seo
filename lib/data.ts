export type Service = {
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  duracao?: string;
  precoDesde?: number;
  imagem: string;
  tag?: string;
};

export type Cidade = {
  slug: string;
  nome: string;
  bairros: string[];
  sede: boolean; // true só para a cidade onde fica a loja física
};

export const servicos: Service[] = [
  { slug: "lavagem-bronze", nome: "Lavagem Bronze", resumo: "Manutenção rápida sem abrir mão do cuidado.", descricao: "Nossa lavagem de manutenção começa com pré-lavagem para soltar a sujeira mais grossa, seguida de shampoo neutro aplicado com luvas próprias para lavagem automotiva — isso evita os microrriscos que uma lavagem malfeita costuma deixar na pintura.", duracao: "1h30", precoDesde: 85, imagem: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80" },
  { slug: "lavagem-prata", nome: "Lavagem Prata", resumo: "Um passo além da manutenção — dentro e fora.", descricao: "Além de toda a técnica da lavagem externa (pré-lavagem, shampoo neutro, luvas próprias), cuidamos também do interior, com atenção a detalhes que a lavagem básica não cobre. Ideal pra quem já tem uma rotina de cuidado com o carro.", duracao: "2h30", precoDesde: 130, imagem: "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=800&q=80" },
  { slug: "lavagem-ouro", nome: "Lavagem Ouro", resumo: "Nossa lavagem mais completa.", descricao: "Pré-lavagem, shampoo neutro, detalhamento externo caprichado e higienização interna com produto sanitizante — tudo com produtos Vonixx. É a experiência completa da Clean Car, pensada pra quem quer o carro impecável por dentro e por fora.", duracao: "3h30", precoDesde: 180, imagem: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80", tag: "Mais pedido" },
  { slug: "polimento", nome: "Polimento Técnico", resumo: "Corrige riscos e devolve o brilho, com segurança.", descricao: "Medimos a espessura da tinta antes de começar — isso garante que o polimento remove só o necessário pra corrigir riscos, oxidação e opacidade, sem comprometer a vida útil do verniz. Técnica, não adivinhação.", duracao: "12h", precoDesde: 450, imagem: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=800&q=80", tag: "Espelhamento" },
  { slug: "vitrificacao", nome: "Vitrificação 9H", resumo: "Proteção cerâmica Vonixx, brilho de outro nível.", descricao: "Aplicamos a linha de vitrificação Vonixx, hoje uma das químicas top de linha do mercado, criando uma camada cerâmica que protege contra sol, chuva e sujeira por até 3 anos — com um efeito hidrofóbico e um brilho que chama atenção.", duracao: "1 dia", precoDesde: 650, imagem: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80", tag: "Até 3 anos de proteção" },
  { slug: "higienizacao", nome: "Higienização Interna VIP", resumo: "Saúde e conforto pra você e pro seu carro.", descricao: "Higienização completa do interior com produto sanitizante em bancos, forração, teto e carpetes — elimina sujeira, odores e ácaros. Não é só limpeza: é cuidado com a saúde de quem usa o carro todos os dias.", duracao: "8h", precoDesde: 420, imagem: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=800&q=80", tag: "Saúde da família" },
  { slug: "higienizacao-banco-dianteiro", nome: "Higienização de Banco Dianteiro", resumo: "Manutenção pontual, com o mesmo cuidado sanitizante.", descricao: "Limpeza focada nos bancos dianteiros com produto sanitizante — ótima opção de manutenção entre uma higienização completa e outra, sem perder o padrão de qualidade.", duracao: "2h", precoDesde: 98, imagem: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?auto=format&fit=crop&w=800&q=80" },
  { slug: "restauracao-de-farol", nome: "Restauração de Farol", resumo: "Faróis transparentes e mais segurança à noite.", descricao: "Removemos a opacidade e o amarelado dos faróis, recuperando a transparência original — além de deixar o carro mais bonito, melhora de verdade a iluminação e a segurança nas ruas à noite.", duracao: "4h", precoDesde: 250, imagem: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" },
  { slug: "lavagem-chassi", nome: "Lavagem de Chassi", resumo: "O que protege o carro por baixo também importa.", descricao: "Limpeza técnica da parte inferior do veículo, removendo lama, graxa e resíduos que, se deixados, aceleram a corrosão da estrutura — um cuidado que não aparece à primeira vista, mas faz diferença na durabilidade do carro.", duracao: "1h", precoDesde: 80, imagem: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=800&q=80" },
  { slug: "lavagem-motor", nome: "Lavagem de Motor", resumo: "Compartimento do motor limpo, com segurança.", descricao: "Limpeza cuidadosa do compartimento do motor, removendo sujeira e graxa acumulada com produtos e técnica que preservam os componentes elétricos — nada de água em qualquer lugar, é tudo pensado.", duracao: "1h30", precoDesde: 120, imagem: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80" },
  { slug: "revitalizacao-plastico", nome: "Revitalização de Plástico", resumo: "Plásticos externos de volta à cor original.", descricao: "Renovamos plásticos externos desbotados pelo sol (para-choques, molduras, retrovisores), devolvendo a cor preta original e protegendo contra o ressecamento — o detalhe que muda a aparência do carro de longe.", duracao: "30min", precoDesde: 80, imagem: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80" },
  { slug: "cristalizacao-de-vidros", nome: "Cristalização de Vidros", resumo: "Mais segurança pra dirigir na chuva.", descricao: "Tratamento hidrofóbico que repele água e sujeira dos vidros — melhora a visibilidade em dias de chuva, reduz o uso do limpador e facilita a limpeza no dia a dia.", duracao: "1h", precoDesde: 110, imagem: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80" },
  { slug: "ducha", nome: "Ducha", resumo: "Lavagem rápida pra manter o padrão entre uma completa e outra.", descricao: "Uma lavagem rápida e prática, pensada pra quem já faz a manutenção completa com regularidade e só precisa tirar a poeira do dia a dia.", duracao: "30min", precoDesde: 40, imagem: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&w=800&q=80" },
];

export const cidades: Cidade[] = [
  { slug: "mogi-das-cruzes", nome: "Mogi das Cruzes", bairros: ["Centro", "Vila Oliveira", "Jundiapeba", "Braz Cubas"], sede: true },
  { slug: "suzano", nome: "Suzano", bairros: ["Centro", "Palmeiras", "Cidade Boa Vista"], sede: false },
  { slug: "poa", nome: "Poá", bairros: ["Centro", "Jardim Silvina"], sede: false },
  { slug: "ferraz-de-vasconcelos", nome: "Ferraz de Vasconcelos", bairros: ["Centro", "Jardim Vitória Régia"], sede: false },
  { slug: "itaquaquecetuba", nome: "Itaquaquecetuba", bairros: ["Centro", "Jardim Odete"], sede: false },
];
