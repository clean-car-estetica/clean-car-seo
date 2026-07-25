export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { salvarPlano, excluirPlano } from "./actions";

export default async function PlanosAdminPage() {
  const { data: planos, error } = await supabaseAdmin.from("planos").select("*").order("ordem");

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Planos mensais</h1>
      <p className="text-steel-line text-sm mb-6">
        Cadastre seus planos de assinatura aqui. A seção só aparece no site quando tiver pelo menos um.
      </p>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler `planos` ({error.message}). Confirme se rodou o schema.sql (Fase 8).
        </div>
      )}

      <details className="bg-card border border-card-line rounded-2xl p-6 mb-8">
        <summary className="font-display font-bold text-steel cursor-pointer">+ Adicionar plano</summary>
        <form action={salvarPlano} className="grid gap-3 mt-4 max-w-xl">
          <input name="nome" required placeholder="Nome do plano (ex: Plano Manutenção)" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <input name="preco" type="number" step="0.01" required placeholder="Preço mensal (R$)" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <textarea name="descricao" rows={2} placeholder="Descrição curta" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <textarea name="itens" rows={4} placeholder={"O que está incluído, um item por linha:\n2 lavagens completas por mês\nDesconto de 10% em serviços extras"} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-steel-line">
              <input type="checkbox" name="destaque" /> Destacar como "mais popular"
            </label>
            <input name="ordem" type="number" defaultValue={planos?.length ?? 0} placeholder="Ordem" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-28" />
          </div>
          <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
            Adicionar plano
          </button>
        </form>
      </details>

      <div className="grid gap-5">
        {planos?.map((p) => (
          <div key={p.id} className="bg-card border border-card-line rounded-2xl p-6">
            <form action={salvarPlano} className="grid gap-3 max-w-xl">
              <input type="hidden" name="id" value={p.id} />
              <input name="nome" defaultValue={p.nome} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel font-display font-bold text-sm" />
              <input name="preco" type="number" step="0.01" defaultValue={p.preco} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
              <textarea name="descricao" defaultValue={p.descricao} rows={2} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
              <textarea name="itens" defaultValue={p.itens?.join("\n")} rows={4} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-steel-line">
                  <input type="checkbox" name="destaque" defaultChecked={p.destaque} /> Destacar como "mais popular"
                </label>
                <input name="ordem" type="number" defaultValue={p.ordem} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-28" />
              </div>
              <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
                Salvar
              </button>
            </form>
            <form action={excluirPlano} className="mt-3 pt-3 border-t border-card-line">
              <input type="hidden" name="id" value={p.id} />
              <button type="submit" className="text-xs font-bold text-warn hover:underline">Excluir</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
