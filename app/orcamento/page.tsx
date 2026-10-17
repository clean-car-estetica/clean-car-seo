import OrcamentoCliente from "@/components/OrcamentoCliente";
import { getServicosPublicos } from "@/lib/site-data";

export const revalidate = 300;

export default async function OrcamentoPage() {
  const servicos = (await getServicosPublicos()).map((s) => ({ slug: s.slug, nome: s.nome }));
  return <OrcamentoCliente servicos={servicos} />;
}
