import { createSign } from "node:crypto";

// Leitura do Search Console e do Google Analytics 4 com uma conta de serviço.
// Sem bibliotecas: assina o JWT com o crypto do Node e chama as APIs REST.
//
// Variáveis na Vercel:
//   GOOGLE_SERVICE_ACCOUNT_JSON  conteúdo inteiro do .json da conta de serviço
//   GA4_PROPERTY_ID              número da propriedade do Analytics (não o G-…)
//   GSC_SITE                     opcional; padrão sc-domain:cleancarestetica.com.br

const ESCOPOS = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
].join(" ");

type Credencial = { client_email: string; private_key: string; token_uri?: string };

function lerCredencial(): Credencial | null {
  // Forma simples (duas variáveis): mais fácil de colar na Vercel
  const email = process.env.GOOGLE_CLIENT_EMAIL?.trim();
  const chave = process.env.GOOGLE_PRIVATE_KEY?.trim().replace(/^"|"$/g, "");
  if (email && chave) return { client_email: email, private_key: chave.replace(/\\n/g, "\n") };

  const bruto = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!bruto) return null;
  try {
    const c = JSON.parse(bruto) as Credencial;
    if (!c.client_email || !c.private_key) return null;
    return { ...c, private_key: c.private_key.replace(/\\n/g, "\n") };
  } catch {
    return null;
  }
}

export function googleConfigurado() {
  const c = lerCredencial();
  return {
    conta: Boolean(c),
    email: c?.client_email ?? null,
    ga4: Boolean(process.env.GA4_PROPERTY_ID),
    site: process.env.GSC_SITE || "sc-domain:cleancarestetica.com.br",
  };
}

const b64url = (b: Buffer | string) =>
  Buffer.from(b).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

let tokenCache: { token: string; expira: number } | null = null;

async function obterToken(): Promise<string> {
  if (tokenCache && tokenCache.expira > Date.now() + 60_000) return tokenCache.token;
  const c = lerCredencial();
  if (!c) throw new Error("Conta de serviço do Google não configurada.");
  const agora = Math.floor(Date.now() / 1000);
  const cabecalho = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const corpo = b64url(
    JSON.stringify({ iss: c.client_email, scope: ESCOPOS, aud: c.token_uri || "https://oauth2.googleapis.com/token", iat: agora, exp: agora + 3600 })
  );
  const assinador = createSign("RSA-SHA256");
  assinador.update(`${cabecalho}.${corpo}`);
  const assinatura = b64url(assinador.sign(c.private_key));
  const r = await fetch(c.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${cabecalho}.${corpo}.${assinatura}` }),
    cache: "no-store",
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`Google recusou a conta de serviço: ${j.error_description || j.error || r.status}`);
  tokenCache = { token: j.access_token, expira: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return tokenCache.token;
}

// Cache em memória (por instância do servidor) para não consultar o Google a
// cada abertura do painel. Os dados do Google mudam poucas vezes por dia.
const memo = new Map<string, { valor: unknown; expira: number }>();
async function comCache<T>(chave: string, minutos: number, fn: () => Promise<T>): Promise<T> {
  const m = memo.get(chave);
  if (m && m.expira > Date.now()) return m.valor as T;
  const valor = await fn();
  memo.set(chave, { valor, expira: Date.now() + minutos * 60_000 });
  return valor;
}

async function postGoogle(url: string, corpo: unknown) {
  const token = await obterToken();
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(corpo),
    cache: "no-store",
  });
  const j = await r.json();
  if (!r.ok) {
    const msg = j?.error?.message || `erro ${r.status}`;
    if (r.status === 403) throw new Error(`Sem permissão: adicione ${googleConfigurado().email} como usuário. (${msg})`);
    throw new Error(msg);
  }
  return j;
}

// ---------------------------------------------------------------- Search Console
export type LinhaGSC = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number };

// Durante a mudança de endereço, o histórico ainda está na propriedade antiga
// (clean-car-seo.vercel.app). O painel soma as duas; se a antiga não tiver
// acesso liberado, é ignorada sem erro.
const SITE_ANTIGO = "https://clean-car-seo.vercel.app/";

async function consultarUmSite(site: string, corpo: Record<string, unknown>): Promise<LinhaGSC[]> {
  return comCache(`gsc:${site}:${JSON.stringify(corpo)}`, 30, async () => {
    const j = await postGoogle(`https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, corpo);
    return (j.rows ?? []) as LinhaGSC[];
  });
}

