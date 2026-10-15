import { notFound, permanentRedirect } from "next/navigation";
import { temPaginaLocal } from "@/lib/paginas-locais";
import { getServicoPublico } from "@/lib/site-data";

// 07/10/2026: as páginas por bairro eram quase iguais entre si (só mudava
// o nome do bairro) e o Google não indexava. Agora qualquer endereço antigo
// de bairro leva direto para a página do serviço — quem tinha o link salvo
// ou vinha do Google não cai em página quebrada.
export default async function ServicoBairroPage({
  params,
}: {
  params: Promise<{ servico: string; cidade: string; bairro: string }>;
}) {
  const { servico, cidade } = await params;
  // 15/10/2026: serviço que não existe no catálogo → 404 direto, em vez de
  // redirecionar para outra página que também não existe.
  if (!(await getServicoPublico(servico))) notFound();
  // Se o serviço tem página própria naquela cidade, o bairro leva para ela
  // (mais próxima do que a pessoa buscou); senão, para a página do serviço.
  permanentRedirect(temPaginaLocal(servico, cidade) ? `/servicos/${servico}/${cidade}` : `/servicos/${servico}`);
}
