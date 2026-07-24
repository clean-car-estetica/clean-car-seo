export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { cidades } from "@/lib/data";
import { registrarPosicao } from "./actions";

export default async function PalavrasChavePage() {
  const { data: registros, error } = await supabaseAdmin
    .from("keyword_rankings")
    .select("*")
    .order("checked_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Palavras-chave</h1>
      <p className="text-steel-line text-sm mb-6">
        O Google não libera posição em tempo real — registre manualmente aqui toda vez que checar
        (ex: pesquisando no modo anônimo). No futuro dá pra automatizar com uma API paga de rastreamento.
      </p>

      <form action={registrarPosicao} className="bg-card border border-card-line rounded-2xl p-6 grid md:grid-cols-[1fr_180px_120px_120px] gap-3 mb-8">
        <input
          name="keyword"
          required
          placeholder="Ex: vitrificação em Suzano"
          className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
        />
        <select name="city_slug" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm">
          <option value="">Sem cidade</option>
          {cidades.map((c) => (
            <option key={c.slug} value={c.slug}>{c.nome}</option>
          ))}
        </select>
        <input
          name="posicao"
          type="number"
          placeholder="Posição"
          className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
        />
        <button type="submit" className="rounded-full bg-verniz text-carbon font-display font-bold px-4 py-2 text-sm hover:bg-verniz-shine">
          Registrar
        </button>
      </form>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler `keyword_rankings` ({error.message}). Confirme se rodou o schema.sql.
        </div>
      )}

      <div className="bg-card border border-card-line rounded-2xl p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-steel-line text-xs uppercase tracking-wide">
              <th className="pb-2">Palavra-chave</th>
              <th className="pb-2">Cidade</th>
              <th className="pb-2">Posição</th>
              <th className="pb-2">Data</th>
            </tr>
          </thead>
          <tbody>
            {registros?.map((r) => (
              <tr key={r.id} className="border-t border-card-line">
                <td className="py-2 text-steel">{r.keyword}</td>
                <td className="py-2 text-steel-line">{cidades.find((c) => c.slug === r.city_slug)?.nome ?? "—"}</td>
                <td className="py-2 font-bold text-verniz-shine">{r.posicao ?? "—"}</td>
                <td className="py-2 text-steel-line">{r.checked_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!registros || registros.length === 0) && !error && (
          <p className="text-steel-line text-sm">Nenhum registro ainda.</p>
        )}
      </div>
    </div>
  );
}
