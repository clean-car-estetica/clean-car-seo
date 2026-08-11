export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { salvarPasso, excluirPasso, importarPassosPadrao } from "./actions";

export default async function ProcessoAdminPage() {
  const { data: passos, error } = await supabaseAdmin.from("processo_passos").select("*").order("ordem");

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display font-bold text-3xl text-steel">Nosso processo</h1>
        {(!passos || passos.length === 0) && (
          <form action={importarPassosPadrao}>
            <button type="submit" className="rounded-full bg-card border border-card-line px-4 py-2 text-sm font-bold text-steel-line hover:border-verniz hover:text-verniz-shine">
              Importar passos padrão pra editar
            </button>
          </form>
        )}
      </div>
      <p className="text-steel-line text-sm mb-6">Os passos mostrados na seção "Não é só uma lavagem" da home.</p>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler `processo_passos` ({error.message}).
        </div>
      )}

      <form action={salvarPasso} className="bg-card border border-card-line rounded-2xl p-6 grid gap-3 max-w-xl mb-8">
        <input name="titulo" required placeholder="Título do passo" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        <textarea name="texto" required rows={2} placeholder="Descrição" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        <input name="ordem" type="number" defaultValue={passos?.length ?? 0} placeholder="Ordem" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-32" />
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Adicionar passo
        </button>
      </form>

      <div className="grid gap-3">
        {passos?.map((p) => (
          <div key={p.id} className="bg-card border border-card-line rounded-xl p-4">
            <form action={salvarPasso} className="grid gap-2">
              <input type="hidden" name="id" value={p.id} />
              <input
                name="titulo"
                defaultValue={p.titulo}
                className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel font-display font-bold text-sm"
              />
              <textarea
                name="texto"
                defaultValue={p.texto}
                rows={2}
                className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel-line text-sm"
              />
              <div className="flex items-center gap-3">
                <input
                  name="ordem"
                  type="number"
                  defaultValue={p.ordem}
                  className="w-24 px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
                />
                <button type="submit" className="rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm hover:bg-verniz-shine">
                  Salvar
                </button>
              </div>
            </form>
            <form action={excluirPasso} className="mt-2 pt-2 border-t border-card-line">
              <input type="hidden" name="id" value={p.id} />
              <button type="submit" className="text-xs font-bold text-warn hover:underline shrink-0">Excluir</button>
            </form>
          </div>
        ))}
        {(!passos || passos.length === 0) && <p className="text-steel-line text-sm">Nenhum ainda — usando os 5 padrão do site.</p>}
      </div>
    </div>
  );
}
