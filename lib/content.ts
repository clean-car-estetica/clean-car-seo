import type { Service, Cidade } from "@/lib/data";

/**
 * Gera o conteúdo textual de uma página local (serviço x cidade).
 *
 * Hoje monta o texto a partir de um template com dados reais (bairros,
 * duração, preço). O plano é substituir por textos gerados via API da
 * Anthropic e cacheados em /content/local/*.json — ver scripts/gerar-conteudo.mjs.
 */
export function getConteudoLocal(servico: Service, cidade: Cidade) {
  const bairro = cidade.bairros[0];
  const paragrafos = [
    `Quem mora em ${cidade.nome}, principalmente perto de ${bairro}, já pode contar com a Clean Car para ${servico.nome.toLowerCase()} sem precisar rodar até outra cidade. ${servico.descricao}`,
    `Atendemos clientes de toda a região de ${cidade.nome}${
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
