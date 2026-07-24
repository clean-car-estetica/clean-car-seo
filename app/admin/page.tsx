export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { cidades, servicos } from "@/lib/data";
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

function calcularPeriodo(periodo: string, inicioParam?: string, fimParam?: string) {
  const agora = new Date();
  let inicio = new Date();
  let fim = agora;

  switch (periodo) {
    case "hoje":
      inicio.setHours(0, 0, 0, 0);
      break;
    case "7d":
      inicio.setDate(agora.getDate() - 7);
      break;
    case "mes":
      inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
      break;
    case "personalizado":
      if (inicioParam) inicio = new Date(inicioParam + "T00:00:00");
      if (fimParam) fim = new Date(fimParam + "T23:59:59");
      break;
    case "30d":
    default:
      inicio.setDate(agora.getDate() - 30);
      break;
  }
  return { inicio, fim };
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string; inicio?: string; fim?: string }>;
}) {
  const sp = await searchParams;
  const periodo = sp.periodo || "30d";
  const { inicio, fim } = calcularPeriodo(periodo, sp.inicio, sp.fim);

  let erro: string | null = null;
  let porTipo: Record<string, number> = {};
  let topPaginas: { page_path: string; total: number }[] = [];
  let porCidade: Record<string, { visitas: number; whatsapp: number; agendar: number }> = {};
  let porServico: Record<string, { visitas: number; whatsapp: number; agendar: number }> = {};
  let recentes: { created_at: string; event_type: string; page_path: string; service_slug: string | null; city_slug: string | null }[] = [];

  try {
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("event_type, page_path, city_slug, service_slug, created_at")
      .gte("created_at", inicio.toISOString())
      .lte("created_at", fim.toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    for (const row of data ?? []) {
      porTipo[row.event_type] = (porTipo[row.event_type] ?? 0) + 1;

      const cidadeKey = row.city_slug ?? "sem-cidade";
      if (!porCidade[cidadeKey]) porCidade[cidadeKey] = { visitas: 0, whatsapp: 0, agendar: 0 };
      if (row.event_type === "pageview") porCidade[cidadeKey].visitas++;
      if (row.event_type === "click_whatsapp") porCidade[cidadeKey].whatsapp++;
      if (row.event_type === "click_agendar") porCidade[cidadeKey].agendar++;

      const servicoKey = row.service_slug ?? "sem-servico";
      if (!porServico[servicoKey]) porServico[servicoKey] = { visitas: 0, whatsapp: 0, agendar: 0 };
      if (row.event_type === "pageview") porServico[servicoKey].visitas++;
      if (row.event_type === "click_whatsapp") porServico[servicoKey].whatsapp++;
      if (row.event_type === "click_agendar") porServico[servicoKey].agendar++;
    }

    recentes = (data ?? []).slice(0, 30);

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

  const periodos = [
    { valor: "hoje", label: "Hoje" },
    { valor: "7d", label: "7 dias" },
    { valor: "30d", label: "30 dias" },
    { valor: "mes", label: "Este mês" },
    { valor: "personalizado", label: "Personalizado" },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Dashboard</h1>
      <p className="text-steel-line text-sm mb-6">
        {inicio.toLocaleDateString("pt-BR")} até {fim.toLocaleDateString("pt-BR")}
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        {periodos.map((p) => (
          <Link
            key={p.valor}
            href={`/admin?periodo=${p.valor}`}
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              periodo === p.valor ? "bg-verniz text-carbon" : "bg-card border border-card-line text-steel-line hover:text-verniz-shine"
            }`}
          >
            {p.label}
          </Link>
        ))}
        <form method="GET" className="flex items-center gap-2 ml-2">
          <input type="hidden" name="periodo" value="personalizado" />
          <input type="date" name="inicio" defaultValue={sp.inicio} className="px-2 py-2 rounded-lg bg-card border border-card-line text-steel text-xs" />
          <span className="text-steel-line text-xs">até</span>
          <input type="date" name="fim" defaultValue={sp.fim} className="px-2 py-2 rounded-lg bg-card border border-card-line text-steel text-xs" />
          <button type="submit" className="px-3 py-2 rounded-lg bg-card border border-card-line text-xs font-bold text-steel-line hover:text-verniz-shine">
            Aplicar
          </button>
        </form>
      </div>

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

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="bg-card border border-card-line rounded-2xl p-6">
          <h2 className="font-display font-bold text-lg text-steel mb-4">Por cidade</h2>
          {Object.keys(porCidade).length === 0 ? (
            <p className="text-steel-line text-sm">Sem dados neste período.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-steel-line text-xs uppercase tracking-wide">
                  <th className="pb-2">Cidade</th>
                  <th className="pb-2 text-right">Visitas</th>
                  <th className="pb-2 text-right">WhatsApp</th>
                  <th className="pb-2 text-right">Agendar</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(porCidade).map(([slug, v]) => (
                  <tr key={slug} className="border-t border-card-line">
                    <td className="py-2 text-steel-line">
                      {slug === "sem-cidade" ? "Sem cidade (home/blog/pilar)" : cidades.find((c) => c.slug === slug)?.nome ?? slug}
                    </td>
                    <td className="py-2 text-right text-steel">{v.visitas}</td>
                    <td className="py-2 text-right text-steel">{v.whatsapp}</td>
                    <td className="py-2 text-right text-steel">{v.agendar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6">
          <h2 className="font-display font-bold text-lg text-steel mb-4">Por serviço</h2>
          {Object.keys(porServico).length === 0 ? (
            <p className="text-steel-line text-sm">Sem dados neste período.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-steel-line text-xs uppercase tracking-wide">
                  <th className="pb-2">Serviço</th>
                  <th className="pb-2 text-right">Visitas</th>
                  <th className="pb-2 text-right">WhatsApp</th>
                  <th className="pb-2 text-right">Agendar</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(porServico).map(([slug, v]) => (
                  <tr key={slug} className="border-t border-card-line">
                    <td className="py-2 text-steel-line">
                      {slug === "sem-servico" ? "Sem serviço (home/blog)" : servicos.find((s) => s.slug === slug)?.nome ?? slug}
                    </td>
                    <td className="py-2 text-right text-steel">{v.visitas}</td>
                    <td className="py-2 text-right text-steel">{v.whatsapp}</td>
                    <td className="py-2 text-right text-steel">{v.agendar}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border border-card-line rounded-2xl p-6">
          <h2 className="font-display font-bold text-lg text-steel mb-4">Páginas mais visitadas</h2>
          {topPaginas.length === 0 ? (
            <p className="text-steel-line text-sm">Sem dados neste período.</p>
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

        <div className="bg-card border border-card-line rounded-2xl p-6">
          <h2 className="font-display font-bold text-lg text-steel mb-4">Últimos eventos</h2>
          {recentes.length === 0 ? (
            <p className="text-steel-line text-sm">Sem eventos neste período.</p>
          ) : (
            <div className="max-h-80 overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-steel-line uppercase tracking-wide sticky top-0 bg-card">
                    <th className="pb-2">Quando</th>
                    <th className="pb-2">Tipo</th>
                    <th className="pb-2">Página</th>
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((r, i) => (
                    <tr key={i} className="border-t border-card-line">
                      <td className="py-1.5 text-steel-line whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="py-1.5 text-steel-line">{r.event_type}</td>
                      <td className="py-1.5 text-steel">{r.page_path}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
