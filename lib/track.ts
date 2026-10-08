import { SITE_URL } from "@/lib/config";
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
    if (host === "clean-car-seo.vercel.app" || host === new URL(SITE_URL).host) return "Navegação interna";
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

// ---------------------------------------------------------------------------
// Registro de eventos com filtro de robôs e de visitas internas.
//
// - Visita interna: o navegador que entra no /admin fica marcado
//   (localStorage "cleancar_interno") e deixa de contar nas métricas.
// - Robôs: navegador automatizado ou user-agent de robô/prévia de link.
// - Cada evento leva no `meta` um id de sessão e um id de visitante, para o
//   painel contar pessoas e não só páginas abertas.
// ---------------------------------------------------------------------------
const CHAVE_INTERNO = "cleancar_interno";
const CHAVE_VISITANTE = "cleancar_vid";
const CHAVE_SESSAO = "cleancar_sid";

function lerLocal(chave: string, onde: "local" | "sessao"): string | null {
  try {
    return (onde === "local" ? localStorage : sessionStorage).getItem(chave);
  } catch {
    return null;
  }
}
function gravarLocal(chave: string, valor: string, onde: "local" | "sessao") {
  try {
    (onde === "local" ? localStorage : sessionStorage).setItem(chave, valor);
  } catch {}
}
function novoId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function marcarNavegadorInterno(interno = true) {
  try {
    if (interno) localStorage.setItem(CHAVE_INTERNO, "1");
    else localStorage.removeItem(CHAVE_INTERNO);
  } catch {}
}

export function ehNavegadorInterno(): boolean {
  return lerLocal(CHAVE_INTERNO, "local") === "1";
}

const ROBO = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python|axios|vercel/i;

export function ehRobo(): boolean {
  if (typeof navigator === "undefined") return true;
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;
  return ROBO.test(navigator.userAgent || "");
}

type TipoEvento = "pageview" | "click_whatsapp" | "click_agendar" | "form_submit";

export function registrarEvento(
  event_type: TipoEvento,
  page_path: string,
  extra: { service_slug?: string | null; city_slug?: string | null; origem?: string; detalhe?: string } = {}
) {
  if (typeof window === "undefined") return;
  // ?interno=0 na URL desmarca este navegador (ex.: celular de um cliente que entrou no admin por engano)
  const p = new URLSearchParams(window.location.search).get("interno");
  if (p === "0") marcarNavegadorInterno(false);
  if (ehNavegadorInterno() || ehRobo() || document.documentElement.classList.contains("cc-editar")) return;

  let vid = lerLocal(CHAVE_VISITANTE, "local");
  const novoVisitante = !vid;
  if (!vid) {
    vid = novoId();
    gravarLocal(CHAVE_VISITANTE, vid, "local");
  }
  let sid = lerLocal(CHAVE_SESSAO, "sessao");
  if (!sid) {
    sid = novoId();
    gravarLocal(CHAVE_SESSAO, sid, "sessao");
  }

  const meta: Record<string, string | number | boolean> = {
    v: 2,
    sid,
    vid,
    novo: novoVisitante,
    tela: window.innerWidth < 768 ? "celular" : "computador",
  };
  if (extra.detalhe) meta.detalhe = extra.detalhe;

  import("@/lib/supabase-browser").then(({ supabaseBrowser }) =>
    supabaseBrowser()
      .from("events")
      .insert({
        event_type,
        page_path,
        service_slug: extra.service_slug ?? null,
        city_slug: extra.city_slug ?? null,
        origem: extra.origem ?? obterOrigem(),
        meta,
      })
      .then(() => {})
  );
}
