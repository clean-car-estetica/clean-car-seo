export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { importarDadosPadrao, atualizarOrdemPadrao, atualizarServico, criarServico, excluirServico } from "./actions";
import ImageUploader from "@/components/ImageUploader";

export default async function ConteudoPage() {
  const { data: servicos, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .order("nome");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-steel mb-1">Serviços</h1>
          <p className="text-steel-line text-sm">Edite, crie ou remova serviços sem mexer em código.</p>
        </div>
        <div className="flex gap-2">
          <form action={atualizarOrdemPadrao}>
            <button
              type="submit"
              className="rounded-full bg-verniz text-carbon px-4 py-2 text-sm font-bold hover:bg-verniz-shine"
            >
              Aplicar nova ordem de exibição
            </button>
          </form>
          <form action={importarDadosPadrao}>
            <button
              type="submit"
              className="rounded-full bg-card border border-card-line px-4 py-2 text-sm font-bold text-steel-line hover:border-verniz hover:text-verniz-shine"
            >
              Importar serviços que faltam
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler a tabela `services` ({error.message}). Confirme se rodou o schema.sql no Supabase.
        </div>
      )}

      <details className="bg-card border border-card-line rounded-2xl p-6 mb-8">
        <summary className="font-display font-bold text-steel cursor-pointer">+ Criar novo serviço</summary>
        <form action={criarServico} className="grid gap-3 max-w-xl mt-4">
          <input name="nome" required placeholder="Nome do serviço" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <input name="resumo" placeholder="Resumo curto" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <textarea name="descricao" rows={2} placeholder="Descrição" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <input name="pontos_fidelidade" type="number" placeholder="Pontos de fidelidade" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-48" />
          <input name="termo_popular" placeholder="Termo popular de busca (ex: Lavagem de Carro)" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <input name="ordem" type="number" placeholder="Ordem de exibição (menor = aparece primeiro)" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-64" />
          <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
            Criar serviço
          </button>
        </form>
      </details>

      {!error && (!servicos || servicos.length === 0) && (
        <div className="bg-card border border-card-line rounded-2xl p-6 text-steel-line text-sm">
          Nenhum serviço cadastrado ainda. Clique em <strong>Importar serviços que faltam</strong> para trazer
          os 13 serviços que já estão no site.
        </div>
      )}

      <div className="grid gap-5">
        {servicos?.map((s) => (
          <div key={s.slug} className="bg-card border border-card-line rounded-2xl p-6">
            <form action={atualizarServico} className="grid md:grid-cols-[160px_1fr] gap-5">
              <input type="hidden" name="slug" value={s.slug} />
              <img src={s.imagem_url} alt={s.nome} className="w-full h-32 object-cover rounded-xl" />
              <div className="grid gap-3">
                <input
                  name="nome"
                  defaultValue={s.nome}
                  className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel font-display font-bold"
                />
                <input
                  name="resumo"
                  defaultValue={s.resumo}
                  className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
                />
                <textarea
                  name="descricao"
                  defaultValue={s.descricao}
                  rows={2}
                  className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
                />
                <div className="grid grid-cols-[1fr_140px] gap-3 items-end">
                  <ImageUploader name="imagem_url" initialUrl={s.imagem_url} label="Foto do serviço" aspect={3 / 2} specTexto="1200x800px (proporção 3:2) — aparece em card e como banner da página do serviço" />
                  <input
                    name="preco_desde"
                    type="number"
                    defaultValue={s.preco_desde ?? ""}
                    placeholder="Preço"
                    className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Pontos de fidelidade</label>
                    <input
                      name="pontos_fidelidade"
                      type="number"
                      defaultValue={s.pontos_fidelidade ?? 0}
                      className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Ordem (menor = primeiro)</label>
                    <input
                      name="ordem"
                      type="number"
                      defaultValue={s.ordem ?? 0}
                      className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Termo popular de busca (título/SEO)</label>
                  <input
                    name="termo_popular"
                    defaultValue={s.termo_popular ?? ""}
                    placeholder="Ex: Lavagem de Carro"
                    className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine"
                >
                  Salvar
                </button>
              </div>
            </form>
            <form action={excluirServico} className="mt-3 pt-3 border-t border-card-line">
              <input type="hidden" name="slug" value={s.slug} />
              <button type="submit" className="text-xs font-bold text-warn hover:underline">
                Excluir este serviço
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
