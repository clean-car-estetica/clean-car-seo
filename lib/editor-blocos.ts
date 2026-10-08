// Cada bloco editável do site → a tela do console que edita aquele conteúdo.
// O editor visual abre essa tela no painel lateral (modo embutido).
export type BlocoEditor = { rotulo: string; caminho: string; dica: string };

export const BLOCOS: Record<string, BlocoEditor> = {
  topo: { rotulo: "Topo da página", caminho: "/admin/home", dica: "Vídeo ou foto de fundo, título, subtítulo e selo." },
  contato: { rotulo: "Menu, telefone e redes", caminho: "/admin/contato", dica: "WhatsApp, Instagram, endereço e horários." },
  servicos: { rotulo: "Serviços e preços", caminho: "/admin/conteudo", dica: "Nome, preço, tempo, descrição e foto de cada serviço." },
  servico: { rotulo: "Este serviço", caminho: "/admin/conteudo", dica: "Nome, preço, tempo, descrição e foto." },
  "antes-depois": { rotulo: "Antes e depois", caminho: "/admin/transformacoes", dica: "Pares de fotos que o visitante arrasta para comparar." },
  processo: { rotulo: "Nosso processo", caminho: "/admin/processo", dica: "As etapas que todo carro passa." },
  produtos: { rotulo: "Produtos usados", caminho: "/admin/produtos", dica: "Marcas e produtos que aparecem no site." },
  planos: { rotulo: "Planos mensais", caminho: "/admin/planos", dica: "Assinaturas, preços e o que cada uma inclui." },
  cidades: { rotulo: "Cidades atendidas", caminho: "/admin/cidades", dica: "Cidades que aparecem na lista e nas páginas locais." },
  textos: { rotulo: "Títulos das seções", caminho: "/admin/textos", dica: "Títulos e subtítulos fixos das seções da página inicial." },
  depoimentos: { rotulo: "Depoimentos", caminho: "/admin/depoimentos", dica: "O que os clientes falaram." },
  indicacao: { rotulo: "Indique e ganhe", caminho: "/admin/promocoes", dica: "Promoção de indicação e cupom." },
  faq: { rotulo: "Perguntas frequentes", caminho: "/admin/faq", dica: "Perguntas e respostas." },
  rodape: { rotulo: "Rodapé", caminho: "/admin/contato", dica: "Endereço, horários e links do rodapé." },
  sobre: { rotulo: "Sobre nós", caminho: "/admin/sobre", dica: "Texto e fotos da página Sobre." },
  blog: { rotulo: "Blog", caminho: "/admin/blog", dica: "Artigos, rascunhos e publicação." },
  "pagina-local": { rotulo: "Texto desta cidade", caminho: "/admin/paginas-locais", dica: "Texto próprio do serviço nesta cidade." },
};

/** O que não tem um "lugar" fixo na página: listas inteiras e configurações. */
export const AJUSTES_GERAIS: { grupo: string; itens: { rotulo: string; caminho: string; dica: string }[] }[] = [
  {
    grupo: "Conteúdo",
    itens: [
      { rotulo: "Todos os serviços", caminho: "/admin/conteudo", dica: "Preços, tempos, fotos e ordem de todos os serviços." },
      { rotulo: "Blog", caminho: "/admin/blog", dica: "Escrever, revisar rascunhos e publicar artigos." },
      { rotulo: "Cidades", caminho: "/admin/cidades", dica: "Cidades e bairros atendidos." },
      { rotulo: "Textos por cidade", caminho: "/admin/paginas-locais", dica: "Texto próprio de um serviço numa cidade." },
      { rotulo: "Páginas extras", caminho: "/admin/paginas", dica: "Páginas personalizadas fora do menu." },
    ],
  },
  {
    grupo: "Vendas",
    itens: [
      { rotulo: "Pop-up de campanha", caminho: "/admin/campanha", dica: "Oferta que abre ao entrar no site." },
      { rotulo: "Promoções e cupons", caminho: "/admin/promocoes", dica: "Descontos e indicação." },
      { rotulo: "Planos mensais", caminho: "/admin/planos", dica: "Assinaturas e preços." },
      { rotulo: "Benefícios", caminho: "/admin/beneficios", dica: "Página de vantagens para clientes." },
    ],
  },
  {
    grupo: "Configurações",
    itens: [
      { rotulo: "Contato e redes", caminho: "/admin/contato", dica: "WhatsApp, Instagram, endereço e horários." },
      { rotulo: "Cores do site", caminho: "/admin/tema", dica: "Fundo, destaque e presets." },
      { rotulo: "Como aparece no Google", caminho: "/admin/metadados", dica: "Título e descrição de cada página nos resultados." },
      { rotulo: "Títulos das seções", caminho: "/admin/textos", dica: "Títulos fixos da página inicial." },
    ],
  },
];
