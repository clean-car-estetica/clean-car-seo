export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { criarBeneficio, excluirBeneficio } from "./actions";

export default async function BeneficiosAdminPage() {
  const { data: beneficios, error } = await supabaseAdmin.from("beneficios").select("*").order("pontos_necessarios");

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Benefícios (fidelidade)</h1>
      <p className="text-steel-line text-sm mb-6">
        Cadastre os níveis de benefício do programa de fidelidade. Os pontos que cada serviço vale
        ficam na aba <strong>Serviços</strong>.
      </p>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler `beneficios` ({error.message}). Confirme se rodou o schema.sql atualizado.
        </div>
      )}

      <form action={criarBeneficio} className="bg-card border border-card-line rounded-2xl p-6 grid sm:grid-cols-[1fr_160px_auto] gap-3 mb-8">
        <input name="nome" required placeholder="Ex: 10% off" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        <input name="pontos_necessarios" type="number" required placeholder="Pontos" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        <button type="submit" className="rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Adicionar
        </button>
      </form>

      <div className="grid gap-3">
        {beneficios?.map((b) => (
          <div key={b.id} className="bg-card border border-card-line rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="font-display font-bold text-steel">{b.nome}</span>
              <span className="text-verniz-shine font-bold ml-3">{b.pontos_necessarios} pontos</span>
            </div>
            <form action={excluirBeneficio}>
              <input type="hidden" name="id" value={b.id} />
              <button type="submit" className="text-xs font-bold text-warn hover:underline">Excluir</button>
            </form>
          </div>
        ))}
        {(!beneficios || beneficios.length === 0) && <p className="text-steel-line text-sm">Nenhum benefício cadastrado ainda.</p>}
      </div>
    </div>
  );
}
