export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { importarDadosPadrao, atualizarServico } from "./actions";

export default async function ConteudoPage() {
  const { data: servicos, error } = await supabaseAdmin
    .from("services")
    .select("*")
    .order("nome");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-steel mb-1">Conteúdo</h1>
          <p className="text-steel-line text-sm">Edite texto e imagem de cada serviço sem mexer em código.</p>
        </div>
        <form action={importarDadosPadrao}>
          <button
            type="submit"
            className="rounded-full bg-card border border-card-line px-4 py-2 text-sm font-bold text-steel-line hover:border-verniz hover:text-verniz-shine"
          >
            Importar/atualizar dados padrão
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler a tabela `services` ({error.message}). Confirme se rodou o schema.sql no Supabase.
        </div>
      )}

      {!error && (!servicos || servicos.length === 0) && (
        <div className="bg-card border border-card-line rounded-2xl p-6 text-steel-line text-sm">
          Nenhum serviço cadastrado ainda. Clique em <strong>Importar/atualizar dados padrão</strong> para trazer
          os 13 serviços que já estão no site.
        </div>
      )}

      <div className="grid gap-5">
        {servicos?.map((s) => (
          <form
            key={s.slug}
            action={atualizarServico}
            className="bg-card border border-card-line rounded-2xl p-6 grid md:grid-cols-[160px_1fr] gap-5"
          >
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
              <div className="grid grid-cols-[1fr_140px] gap-3">
                <input
                  name="imagem_url"
                  defaultValue={s.imagem_url}
                  placeholder="URL da imagem"
                  className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
                />
                <input
                  name="preco_desde"
                  type="number"
                  defaultValue={s.preco_desde ?? ""}
                  placeholder="Preço"
                  className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
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
        ))}
      </div>
    </div>
  );
}
