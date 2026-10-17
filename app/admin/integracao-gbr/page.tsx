export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { salvarIntegracaoGbr } from "./actions";
import { salvarVinculosGbr, atualizarAgoraGbr } from "./sync-actions";
import { getServicosSas, getFuncionamentoSas, getVinculos, casarServicos, limparNome, duracaoSite, linhasSemana, linhasExcecoes } from "@/lib/gbr-sync";

export default async function IntegracaoGbrPage() {
  const { data, error } = await supabaseAdmin.from("gbr_integracao").select("*").eq("id", 1).maybeSingle();

  const temChave = Boolean(data?.api_key);

  // 17/10/2026: o que o site está recebendo do SAS agora.
  const [sas, func, vinculos, { data: servicosSite }] = await Promise.all([
    getServicosSas(),
    getFuncionamentoSas(),
    getVinculos(),
    supabaseAdmin.from("services").select("slug, nome").order("ordem"),
  ]);
  const casados = sas && servicosSite ? casarServicos(servicosSite, sas, vinculos) : new Map();

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

      <div className="max-w-3xl mt-10 grid gap-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display font-bold text-2xl text-steel">O que vem do sistema</h2>
            <p className="text-steel-line text-sm">Mudou no SAS? O site atualiza sozinho em até 5 minutos. Com pressa, clique em atualizar.</p>
          </div>
          <form action={atualizarAgoraGbr}>
            <button type="submit" className="rounded-full border border-verniz text-verniz-shine font-display font-bold px-5 py-2 text-sm hover:bg-verniz hover:text-carbon">
              Atualizar agora
            </button>
          </form>
        </div>

        {!sas && !func && (
          <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 text-sm">
            Não consegui falar com o SAS (integração desligada, chave errada ou sistema fora do ar). O site está usando o que foi
            cadastrado aqui no console.
          </div>
        )}

        {func && (
          <div className="bg-card border border-card-line rounded-2xl p-6 text-sm text-steel">
            <div className="font-display font-bold text-steel mb-2">Horário e leva e traz</div>
            {func.configurado ? (
              <>
                {linhasSemana(func.semana).map((l) => <p key={l} className="text-steel-line">{l}</p>)}
                {func.excecoes.length > 0 && (
                  <p className="text-steel-line mt-2">Datas especiais: {linhasExcecoes(func.excecoes, 8).join(" · ")}</p>
                )}
              </>
            ) : (
              <p className="text-steel-line">Horário não cadastrado no SAS — o site usa o de Contato e endereço.</p>
            )}
            <p className="text-steel-line mt-2">Leva e traz: <b className="text-steel">{func.levaTras.disponivel ? "ativo" : "pausado"}</b></p>
            <p className="text-xs text-steel-line mt-3">Feriados, horários especiais e o botão “Fechar a loja agora” ficam no sistema, em Admin › Regras.</p>
          </div>
        )}

        {sas && servicosSite && (
          <form action={salvarVinculosGbr} className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
            <div>
              <div className="font-display font-bold text-steel">Serviços do site × serviços do sistema</div>
              <p className="text-xs text-steel-line mt-1">
                Nome, preço, duração, destaque e pausa vêm do serviço ligado. Por padrão o site liga pelo nome; troque aqui se o nome
                for diferente nos dois. Foto e textos continuam em Serviços.
              </p>
            </div>
            {servicosSite.map((s) => {
              const v = casados.get(s.slug);
              const escolhido = vinculos[s.slug] ?? "";
              return (
                <div key={s.slug} className="grid sm:grid-cols-[1fr_1.3fr] gap-2 items-center border-t border-card-line pt-3">
                  <div>
                    <div className="text-steel font-bold text-sm">{s.nome}</div>
                    <div className="text-xs text-steel-line">
                      {v ? `${v.preco == null ? "sob avaliação" : `R$ ${v.preco}`}${duracaoSite(v.duracao) ? ` · ${duracaoSite(v.duracao)}` : ""}${v.ativo ? "" : " · pausado (fora do site)"}` : "sem vínculo — usa o cadastro do site"}
                    </div>
                  </div>
                  <select name={`vinculo:${s.slug}`} defaultValue={escolhido} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm">
                    <option value="">Automático (pelo nome){!escolhido && v ? ` — ${limparNome(v.nome)}` : ""}</option>
                    {sas.map((x) => (
                      <option key={x.id} value={x.id}>{limparNome(x.nome)}{x.ativo ? "" : " (pausado)"}</option>
                    ))}
                    <option value="nenhum">Não sincronizar este serviço</option>
                  </select>
                </div>
              );
            })}
            <button type="submit" className="justify-self-start mt-2 rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
              Salvar vínculos
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
