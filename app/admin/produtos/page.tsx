export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { adicionarProduto, excluirProduto, importarProdutosPadrao } from "./actions";

export default async function ProdutosAdminPage() {
  const { data: produtos, error } = await supabaseAdmin.from("produtos_lista").select("*").order("ordem");

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display font-bold text-3xl text-steel">Produtos que usamos</h1>
        {(!produtos || produtos.length === 0) && (
          <form action={importarProdutosPadrao}>
            <button type="submit" className="rounded-full bg-card border border-card-line px-4 py-2 text-sm font-bold text-steel-line hover:border-verniz hover:text-verniz-shine">
              Importar lista padrão pra editar
            </button>
          </form>
        )}
      </div>
      <p className="text-steel-line text-sm mb-6">Lista de nomes mostrada na home — sem explicar o uso, por segurança.</p>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler `produtos_lista` ({error.message}).
        </div>
      )}

      <form action={adicionarProduto} className="bg-card border border-card-line rounded-2xl p-6 grid sm:grid-cols-[1fr_120px_auto] gap-3 mb-8">
        <input name="nome" required placeholder="Nome do produto" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        <input name="ordem" type="number" defaultValue={produtos?.length ?? 0} placeholder="Ordem" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        <button type="submit" className="rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Adicionar
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {produtos?.map((p) => (
          <form key={p.id} action={excluirProduto} className="flex items-center gap-1 bg-card border border-card-line rounded-full pl-3 pr-1 py-1">
            <span className="text-sm text-steel">{p.nome}</span>
            <input type="hidden" name="id" value={p.id} />
            <button type="submit" className="text-warn text-xs font-bold px-2 hover:underline">×</button>
          </form>
        ))}
        {(!produtos || produtos.length === 0) && <p className="text-steel-line text-sm">Nenhum ainda — usando a lista padrão do site.</p>}
      </div>
    </div>
  );
}
