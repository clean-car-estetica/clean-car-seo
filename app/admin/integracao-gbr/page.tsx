export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { salvarIntegracaoGbr } from "./actions";

export default async function IntegracaoGbrPage() {
  const { data, error } = await supabaseAdmin.from("gbr_integracao").select("*").eq("id", 1).maybeSingle();

  const temChave = Boolean(data?.api_key);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Integração com o GBR SAS</h1>
      <p className="text-steel-line text-sm mb-6">
        Vínculo com a API do sistema GBR (agendamentos, indicação, fidelidade). Essa chave fica guardada
        de forma protegida — nunca é exposta no site público, só o console (autenticado) tem acesso.
      </p>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler `gbr_integracao` ({error.message}). Confirme se rodou o schema.sql (Fase 11).
        </div>
      )}

      <form action={salvarIntegracaoGbr} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">URL da API do GBR</label>
          <input
            name="api_url"
            defaultValue={data?.api_url ?? ""}
            placeholder="https://www.gbr-sistemas.tec.br/api/..."
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">
            Chave de API (Token) {temChave && <span className="text-ok normal-case font-normal">— já configurada</span>}
          </label>
          <input
            name="api_key"
            type="password"
            placeholder={temChave ? "Deixe em branco pra manter a atual" : "Cole a chave aqui"}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-steel-line">
          <input type="checkbox" name="ativo" defaultChecked={data?.ativo ?? false} /> Integração ativa
        </label>
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Salvar
        </button>
      </form>
    </div>
  );
}
