import type { Service, Cidade } from "@/lib/data";

/**
 * Gera o conteúdo textual de uma página local (serviço x cidade).
 *
 * A Clean Car tem loja física apenas em Mogi das Cruzes. Nas demais cidades
 * não há atendimento no local do cliente — o texto precisa deixar isso claro
 * para não sugerir um serviço que não existe (atendimento móvel/na cidade).
 *
 * Hoje monta o texto a partir de um template com dados reais (bairros,
 * duração, preço). O plano é substituir por textos gerados via API da
 * Anthropic e cacheados em /content/local/*.json — ver scripts/gerar-conteudo.mjs.
 */
export function getConteudoLocal(servico: Service, cidade: Cidade) {
  if (cidade.sede) {
    const bairro = cidade.bairros[0];
    const paragrafos = [
      `Quem mora em ${cidade.nome}, principalmente perto de ${bairro}, já pode contar com a Clean Car para ${servico.nome.toLowerCase()} sem precisar rodar até outra cidade. ${servico.descricao}`,
      `Nosso estúdio fica em ${cidade.nome} e atende toda a região${
        cidade.bairros.length > 1 ? `, incluindo ${cidade.bairros.slice(1).join(", ")}` : ""
      }, sempre com horário marcado para você não perder tempo.`,
      servico.duracao
        ? `O serviço de ${servico.nome.toLowerCase()} tem duração média de ${servico.duracao}${
            servico.precoDesde ? `, com valores a partir de R$ ${servico.precoDesde}` : ""
          }.`
        : `Fale com a gente para saber prazos e valores de ${servico.nome.toLowerCase()} para o seu veículo.`,
    ];
    return { paragrafos };
  }

  // Cidades vizinhas: não há loja no local, o cliente vem até Mogi das Cruzes.
  const paragrafos = [
    `Muitos clientes de ${cidade.nome} vêm até o nosso estúdio em Mogi das Cruzes para fazer ${servico.nome.toLowerCase()} — a distância curta compensa pela qualidade do serviço. ${servico.descricao}`,
    `Importante: a Clean Car não tem loja física em ${cidade.nome}. Nosso estúdio fica em Mogi das Cruzes, e recebemos moradores de ${cidade.nome} e região sempre com horário marcado, para não perder tempo.`,
    servico.duracao
      ? `O serviço de ${servico.nome.toLowerCase()} tem duração média de ${servico.duracao}${
          servico.precoDesde ? `, com valores a partir de R$ ${servico.precoDesde}` : ""
        }.`
      : `Fale com a gente para saber prazos e valores de ${servico.nome.toLowerCase()} para o seu veículo.`,
  ];
  return { paragrafos };
}
