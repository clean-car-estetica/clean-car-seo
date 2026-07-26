export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { salvarPasso, excluirPasso } from "./actions";

export default async function ProcessoAdminPage() {
  const { data: passos, error } = await supabaseAdmin.from("processo_passos").select("*").order("ordem");

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Nosso processo</h1>
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display font-bold text-steel">{p.titulo}</div>
                <div className="text-sm text-steel-line mt-1">{p.texto}</div>
              </div>
              <form action={excluirPasso}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="text-xs font-bold text-warn hover:underline shrink-0">Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {(!passos || passos.length === 0) && <p className="text-steel-line text-sm">Nenhum ainda — usando os 5 padrão do site.</p>}
      </div>
    </div>
  );
}
