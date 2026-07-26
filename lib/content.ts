import type { Service, Cidade } from "@/lib/data";

/**
 * Gera o conteúdo textual de uma página local (serviço x cidade).
 *
 * A Clean Car tem loja física apenas em Mogi das Cruzes. Nas demais cidades
 * não há atendimento no local do cliente — o texto precisa deixar isso claro
 * (mas pode mencionar o serviço de leva-e-trás como alternativa).
 *
 * Isto é um template padrão — pode ser sobrescrito por página no console
 * (aba "Páginas locais"), que grava em local_pages_content no Supabase.
 */
export function getConteudoLocal(servico: Service, cidade: Cidade) {
  if (cidade.sede) {
    const bairro = cidade.bairros[0];
    const paragrafos = [
      `Quem mora em ${cidade.nome}, principalmente perto de ${bairro}, já pode contar com a Clean Car para ${servico.nome.toLowerCase()} sem precisar rodar até outra cidade. ${servico.descricao}`,
      `Nossa loja fica em ${cidade.nome} e atende toda a região${
        cidade.bairros.length > 1 ? `, incluindo ${cidade.bairros.slice(1).join(", ")}` : ""
      }. Aqui, cada carro passa pelo nosso processo técnico completo — pré-lavagem, produtos Vonixx e muito cuidado com cada detalhe — sempre com horário marcado.`,
      servico.duracao
        ? `O serviço de ${servico.nome.toLowerCase()} tem duração média de ${servico.duracao}${
            servico.precoDesde ? `, com valores a partir de R$ ${servico.precoDesde}` : ""
          }. Se preferir não esperar, temos a opção de leva-e-trás.`
        : `Fale com a gente para saber prazos e valores de ${servico.nome.toLowerCase()} para o seu veículo.`,
    ];
    return { paragrafos };
  }

  // Cidades vizinhas: não há loja no local, o cliente vem até Mogi das Cruzes.
  const paragrafos = [
    `Muitos clientes de ${cidade.nome} escolhem a Clean Car para ${servico.nome.toLowerCase()} — a loja fica em Mogi das Cruzes, mas quem já veio de lá sabe que o resultado compensa o deslocamento. ${servico.descricao}`,
    `Importante: a Clean Car não tem loja física em ${cidade.nome}. Recebemos moradores de ${cidade.nome} e região na nossa loja em Mogi das Cruzes, sempre com horário marcado — e se for mais prático, oferecemos o serviço de leva-e-trás, buscando e devolvendo seu carro.`,
    servico.duracao
      ? `O serviço de ${servico.nome.toLowerCase()} tem duração média de ${servico.duracao}${
          servico.precoDesde ? `, com valores a partir de R$ ${servico.precoDesde}` : ""
        }.`
      : `Fale com a gente para saber prazos e valores de ${servico.nome.toLowerCase()} para o seu veículo.`,
  ];
  return { paragrafos };
}
