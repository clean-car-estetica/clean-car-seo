import { NextResponse } from "next/server";
import { consultarAnalytics, consultarSearchConsole, googleConfigurado } from "@/lib/google";

export const dynamic = "force-dynamic";

// Diagnóstico da ligação com o Google (só status, nunca a chave).
// Protegido por DIAG_TOKEN: /api/diag-google?t=<token>
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t");
  if (!process.env.DIAG_TOKEN || t !== process.env.DIAG_TOKEN) return new NextResponse("Not found", { status: 404 });
  const c = googleConfigurado();
  const hoje = new Date().toISOString().slice(0, 10);
  const inicio = new Date(Date.now() - 27 * 86_400_000).toISOString().slice(0, 10);
  const r: Record<string, unknown> = { conta: c.conta, email: c.email, ga4: c.ga4, site: c.site };
  try {
    const l = await consultarSearchConsole({ inicio, fim: hoje });
    r.searchConsole = { ok: true, cliques: l[0]?.clicks ?? 0, aparicoes: l[0]?.impressions ?? 0 };
  } catch (e) {
    r.searchConsole = { ok: false, erro: (e as Error).message };
  }
  if (c.ga4) {
    try {
      const l = await consultarAnalytics({ inicio, fim: hoje, metricas: ["activeUsers"] });
      r.analytics = { ok: true, pessoas: l[0]?.vals[0] ?? 0 };
    } catch (e) {
      r.analytics = { ok: false, erro: (e as Error).message };
    }
  }
  return NextResponse.json(r, { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
