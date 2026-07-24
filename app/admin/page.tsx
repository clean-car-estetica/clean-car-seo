export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { Eye, MessageCircle, CalendarCheck, FileText } from "lucide-react";

function Card({ label, value, icon: Icon }: { label: string; value: number | string; icon: any }) {
  return (
    <div className="bg-card border border-card-line rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wide text-steel-line">{label}</span>
        <Icon size={18} className="text-verniz-shine" />
      </div>
      <div className="font-display font-extrabold text-3xl text-steel">{value}</div>
    </div>
  );
}

export default async function Dashboard() {
  const desde = new Date();
  desde.setDate(desde.getDate() - 30);

  let erro: string | null = null;
  let porTipo: Record<string, number> = {};
  let topPaginas: { page_path: string; total: number }[] = [];

  try {
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("event_type, page_path")
      .gte("created_at", desde.toISOString());

    if (error) throw error;

    for (const row of data ?? []) {
      porTipo[row.event_type] = (porTipo[row.event_type] ?? 0) + 1;
    }

    const contagemPorPagina: Record<string, number> = {};
    for (const row of data ?? []) {
      if (row.event_type !== "pageview") continue;
      contagemPorPagina[row.page_path] = (contagemPorPagina[row.page_path] ?? 0) + 1;
    }
    topPaginas = Object.entries(contagemPorPagina)
      .map(([page_path, total]) => ({ page_path, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  } catch (e: any) {
    erro = e?.message ?? "Erro ao consultar o Supabase.";
  }

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Dashboard</h1>
      <p className="text-steel-line text-sm mb-8">Últimos 30 dias</p>

      {erro && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-8 text-sm">
          Não consegui ler os dados do Supabase ({erro}). Confirme se rodou o
          <code className="mx-1 px-1 bg-black/30 rounded">supabase/schema.sql</code>
          e se as variáveis de ambiente estão configuradas na Vercel.
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        <Card label="Visitas" value={porTipo["pageview"] ?? 0} icon={Eye} />
        <Card label="Cliques WhatsApp" value={porTipo["click_whatsapp"] ?? 0} icon={MessageCircle} />
        <Card label="Cliques Agendar" value={porTipo["click_agendar"] ?? 0} icon={CalendarCheck} />
        <Card label="Formulários enviados" value={porTipo["form_submit"] ?? 0} icon={FileText} />
      </div>

      <div className="bg-card border border-card-line rounded-2xl p-6">
        <h2 className="font-display font-bold text-lg text-steel mb-4">Páginas mais visitadas</h2>
        {topPaginas.length === 0 ? (
          <p className="text-steel-line text-sm">Sem dados ainda — assim que o site receber visitas, aparece aqui.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {topPaginas.map((p) => (
                <tr key={p.page_path} className="border-t border-card-line">
                  <td className="py-2 text-steel-line">{p.page_path}</td>
                  <td className="py-2 text-right font-bold text-steel">{p.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
