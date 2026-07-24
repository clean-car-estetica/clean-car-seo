export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { criarCidade, atualizarCidade, excluirCidade } from "./actions";

export default async function CidadesPage() {
  const { data: cidades, error } = await supabaseAdmin.from("cities").select("*").order("nome");

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Cidades</h1>
      <p className="text-steel-line text-sm mb-6">
        Cada cidade × cada serviço gera uma página de SEO local automaticamente. Marque "Sede" só
        para a cidade onde fica a loja física.
      </p>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler a tabela `cities` ({error.message}).
        </div>
      )}

      <details className="bg-card border border-card-line rounded-2xl p-6 mb-8">
        <summary className="font-display font-bold text-steel cursor-pointer">+ Adicionar cidade</summary>
        <form action={criarCidade} className="grid gap-3 max-w-xl mt-4">
          <input name="nome" required placeholder="Nome da cidade" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <input name="bairros" placeholder="Bairros, separados por vírgula" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <label className="flex items-center gap-2 text-sm text-steel-line">
            <input type="checkbox" name="sede" /> Esta é a cidade da loja física (sede)
          </label>
          <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
            Adicionar
          </button>
        </form>
      </details>

      {!error && (!cidades || cidades.length === 0) && (
        <p className="text-steel-line text-sm mb-6">Nenhuma cidade cadastrada — use "Importar dados padrão" na aba Serviços.</p>
      )}

      <div className="grid gap-4">
        {cidades?.map((c) => (
          <div key={c.slug} className="bg-card border border-card-line rounded-2xl p-6">
            <form action={atualizarCidade} className="grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
              <input type="hidden" name="slug" value={c.slug} />
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Nome</label>
                <input name="nome" defaultValue={c.nome} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Bairros</label>
                <input name="bairros" defaultValue={c.bairros?.join(", ")} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm text-steel-line whitespace-nowrap">
                <input type="checkbox" name="sede" defaultChecked={c.sede} /> Sede
              </label>
              <button type="submit" className="rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm hover:bg-verniz-shine">
                Salvar
              </button>
            </form>
            <form action={excluirCidade} className="mt-3 pt-3 border-t border-card-line">
              <input type="hidden" name="slug" value={c.slug} />
              <button type="submit" className="text-xs font-bold text-warn hover:underline">
                Excluir esta cidade
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
