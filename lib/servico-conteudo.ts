// Conteúdo próprio de cada página de serviço (08/10/2026): como é feito,
// para quem é e perguntas que as pessoas fazem antes de contratar.
// Baseado nas descrições oficiais dos serviços; preço e tempo vêm do banco.

export type ConteudoServico = {
  paraQuem: string;
  etapas: { titulo: string; texto: string }[];
  perguntas: { pergunta: string; resposta: string }[];
};

export const CONTEUDO_SERVICO: Record<string, ConteudoServico> = {
  "lavagem-bronze": {
    paraQuem:
      "Para quem usa o carro todo dia e quer mantê-lo limpo com frequência, gastando pouco e sem arriscar a pintura com escova ou pano reaproveitado.",
    etapas: [
      { titulo: "Ducha externa", texto: "Tira a poeira solta e a areia antes de qualquer contato com a pintura." },
      { titulo: "Lavagem com luva própria", texto: "Luva de microfibra exclusiva, que não agride o verniz nem deixa riscos finos." },
      { titulo: "Rodas e secagem", texto: "Limpeza das rodas e secagem com microfibra, sem marcas de água." },
      { titulo: "Aspiração básica", texto: "Bancos e tapetes aspirados para o carro sair limpo por dentro também." },
    ],
    perguntas: [
      { pergunta: "Qual a diferença para um lava-rápido comum?", resposta: "O cuidado com a pintura: usamos luva de microfibra exclusiva e secagem com microfibra, sem escova de nylon nem pano reaproveitado, que são o que causa os riscos finos no verniz." },
      { pergunta: "De quanto em quanto tempo devo lavar?", resposta: "Para quem usa o carro todo dia, a cada 1 ou 2 semanas. Quem lava com frequência economiza com os planos mensais." },
      { pergunta: "Preciso agendar?", resposta: "Sim, trabalhamos com hora marcada para você não esperar. O agendamento é rápido pelo WhatsApp." },
    ],
  },
  "lavagem-prata": {
    paraQuem:
      "Para quem quer o carro limpo e protegido: brilho mais profundo, água escorrendo na chuva e interior bem cuidado. É a nossa lavagem mais procurada.",
    etapas: [
      { titulo: "Pré-lavagem com espuma", texto: "A espuma densa solta a sujeira antes do contato com a pintura, o que evita riscos." },
      { titulo: "Lavagem manual", texto: "Shampoo neutro e luvas de microfibra, painel por painel." },
      { titulo: "Enceramento Tokfinal Vonixx", texto: "Cera que realça a cor, deixa toque aveludado e faz a água escorrer." },
      { titulo: "Interior", texto: "Aspiração completa, limpeza bactericida dos plásticos e vidros internos sem manchas." },
    ],
    perguntas: [
      { pergunta: "Quanto tempo dura o enceramento?", resposta: "Depende do uso e de onde o carro fica, mas em geral algumas semanas. Por isso a Lavagem Prata funciona bem a cada 15 ou 30 dias." },
      { pergunta: "A cera deixa a pintura oleosa?", resposta: "Não. O acabamento é feito com microfibra e fica seco ao toque, com brilho e sensação aveludada." },
      { pergunta: "Posso esperar no local?", resposta: "Pode. A lavagem leva cerca de 1h30. Se preferir, deixe o carro e busque depois, ou peça o leva e traz." },
    ],
  },
  "lavagem-ouro": {
    paraQuem:
      "Para quem quer o carro impecável por dentro e por fora, com proteção que dura meses: antes de uma viagem, de um evento ou de vender o carro.",
    etapas: [
      { titulo: "Pré-lavagem técnica", texto: "Remoção da sujeira pesada sem atrito, inclusive nas caixas de roda." },
      { titulo: "Lavagem de detalhe", texto: "Alta lubrificação e atenção a frestas, emblemas, grades e molduras." },
      { titulo: "Selante hidrofóbico", texto: "Proteção da pintura e dos vidros contra chuva ácida e fezes de pássaros por até 3 meses." },
      { titulo: "Interior completo", texto: "Aspiração completa e cuidado com painel e plásticos, com acabamento em microfibra." },
    ],
    perguntas: [
      { pergunta: "Por que demora mais de 3 horas?", resposta: "Porque é uma lavagem detalhada: cada fresta, emblema e moldura é limpa à mão, e o selante precisa ser aplicado e acabado com calma para durar." },
      { pergunta: "O selante substitui a vitrificação?", resposta: "Não. O selante protege por até 3 meses. A vitrificação é um revestimento cerâmico que dura até 3 anos." },
      { pergunta: "Tem leva e traz?", resposta: "Sim, conforme o bairro. Consulte pelo WhatsApp." },
    ],
  },
  higienizacao: {
    paraQuem:
      "Para carros com bancos encardidos, cheiro de mofo ou de cigarro, e para quem anda com crianças, pets ou tem alergia e rinite.",
    etapas: [
      { titulo: "Avaliação", texto: "Olhamos manchas, tipo de tecido ou couro e pontos de atenção antes de começar." },
      { titulo: "Extração profunda", texto: "Bancos, teto, carpetes e porta-malas com extratora, que puxa a sujeira de dentro da espuma." },
      { titulo: "Plásticos e comandos", texto: "Higienização de painel, volante, pedais e portas." },
      { titulo: "Ar-condicionado", texto: "Sanitização do sistema e troca do filtro de cabine." },
      { titulo: "Secagem", texto: "O carro sai seco e com cheiro de limpo, sem perfume forte para disfarçar." },
    ],
    perguntas: [
      { pergunta: "O banco fica molhado?", resposta: "Não. A extratora retira a umidade junto com a sujeira, e o carro só é entregue depois de seco." },
      { pergunta: "Tira cheiro de mofo e de cigarro?", resposta: "Sim. A higienização ataca a origem do cheiro no tecido e o ar-condicionado é sanitizado. Para casos fortes, existe também o tratamento anti-odor." },
      { pergunta: "Por que o carro fica o dia todo?", resposta: "É um trabalho detalhado em todas as superfícies internas, e o tempo de secagem faz parte. Para não atrapalhar o seu dia, use o leva e traz." },
    ],
  },
  "higienizacao-banco-dianteiro": {
    paraQuem:
      "Para quem tem mancha ou sujeira só nos bancos da frente, principalmente motoristas de aplicativo, que passam o dia sentados no mesmo banco.",
    etapas: [
      { titulo: "Limpador bactericida", texto: "Ação profunda no tecido ou no couro." },
      { titulo: "Escovação técnica", texto: "Solta a sujeira sem desfiar o tecido nem marcar o couro." },
      { titulo: "Extração", texto: "A extratora tira a sujeira e a umidade de dentro da espuma." },
    ],
    perguntas: [
      { pergunta: "O preço é por banco?", resposta: "Sim, o valor é por banco." },
      { pergunta: "Toda mancha sai?", resposta: "A grande maioria sai. Manchas muito antigas ou de tinta podem clarear sem sumir por completo. Mande uma foto pelo WhatsApp que avaliamos antes." },
      { pergunta: "Quanto tempo para secar?", resposta: "O banco não fica encharcado e seca no mesmo dia." },
    ],
  },
  "higienizacao-banco-traseiro": {
    paraQuem: "Para quem transporta crianças, pets ou passageiros e tem restos de comida, derramamentos ou sujeira impregnada no banco de trás.",
    etapas: [
      { titulo: "Remoção de resíduos", texto: "Aspiração das frestas onde ficam migalhas e pelos." },
      { titulo: "Extração profunda", texto: "Limpeza do assento e dos encostos com extratora." },
      { titulo: "Eliminação de microrganismos", texto: "Produto bactericida que renova tecido ou couro." },
    ],
    perguntas: [
      { pergunta: "Serve para cadeirinha de criança?", resposta: "O serviço é para o banco do carro. Se quiser incluir a cadeirinha, consulte pelo WhatsApp." },
      { pergunta: "Tira pelo de cachorro?", resposta: "Sim, a remoção de pelos faz parte da limpeza antes da extração." },
      { pergunta: "Quanto tempo leva?", resposta: "Cerca de 2 horas." },
    ],
  },
  "revitalizacao-plastico": {
    paraQuem: "Para carros com para-choques, frisos e painel esbranquiçados ou ressecados pelo sol.",
    etapas: [
      { titulo: "Descontaminação", texto: "Remove sujeira e restos de produtos antigos dos poros do plástico." },
      { titulo: "Restaurador técnico", texto: "Devolve a cor original e protege contra raios UV." },
      { titulo: "Acabamento seco", texto: "Sem aspecto oleoso, sem grudar poeira e sem escorrer na chuva." },
    ],
    perguntas: [
      { pergunta: "É igual ao pretinho de posto?", resposta: "Não. O pretinho comum é oleoso, gruda poeira e sai na primeira chuva. O restaurador técnico penetra no plástico e fica seco ao toque." },
      { pergunta: "Serve para dentro e para fora do carro?", resposta: "Sim, para plásticos externos e internos." },
      { pergunta: "Combina com lavagem?", resposta: "Combina muito bem. Leva cerca de 1 hora a mais." },
    ],
  },
  "restauracao-de-farol": {
    paraQuem: "Para faróis amarelados ou opacos, que deixam o carro com aparência velha e iluminam menos à noite.",
    etapas: [
      { titulo: "Proteção da pintura", texto: "Isolamos a área em volta do farol." },
      { titulo: "Lixamento técnico", texto: "Em etapas, remove a camada oxidada da lente." },
      { titulo: "Acabamento de precisão", texto: "Devolve a transparência." },
      { titulo: "Proteção UV", texto: "Específica para faróis, é o que faz o resultado durar." },
    ],
    perguntas: [
      { pergunta: "Volta a amarelar?", resposta: "Sem proteção, volta em poucos meses. Por isso finalizamos com proteção UV própria para faróis, que prolonga muito o resultado." },
      { pergunta: "Vale mais a pena que trocar o farol?", resposta: "Na maioria dos casos, sim: a restauração custa bem menos do que um farol novo." },
      { pergunta: "Resolve farol embaçado por dentro?", resposta: "Não. Umidade ou sujeira na parte interna precisa de outro reparo. A restauração trata a parte externa da lente." },
    ],
  },
  "lavagem-motor": {
    paraQuem: "Para quem quer o motor limpo e protegido sem risco para a parte elétrica, e para quem vai vender o carro.",
    etapas: [
      { titulo: "Proteção dos componentes", texto: "Conectores e partes sensíveis são protegidos antes da limpeza." },
      { titulo: "Desengraxante e pincéis", texto: "Limpeza a seco, sem jato de água sob pressão." },
      { titulo: "Verniz protetor", texto: "Previne oxidação e hidrata mangueiras e plásticos." },
    ],
    perguntas: [
      { pergunta: "Lavar motor estraga o carro?", resposta: "O que pode causar problema é jato de água forte na parte elétrica. Por isso a nossa lavagem é a seco, com produto e pincel." },
      { pergunta: "Ajuda a achar vazamento?", resposta: "Sim. Com o motor limpo, um vazamento de óleo ou de água aparece logo." },
      { pergunta: "Quanto tempo leva?", resposta: "Cerca de 2 horas." },
    ],
  },
  "cristalizacao-de-vidros": {
    paraQuem: "Para quem pega estrada ou chuva com frequência e quer enxergar melhor, com menos uso do limpador.",
    etapas: [
      { titulo: "Remoção de manchas", texto: "Tira marcas de chuva ácida, de água e resíduos do vidro." },
      { titulo: "Cristalizador repelente", texto: "Camada de longa duração que faz a água escorrer sozinha com o carro em movimento." },
    ],
    perguntas: [
      { pergunta: "Precisa parar de usar o limpador?", resposta: "Não precisa parar, mas com o carro em movimento a água escorre sozinha e você usa bem menos." },
      { pergunta: "Faz em todos os vidros?", resposta: "O para-brisa é o principal. Consulte para os demais vidros." },
      { pergunta: "Quanto tempo leva?", resposta: "Cerca de 2 horas." },
    ],
  },
  "hidratacao-de-couro": {
    paraQuem: "Para bancos de couro ressecados, duros, desbotados ou com início de rachaduras.",
    etapas: [
      { titulo: "Limpeza profunda", texto: "Produto específico para couro, que tira a sujeira dos poros." },
      { titulo: "Condicionamento", texto: "Devolve a maciez." },
      { titulo: "Proteção", texto: "Camada contra ressecamento, manchas e desbotamento." },
    ],
    perguntas: [
      { pergunta: "De quanto em quanto tempo hidratar?", resposta: "Em geral a cada 3 a 6 meses, ou antes se o carro fica muito no sol." },
      { pergunta: "Serve para couro sintético?", resposta: "Sim, com produtos adequados a cada tipo de material." },
      { pergunta: "Recupera rachadura?", resposta: "A hidratação evita que piorem. Rachaduras abertas precisam de reparo de estofaria." },
    ],
  },
  "tratamento-anti-odor": {
    paraQuem: "Para carros com cheiro de cigarro, mofo, derramamentos ou animais que não sai com a limpeza comum.",
    etapas: [
      { titulo: "Identificação da origem", texto: "Descobrimos de onde vem o cheiro." },
      { titulo: "Ação profunda", texto: "Tratamento que ataca a causa, não só mascara." },
      { titulo: "Purificação", texto: "Ar interno e superfícies purificados, sem deixar resíduos." },
    ],
    perguntas: [
      { pergunta: "É só um perfume?", resposta: "Não. O tratamento ataca a causa do cheiro. Perfume só disfarça por alguns dias." },
      { pergunta: "Resolve cheiro de cigarro?", resposta: "Sim. Para casos muito fortes, recomendamos combinar com a higienização interna." },
      { pergunta: "Quanto tempo leva?", resposta: "Cerca de 1 hora." },
    ],
  },
  vitrificacao: {
    paraQuem: "Para carro novo ou com a pintura recém-corrigida, para quem quer a proteção mais duradoura e um brilho que chama atenção.",
    etapas: [
      { titulo: "Avaliação da pintura", texto: "Gratuita. Define se é preciso corrigir antes de vitrificar." },
      { titulo: "Preparação", texto: "Lavagem e descontaminação completas da pintura." },
      { titulo: "Revestimento cerâmico", texto: "Aplicação painel por painel." },
      { titulo: "Cura", texto: "Tempo de cura antes da entrega, para a camada endurecer." },
    ],
    perguntas: [
      { pergunta: "Quanto tempo dura a vitrificação?", resposta: "Até 3 anos, seguindo os cuidados de lavagem que passamos na entrega." },
      { pergunta: "Qual a diferença para o enceramento?", resposta: "A cera protege por algumas semanas. A vitrificação forma uma camada cerâmica dura que dura anos e deixa a lavagem muito mais fácil." },
      { pergunta: "Por que o carro fica um dia?", resposta: "Pela preparação da pintura e pelo tempo de cura do revestimento." },
    ],
  },
  "protecao-de-rodas": {
    paraQuem: "Para rodas com resíduo de freio escuro e para quem quer facilitar as próximas lavagens.",
    etapas: [
      { titulo: "Limpeza profunda", texto: "Remove o resíduo de freio e a sujeira acumulada." },
      { titulo: "Selante para rodas", texto: "Proteção específica que dificulta a sujeira grudar." },
    ],
    perguntas: [
      { pergunta: "É o jogo completo?", resposta: "Sim, o valor é das quatro rodas." },
      { pergunta: "Previne corrosão?", resposta: "Sim, o selante ajuda a prevenir oxidação e corrosão." },
      { pergunta: "Quanto tempo leva?", resposta: "Cerca de 2 horas." },
    ],
  },
  "enceramento-tecnico": {
    paraQuem: "Para quem quer realçar a cor e proteger a pintura entre as lavagens, com brilho espelhado.",
    etapas: [
      { titulo: "Lavagem e preparação", texto: "A pintura precisa estar limpa para a cera aderir." },
      { titulo: "Aplicação da Tokfinal Vonixx", texto: "Espalhada de forma uniforme em toda a pintura." },
      { titulo: "Acabamento", texto: "Microfibra para o brilho espelhado e toque aveludado." },
    ],
    perguntas: [
      { pergunta: "Qual a diferença para a cera da Lavagem Prata?", resposta: "O enceramento técnico é um serviço dedicado, com mais tempo de aplicação e acabamento, para um brilho mais intenso." },
      { pergunta: "Quanto tempo dura?", resposta: "Algumas semanas, dependendo do uso e de onde o carro fica." },
      { pergunta: "Quanto tempo leva?", resposta: "Cerca de 3 horas." },
    ],
  },
};
