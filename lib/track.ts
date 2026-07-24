// Extrai service_slug/city_slug de rotas como /servicos/[servico]/[cidade],
// pra podermos filtrar KPIs por cidade e por serviço.
export function parseRota(pathname: string): { service_slug: string | null; city_slug: string | null } {
  const m = pathname.match(/^\/servicos\/([^/]+)(?:\/([^/]+))?/);
  return { service_slug: m?.[1] ?? null, city_slug: m?.[2] ?? null };
}
