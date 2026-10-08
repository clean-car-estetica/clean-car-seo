// Páginas de serviço × cidade com texto próprio (tabela local_pages_content).
// Só estas entram no sitemap e ficam indexáveis. Escolhidas pelos dados do
// Search Console (08/10/2026): eram as que traziam aparições e cliques.
export const PAGINAS_LOCAIS: { servico: string; cidade: string }[] = [
  { servico: "lavagem-motor", cidade: "mogi-das-cruzes" },
  { servico: "restauracao-de-farol", cidade: "mogi-das-cruzes" },
  { servico: "lavagem-bronze", cidade: "mogi-das-cruzes" },
  { servico: "lavagem-prata", cidade: "mogi-das-cruzes" },
  { servico: "lavagem-ouro", cidade: "mogi-das-cruzes" },
  { servico: "higienizacao", cidade: "mogi-das-cruzes" },
  { servico: "higienizacao-banco-dianteiro", cidade: "mogi-das-cruzes" },
  { servico: "vitrificacao", cidade: "mogi-das-cruzes" },
  { servico: "lavagem-bronze", cidade: "suzano" },
  { servico: "higienizacao", cidade: "suzano" },
  { servico: "revitalizacao-plastico", cidade: "suzano" },
  { servico: "lavagem-prata", cidade: "ferraz-de-vasconcelos" },
  { servico: "higienizacao-banco-dianteiro", cidade: "itaquaquecetuba" },
  { servico: "lavagem-motor", cidade: "guararema" },
];

/** Melhor página para uma cidade (usada nos links da página inicial). */
export function paginaDaCidade(cidade: string): string {
  const p = PAGINAS_LOCAIS.find((x) => x.cidade === cidade);
  return p ? `/servicos/${p.servico}/${p.cidade}` : `/servicos/lavagem-bronze`;
}

export const temPaginaLocal = (servico: string, cidade: string) =>
  PAGINAS_LOCAIS.some((p) => p.servico === servico && p.cidade === cidade);
