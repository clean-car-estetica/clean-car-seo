import { permanentRedirect } from "next/navigation";

// 07/10/2026: as páginas por bairro eram quase iguais entre si (só mudava
// o nome do bairro) e o Google não indexava. Agora qualquer endereço antigo
// de bairro leva direto para a página do serviço — quem tinha o link salvo
// ou vinha do Google não cai em página quebrada.
export default async function ServicoBairroPage({
  params,
}: {
  params: Promise<{ servico: string; cidade: string; bairro: string }>;
}) {
  const { servico } = await params;
  permanentRedirect(`/servicos/${servico}`);
}