export async function consultarSearchConsole(params: {
  inicio: string;
  fim: string;
  dimensoes?: ("date" | "query" | "page" | "device")[];
  limite?: number;
}): Promise<LinhaGSC[]> {
  const site = googleConfigurado().site;
  const dims = params.dimensoes ?? [];
  const corpo = { startDate: params.inicio, endDate: params.fim, dimensions: dims, rowLimit: params.limite ?? 1000, dataState: "all" };
  const [novo, antigo] = await Promise.all([
    consultarUmSite(site, corpo),
    consultarUmSite(SITE_ANTIGO, corpo).catch(() => [] as LinhaGSC[]),
  ]);
  if (antigo.length === 0) return novo;

  // Soma por chave; páginas viram caminho (/servicos/...) para juntar os dois domínios
  const iPagina = dims.indexOf("page");
  const juntas = new Map<string, { keys: string[]; clicks: number; impressions: number; posPeso: number }>();
  for (const r of [...novo, ...antigo]) {
    const keys = r.keys ? [...r.keys] : [];
    if (iPagina >= 0) keys[iPagina] = keys[iPagina].replace(/^https?:\/\/[^/]+/, "") || "/";
    const k = keys.join("\u0001");
    const atual = juntas.get(k) ?? { keys, clicks: 0, impressions: 0, posPeso: 0 };
    atual.clicks += r.clicks;
    atual.impressions += r.impressions;
    atual.posPeso += r.position * r.impressions;
    juntas.set(k, atual);
  }
  return [...juntas.values()]
    .map((v) => ({
      keys: v.keys,
      clicks: v.clicks,
      impressions: v.impressions,
      ctr: v.impressions ? v.clicks / v.impressions : 0,
      position: v.impressions ? v.posPeso / v.impressions : 0,
    }))
    .sort((x, y) => y.clicks - x.clicks || y.impressions - x.impressions);
}

// ---------------------------------------------------------------- Analytics 4
export type LinhaGA = { dims: string[]; vals: number[] };

export async function consultarAnalytics(params: {
  inicio: string;
  fim: string;
  dimensoes?: string[];
  metricas: string[];
  limite?: number;
  filtroEvento?: string[];
}): Promise<LinhaGA[]> {
  const id = process.env.GA4_PROPERTY_ID;
  if (!id) throw new Error("ID da propriedade do Analytics não configurado.");
  const corpo: Record<string, unknown> = {
    dateRanges: [{ startDate: params.inicio, endDate: params.fim }],
    dimensions: (params.dimensoes ?? []).map((name) => ({ name })),
    metrics: params.metricas.map((name) => ({ name })),
    limit: params.limite ?? 250,
  };
  if (params.filtroEvento) {
    corpo.dimensionFilter = { filter: { fieldName: "eventName", inListFilter: { values: params.filtroEvento } } };
  }
  return comCache(`ga:${JSON.stringify(corpo)}`, 30, async () => {
    const j = await postGoogle(`https://analyticsdata.googleapis.com/v1beta/properties/${id}:runReport`, corpo);
    return ((j.rows ?? []) as { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[]).map((r) => ({
      dims: (r.dimensionValues ?? []).map((d) => d.value),
      vals: (r.metricValues ?? []).map((m) => Number(m.value)),
    }));
  });
}
