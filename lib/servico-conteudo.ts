// Conteúdo próprio de cada página de serviço (08/10/2026): como é feito,
// para quem é e perguntas que as pessoas fazem antes de contratar.
// Baseado nas descrições oficiais dos serviços; preço e tempo vêm do banco.
//
// 16/10/2026: reescrito a partir da planilha de processos do Glauber (a mesma
// que alimenta a IA do SAS). Regras: nada de nome de produto (só "produtos
// Vonixx" como marca), nenhuma etapa que a loja não faz, durabilidade e
// garantia iguais às do SAS.

export type ConteudoServico = {
  paraQuem: string;
  etapas: { titulo: string; texto: string }[];
  perguntas: { pergunta: string; resposta: string }[];
};

const GARANTIA_HIGIENIZACAO =
  "Sim, 72 horas: se uma mancha ou odor que já existia persistir, é só avisar com foto que refazemos aquela área. Não cobre sujeira nova, mancha que já tingiu o tecido nem odor por falta de ventilação.";

export const CONTEUDO_SERVICO: Record<string, ConteudoServico> = {
  "lavagem-bronze": {
    paraQuem:
      "Para quem quer tirar a sujeira de fora do carro rapidinho, em até 45 minutos, sem arriscar a pintura com escova ou pano reaproveitado. É só por fora: para limpar por dentro também, a lavagem certa é a Prata.",
    etapas: [
      { titulo: "Espuma densa", texto: "Lavagem com snow foam e shampoo neutro, que soltam a sujeira sem agredir o verniz." },
      { titulo: "Luva de microfibra", texto: "Esfregação com luva própria, que não deixa riscos finos na pintura." },
      { titulo: "Rodas e pneus", texto: "Limpeza das rodas e caixas de roda e pretinho nos pneus." },
      { titulo: "Secagem", texto: "Secagem com toalha macia. Não inclui aspiração nem limpeza interna (isso começa na Lavagem Prata)." },
    ],
    perguntas: [
      { pergunta: "A Lavagem Bronze limpa por dentro?", resposta: "Não. A Bronze é só externa, pronta em até 45 minutos. Para aspiração e limpeza interna, escolha a Lavagem Prata, que cuida do carro por dentro e por fora." },
      { pergunta: "Qual a diferença para um lava-rápido comum?", resposta: "O cuidado com a pintura: espuma densa, luva de microfibra e toalha macia, sem escova de nylon nem pano reaproveitado, que são o que causa os riscos finos no verniz." },
      { pergunta: "De quanto em quanto tempo devo lavar?", resposta: "Para quem usa o carro todo dia, a cada 1 ou 2 semanas. Quem lava com frequência economiza com os planos mensais." },
      { pergunta: "Preciso agendar?", resposta: "Sim, trabalhamos com hora marcada para você não esperar. O agendamento é rápido pelo WhatsApp." },
    ],
  },
  "lavagem-prata": {
    paraQuem:
      "Para quem quer o carro limpo e protegido: selante na pintura, água escorrendo na chuva e interior bem cuidado. É a nossa lavagem mais procurada.",
    etapas: [
      { titulo: "Pré-lavagem com espuma", texto: "A espuma densa solta a sujeira antes do contato com a pintura, o que evita riscos." },
      { titulo: "Lavagem manual", texto: "Shampoo neutro e luva de microfibra, mais limpeza das rodas e caixas de roda." },
      { titulo: "Selante na pintura", texto: "Protege e faz a água escorrer, ajudando a lavagem seguinte." },
      { titulo: "Interior", texto: "Aspiração de bancos, carpetes e porta-malas, painel, console, portas, volante e vidros internos, com sanitizante perfumado." },
    ],
    perguntas: [
      { pergunta: "Tem brinde?", resposta: "Sim: saquinho de lixo para o carro e um cheirinho." },
      { pergunta: "Tem garantia?", resposta: "Sim, 24 horas para qualquer sujeira que tenha ficado da lavagem." },
      { pergunta: "Posso esperar no local?", resposta: "Pode. A lavagem leva cerca de 1h30. Se preferir, deixe o carro e busque depois." },
    ],
  },
  "lavagem-ouro": {
    paraQuem:
      "Para quem quer o carro impecável por dentro e por fora: antes de uma viagem, de um evento ou de vender o carro.",
    etapas: [
      { titulo: "Pré-lavagem técnica", texto: "Remoção da sujeira pesada sem atrito, inclusive nas rodas e caixas de roda." },
      { titulo: "Detalhamento a pincel", texto: "Frestas, emblemas e molduras de portas e porta-malas limpos um a um." },
      { titulo: "Selante e acabamento", texto: "Selante na pintura, pretinho nos pneus e secagem com toalha macia." },
      { titulo: "Interior detalhado", texto: "Pincel em painel, console, portas, colunas, volante, saídas de ar e pedaleiras, aspiração premium e vidros internos." },
    ],
    perguntas: [
      { pergunta: "Por que demora mais de 3 horas?", resposta: "Porque é uma lavagem detalhada: cada fresta, emblema e moldura é limpa à mão, por dentro e por fora." },
      { pergunta: "Tem brinde e garantia?", resposta: "Sim: saquinho de lixo para o carro e cheirinho, e garantia de 24 horas para qualquer sujeira que tenha ficado." },
      { pergunta: "Inclui higienização dos bancos?", resposta: "Não. A Ouro faz aspiração premium e limpeza detalhada; a limpeza profunda de bancos, teto e carpetes é a Higienização Interna." },
    ],
  },
  higienizacao: {
    paraQuem:
      "Para carros com bancos encardidos, cheiro de mofo ou de cigarro, e para quem anda com crianças, pets ou tem alergia e rinite.",
    etapas: [
      { titulo: "Aspiração detalhada", texto: "Bancos, carpetes e porta-malas aspirados antes da limpeza profunda." },
      { titulo: "Extração profunda", texto: "Bancos, teto, carpetes e porta-malas com esfregação, bactericida e extratora, que puxa a sujeira de dentro da espuma." },
      { titulo: "Detalhamento a pincel", texto: "Portas, colunas, volante, saídas de ar e pedaleiras." },
      { titulo: "Acabamento", texto: "Sanitizante perfumado, proteção descartável no volante, câmbio e pedaleiras, e brinde." },
    ],
    perguntas: [
      { pergunta: "O banco fica molhado?", resposta: "Ele sai levemente úmido. Deixe os vidros abertos por pelo menos 12 horas para secar por completo, sem odor nem mofo." },
      { pergunta: "Tem garantia?", resposta: GARANTIA_HIGIENIZACAO },
      { pergunta: "Por que o carro fica o dia todo?", resposta: "É um trabalho detalhado em todas as superfícies internas, e o tempo de secagem faz parte." },
    ],
  },
  "higienizacao-banco-dianteiro": {
    paraQuem:
      "Para quem tem mancha ou sujeira só nos bancos da frente, principalmente motoristas de aplicativo, que passam o dia sentados no mesmo banco.",
    etapas: [
      { titulo: "Aspiração detalhada", texto: "Tira a sujeira solta e os resíduos das costuras." },
      { titulo: "Limpeza profunda", texto: "Esfregação com produto de limpeza profunda e bactericida." },
      { titulo: "Extração", texto: "A extratora tira a sujeira e a umidade de dentro da espuma." },
    ],
    perguntas: [
      { pergunta: "O preço é por banco?", resposta: "Sim, o valor é por banco (motorista ou passageiro)." },
      { pergunta: "Toda mancha sai?", resposta: "A grande maioria sai. Manchas muito antigas ou que já tingiram o tecido podem clarear sem sumir por completo. Mande uma foto pelo WhatsApp que avaliamos antes." },
      { pergunta: "Tem garantia?", resposta: GARANTIA_HIGIENIZACAO },
    ],
  },
  "higienizacao-banco-traseiro": {
    paraQuem: "Para quem transporta crianças, pets ou passageiros e tem restos de comida, derramamentos ou sujeira impregnada no banco de trás.",
    etapas: [
      { titulo: "Aspiração detalhada", texto: "Inclusive das frestas, onde ficam migalhas e pelos." },
      { titulo: "Limpeza profunda", texto: "Esfregação com produto de limpeza profunda e bactericida." },
      { titulo: "Extração", texto: "Assento e encostos com extratora, que tira a sujeira e a umidade." },
    ],
    perguntas: [
      { pergunta: "Serve para cadeirinha de criança?", resposta: "O serviço é para o banco do carro. Se quiser incluir a cadeirinha, consulte pelo WhatsApp." },
      { pergunta: "O banco fica molhado?", resposta: "Sai levemente úmido. Deixe os vidros abertos por pelo menos 12 horas para secar por completo." },
      { pergunta: "Tem garantia?", resposta: GARANTIA_HIGIENIZACAO },
    ],
  },
  "revitalizacao-plastico": {
    paraQuem: "Para painel, console e portas com plástico esbranquiçado, manchado ou ressecado.",
    etapas: [
      { titulo: "Descontaminação", texto: "Remove gordura, poeira e restos de produtos antigos." },
      { titulo: "Limpeza a pincel", texto: "Limpeza profunda com sanitizante bactericida, inclusive nos cantos." },
      { titulo: "Revitalizador com selante", texto: "Devolve a cor original e protege, com acabamento seco ao toque." },
    ],
    perguntas: [
      { pergunta: "Quanto tempo dura?", resposta: "Em média de 30 a 60 dias, conforme o tempo que o carro fica no sol." },
      { pergunta: "Tem algum cuidado depois?", resposta: "Deixe o carro protegido do sol por pelo menos 12 horas e não aplique outros produtos por cima." },
      { pergunta: "E os plásticos de fora?", resposta: "A revitalização dos plásticos externos (para-choques, retrovisores e frisos) é um serviço separado." },
    ],
  },
  "revitalizacao-plastico-externo": {
    paraQuem: "Para para-choques, retrovisores, molduras e frisos desbotados ou esbranquiçados pelo sol.",
    etapas: [
      { titulo: "Descontaminação", texto: "Remove gordura, poeira e restos de produtos antigos dos poros do plástico." },
      { titulo: "Limpeza a pincel", texto: "Limpeza profunda, inclusive nos cantos e encaixes." },
      { titulo: "Revitalizador com selante", texto: "Devolve o preto original e protege do sol, sem aspecto oleoso." },
    ],
    perguntas: [
      { pergunta: "É igual ao pretinho de posto?", resposta: "Não. O pretinho comum é oleoso, gruda poeira e sai na primeira chuva. O revitalizador com selante fica seco ao toque." },
      { pergunta: "Quanto tempo dura?", resposta: "Em média de 30 a 60 dias, conforme o tempo que o carro fica no sol." },
      { pergunta: "Tem algum cuidado depois?", resposta: "Deixe o carro protegido do sol por pelo menos 12 horas e não aplique outros produtos por cima." },
    ],
  },
  "restauracao-de-farol": {
    paraQuem: "Para faróis amarelados ou opacos, que deixam o carro com aparência velha e iluminam menos à noite.",
    etapas: [
      { titulo: "Descontaminação e proteção", texto: "Limpamos o farol e isolamos a área em volta." },
      { titulo: "Lixamento", texto: "Quando necessário, remove a camada oxidada da lente." },
      { titulo: "Revitalização", texto: "Polímero revitalizador que devolve a transparência." },
      { titulo: "Selante", texto: "Proteção final, que faz o resultado durar." },
    ],
    perguntas: [
      { pergunta: "Quanto tempo dura?", resposta: "Em média de 6 a 9 meses, conforme o tempo que o carro fica no sol." },
      { pergunta: "Resolve farol embaçado por dentro?", resposta: "Não. Umidade dentro do farol não é revitalização: é vedação, feita pelo mecânico. A restauração trata a parte externa da lente." },
      { pergunta: "Tem algum cuidado depois?", resposta: "Não deixe no sol por 12 horas e não aplique produtos por cima. A garantia é de 48 horas para manchas que persistirem." },
    ],
  },
  "lavagem-motor": {
    paraQuem: "Para quem quer o cofre do motor limpo e bem conservado, sem risco para a parte elétrica.",
    etapas: [
      { titulo: "Desengraxante", texto: "Remove a gordura e a sujeira da superfície." },
      { titulo: "Pincel e pano", texto: "Limpeza a seco, sem jato de água sob pressão." },
      { titulo: "Acabamento", texto: "Proteção que renova a aparência de mangueiras e plásticos." },
    ],
    perguntas: [
      { pergunta: "Lavar motor estraga o carro?", resposta: "O que pode causar problema é jato de água forte na parte elétrica. Por isso a nossa limpeza é a seco, com produto e pincel." },
      { pergunta: "Serve para achar vazamento?", resposta: "É um serviço de estética, não de diagnóstico. Para localizar vazamentos, o indicado é o seu mecânico. Com o motor limpo, fica mais fácil perceber um vazamento novo nos dias seguintes." },
      { pergunta: "Preciso fazer junto com uma lavagem?", resposta: "Sim, é um serviço complementar, feito junto com uma lavagem." },
    ],
  },
  "cristalizacao-de-vidros": {
    paraQuem: "Para quem pega estrada ou chuva com frequência e quer enxergar melhor, com menos uso do limpador.",
    etapas: [
      { titulo: "Descontaminação", texto: "Tira marcas de chuva ácida, de água e resíduos do vidro." },
      { titulo: "Cristalizador", texto: "Faz a água escorrer sozinha com o carro em movimento." },
      { titulo: "Selante", texto: "Proteção final que ajuda o efeito a durar." },
    ],
    perguntas: [
      { pergunta: "Quanto tempo dura?", resposta: "Em média 3 meses, conforme as lavagens e a chuva. Lavando na Clean Car a partir da Lavagem Prata, dura pelo menos 6 meses." },
      { pergunta: "Precisa parar de usar o limpador?", resposta: "Não precisa parar, mas com o carro em movimento a água escorre sozinha e você usa bem menos." },
      { pergunta: "Preciso fazer junto com uma lavagem?", resposta: "Sim, é um serviço complementar, feito junto com uma lavagem." },
    ],
  },
  "hidratacao-de-couro": {
    paraQuem: "Para bancos de couro ressecados, duros, desbotados ou com início de rachaduras.",
    etapas: [
      { titulo: "Aspiração", texto: "Das áreas de couro que serão tratadas." },
      { titulo: "Limpeza profunda", texto: "Limpeza e descontaminação, que tiram a sujeira dos poros." },
      { titulo: "Hidratação", texto: "Hidratante específico para couro automotivo, que devolve a maciez." },
    ],
    perguntas: [
      { pergunta: "Quanto tempo dura?", resposta: "Em média de 3 a 6 meses, conforme a frequência de limpeza e o tempo no sol ou na umidade." },
      { pergunta: "Recupera rachadura?", resposta: "A hidratação evita que piorem. Rachaduras abertas ou couro rasgado precisam de reparo de estofaria." },
      { pergunta: "Quanto tempo leva?", resposta: "Cerca de 2 horas." },
    ],
  },
  "tratamento-anti-odor": {
    paraQuem: "Para carros com cheiro no ar-condicionado ou na cabine que não sai com a limpeza comum.",
    etapas: [
      { titulo: "Ozônio nos dutos", texto: "Higieniza os dutos do ar-condicionado, onde o cheiro costuma se acumular." },
      { titulo: "Ozônio na cabine", texto: "Ajuda a eliminar bactérias e odores do interior." },
    ],
    perguntas: [
      { pergunta: "É só um perfume?", resposta: "Não. O ozônio age sobre bactérias e odores. Perfume só disfarça por alguns dias." },
      { pergunta: "Resolve cheiro de cigarro ou mofo?", resposta: "Para cheiro forte e impregnado no tecido, o ideal é combinar com a Higienização Interna. Mande uma mensagem que avaliamos o seu caso." },
      { pergunta: "Preciso fazer junto com uma lavagem?", resposta: "Sim, é um serviço complementar, feito junto com uma lavagem." },
    ],
  },
  "lavagem-pesada-de-rodas": {
    paraQuem: "Para rodas encardidas pelo pó de freio e caixas de roda com barro e terra acumulados.",
    etapas: [
      { titulo: "Espuma e produtos específicos", texto: "Lavagem detalhada das caixas de roda, que remove barro e terra." },
      { titulo: "Descontaminação das rodas", texto: "Remove o pó de freio impregnado, sem desmontar as rodas." },
      { titulo: "Acabamento", texto: "Revitalizador nos plásticos da caixa de roda e pretinho com proteção UV nos pneus." },
    ],
    perguntas: [
      { pergunta: "Precisa tirar as rodas?", resposta: "Não, a limpeza é feita com as rodas montadas." },
      { pergunta: "É o jogo completo?", resposta: "Sim, as quatro rodas e caixas de roda." },
      { pergunta: "Preciso fazer junto com uma lavagem?", resposta: "Combina com qualquer lavagem. Consulte pelo WhatsApp." },
    ],
  },
  "enceramento-tecnico": {
    paraQuem: "Para quem quer realçar a cor e proteger a pintura entre as lavagens, com brilho espelhado.",
    etapas: [
      { titulo: "Preparação", texto: "Precisa de uma Lavagem Prata ou Ouro antes, para a pintura estar descontaminada." },
      { titulo: "Cera de carnaúba com politriz", texto: "Espalhada de forma uniforme em toda a pintura." },
      { titulo: "Acabamento", texto: "Microfibra para o brilho espelhado e toque aveludado." },
    ],
    perguntas: [
      { pergunta: "Quanto tempo dura?", resposta: "Em média 3 meses, conforme as lavagens e a chuva. Lavando na Clean Car a partir da Lavagem Prata, que tem selante, dura pelo menos 6 meses." },
      { pergunta: "Do que protege?", resposta: "Raios UV, seiva de árvores e fezes de pássaros, além de realçar o brilho." },
      { pergunta: "Quanto tempo leva?", resposta: "Cerca de 3 horas, além da lavagem." },
    ],
  },
  "higienizacao-de-estofados": {
    paraQuem:
      "Para quem tem sofá, poltrona, colchão ou cadeira estofada encardida, manchada ou com cheiro, e prefere resolver em casa, sem transportar nada. Muito pedido por quem tem crianças e pets.",
    etapas: [
      { titulo: "Fotos pelo WhatsApp", texto: "Você manda fotos das peças e conta o que incomoda: mancha, cheiro, sujeira do dia a dia." },
      { titulo: "Avaliação e valor justo", texto: "Avaliamos tamanho, tecido e estado de cada peça e passamos o valor antes de marcar." },
      { titulo: "Atendimento na sua casa", texto: "Aspiração, limpeza profunda com bactericida e extração, e sanitizante perfumado." },
      { titulo: "Secagem", texto: "O estofado pode ficar levemente úmido: mantenha o ambiente arejado." },
    ],
    perguntas: [
      { pergunta: "Quanto custa higienizar um sofá?", resposta: "Depende do tamanho, do tecido e do estado da peça, por isso não trabalhamos com preço fixo. Mande fotos pelo WhatsApp: a avaliação é gratuita e você recebe o valor antes de agendar." },
      { pergunta: "Toda mancha sai?", resposta: "A maioria das manchas do dia a dia sai, mas algumas, muito antigas ou que já tingiram o tecido, podem só clarear. Pelas fotos já dá para avisar o que esperar." },
      { pergunta: "Tem garantia?", resposta: "Sim, 72 horas para odor ou mancha que persistir, exceto manchas que já tingiram o tecido e sujeira nova." },
    ],
  },
};
