export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { servicos } from "@/lib/data";
import { marcarAtendido } from "./actions";

const ROTULOS: Record<string, string> = {
  cupom_primeira_visita: "Cupom 1ª visita",
  indicacao: "Indicação",
  orcamento: "Orçamento",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const sp = await searchParams;
  let query = supabaseAdmin.from("leads").select("*").order("criado_em", { ascending: false });
  if (sp.tipo) query = query.eq("tipo", sp.tipo);
  const { data: leads, error } = await query;

  const pendentes = leads?.filter((l) => !l.atendido).length ?? 0;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Leads</h1>
      <p className="text-steel-line text-sm mb-6">
        {pendentes > 0 ? `${pendentes} lead(s) ainda não atendido(s).` : "Tudo atendido por aqui."}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <a href="/admin/leads" className={`px-4 py-2 rounded-full text-sm font-bold ${!sp.tipo ? "bg-verniz text-carbon" : "bg-card border border-card-line text-steel-line"}`}>Todos</a>
        {Object.entries(ROTULOS).map(([valor, label]) => (
          <a key={valor} href={`/admin/leads?tipo=${valor}`} className={`px-4 py-2 rounded-full text-sm font-bold ${sp.tipo === valor ? "bg-verniz text-carbon" : "bg-card border border-card-line text-steel-line"}`}>
            {label}
          </a>
        ))}
      </div>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler `leads` ({error.message}). Confirme se rodou o schema.sql atualizado.
        </div>
      )}

      <div className="grid gap-3">
        {leads?.map((l) => (
          <div key={l.id} className={`bg-card border rounded-xl p-4 flex items-center justify-between gap-4 ${l.atendido ? "border-card-line opacity-60" : "border-verniz/40"}`}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-verniz-shine">{ROTULOS[l.tipo]}</span>
                <span className="text-xs text-steel-line">{new Date(l.criado_em).toLocaleDateString("pt-BR")}</span>
              </div>
              <div className="font-display font-bold text-steel mt-1">{l.nome} · {l.whatsapp}</div>
              {l.servico_slug && <div className="text-xs text-steel-line">Serviço: {servicos.find((s) => s.slug === l.servico_slug)?.nome ?? l.servico_slug}</div>}
              {l.codigo_indicacao && <div className="text-xs text-steel-line">Código: {l.codigo_indicacao}</div>}
              {l.mensagem && <div className="text-sm text-steel-line mt-1">{l.mensagem}</div>}
            </div>
            <form action={marcarAtendido}>
              <input type="hidden" name="id" value={l.id} />
              <input type="hidden" name="atendido" value={String(l.atendido)} />
              <button type="submit" className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${l.atendido ? "bg-card border border-card-line text-steel-line" : "bg-ok/15 text-ok"}`}>
                {l.atendido ? "Reabrir" : "Marcar atendido"}
              </button>
            </form>
          </div>
        ))}
        {(!leads || leads.length === 0) && <p className="text-steel-line text-sm">Nenhum lead ainda.</p>}
      </div>
    </div>
  );
}
