export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function NpsAdminPage() {
  const { data: respostas, error } = await supabaseAdmin
    .from("nps_respostas")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(100);

  const notas = respostas?.map((r) => r.nota) ?? [];
  const promotores = notas.filter((n) => n >= 9).length;
  const neutros = notas.filter((n) => n >= 7 && n <= 8).length;
  const detratores = notas.filter((n) => n <= 6).length;
  const total = notas.length;
  const nps = total > 0 ? Math.round(((promotores - detratores) / total) * 100) : null;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">NPS</h1>
      <p className="text-steel-line text-sm mb-6">
        Link pra compartilhar com clientes após o serviço:{" "}
        <code className="px-1 bg-black/30 rounded">clean-car-seo.vercel.app/avaliar</code>
      </p>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler `nps_respostas` ({error.message}). Confirme se rodou o schema.sql atualizado.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <div className="bg-card border border-card-line rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wide text-steel-line mb-2">NPS</div>
          <div className="font-display font-extrabold text-3xl text-verniz-shine">{nps ?? "—"}</div>
        </div>
        <div className="bg-card border border-card-line rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wide text-steel-line mb-2">Promotores (9-10)</div>
          <div className="font-display font-extrabold text-3xl text-ok">{promotores}</div>
        </div>
        <div className="bg-card border border-card-line rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wide text-steel-line mb-2">Neutros (7-8)</div>
          <div className="font-display font-extrabold text-3xl text-steel">{neutros}</div>
        </div>
        <div className="bg-card border border-card-line rounded-2xl p-6">
          <div className="text-xs font-bold uppercase tracking-wide text-steel-line mb-2">Detratores (0-6)</div>
          <div className="font-display font-extrabold text-3xl text-warn">{detratores}</div>
        </div>
      </div>

      <div className="bg-card border border-card-line rounded-2xl p-6">
        <h2 className="font-display font-bold text-lg text-steel mb-4">Respostas recentes</h2>
        {(!respostas || respostas.length === 0) ? (
          <p className="text-steel-line text-sm">Nenhuma resposta ainda.</p>
        ) : (
          <div className="grid gap-3">
            {respostas.map((r) => (
              <div key={r.id} className="border-t border-card-line pt-3 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-3">
                  <span className={`font-display font-extrabold text-lg ${r.nota >= 9 ? "text-ok" : r.nota >= 7 ? "text-steel" : "text-warn"}`}>
                    {r.nota}
                  </span>
                  <span className="text-xs text-steel-line">
                    {new Date(r.criado_em).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                {r.comentario && <p className="text-sm text-steel-line mt-1">{r.comentario}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
