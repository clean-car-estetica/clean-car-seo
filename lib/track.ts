// Extrai service_slug/city_slug de rotas como /servicos/[servico]/[cidade],
// pra podermos filtrar KPIs por cidade e por serviço.
export function parseRota(pathname: string): { service_slug: string | null; city_slug: string | null } {
  const m = pathname.match(/^\/servicos\/([^/]+)(?:\/([^/]+))?/);
  return { service_slug: m?.[1] ?? null, city_slug: m?.[2] ?? null };
}

const CHAVE_ORIGEM = "cleancar_origem";

function classificarReferrer(referrer: string): string {
  if (!referrer) return "Direto";
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host.includes("google")) return "Google (orgânico)";
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("facebook") || host.includes("fb.com")) return "Facebook";
    if (host.includes("whatsapp") || host.includes("wa.me")) return "WhatsApp";
    if (host.includes("bing")) return "Bing";
    if (host.includes("chatgpt") || host.includes("openai")) return "ChatGPT";
    if (host === "clean-car-seo.vercel.app") return "Navegação interna";
    return host;
  } catch {
    return "Direto";
  }
}

/**
 * Determina de onde o visitante veio (utm_source da URL, ou o referrer do navegador)
 * e guarda na sessão — assim, mesmo que a pessoa navegue por várias páginas antes de
 * clicar em Agendar/WhatsApp, o clique continua sendo atribuído à origem original.
 */
export function obterOrigem(): string {
  if (typeof window === "undefined") return "Direto";

  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get("utm_source");

  if (utmSource) {
    const origem = params.get("utm_campaign") ? `${utmSource} (${params.get("utm_campaign")})` : utmSource;
    sessionStorage.setItem(CHAVE_ORIGEM, origem);
    return origem;
  }

  const existente = sessionStorage.getItem(CHAVE_ORIGEM);
  if (existente) return existente;

  const origem = classificarReferrer(document.referrer);
  sessionStorage.setItem(CHAVE_ORIGEM, origem);
  return origem;
}
