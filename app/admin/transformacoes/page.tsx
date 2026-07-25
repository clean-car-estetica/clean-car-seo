export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import ImageUploader from "@/components/ImageUploader";
import { salvarTransformacao, excluirTransformacao } from "./actions";

export default async function TransformacoesAdminPage() {
  const { data: itens, error } = await supabaseAdmin.from("transformacoes").select("*").order("ordem");

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Antes e depois</h1>
      <p className="text-steel-line text-sm mb-6">
        As fotos e textos do bloco "Arraste e veja a transformação" da home. Envie fotos reais dos seus trabalhos.
      </p>

      {error && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 mb-6 text-sm">
          Não consegui ler `transformacoes` ({error.message}). Confirme se rodou o schema.sql (tabela de Fase 2.5).
        </div>
      )}

      <details className="bg-card border border-card-line rounded-2xl p-6 mb-8">
        <summary className="font-display font-bold text-steel cursor-pointer">+ Adicionar antes/depois</summary>
        <form action={salvarTransformacao} className="grid gap-4 mt-4">
          <input name="titulo" required placeholder="Título (ex: Correção de verniz e espelhamento)" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <textarea name="descricao" required rows={2} placeholder="Descrição curta" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <div className="grid sm:grid-cols-2 gap-4">
            <ImageUploader name="imagem_antes" label="Foto de ANTES" />
            <ImageUploader name="imagem_depois" label="Foto de DEPOIS" />
          </div>
          <input name="ordem" type="number" defaultValue={itens?.length ?? 0} placeholder="Ordem" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-32" />
          <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
            Adicionar
          </button>
        </form>
      </details>

      {!error && (!itens || itens.length === 0) && (
        <p className="text-steel-line text-sm mb-6">
          Nenhum ainda — o site está usando 2 exemplos padrão com fotos de banco. Adicione os seus pra substituir.
        </p>
      )}

      {!error && itens && itens.length > 0 && (
        <h2 className="font-display font-bold text-lg text-steel mb-4">
          Itens cadastrados ({itens.length}) — clique nos campos abaixo pra editar
        </h2>
      )}

      <div className="grid gap-5">
        {itens?.map((t) => (
          <div key={t.id} className="bg-card border border-card-line rounded-2xl p-6">
            <form action={salvarTransformacao} className="grid gap-4">
              <input type="hidden" name="id" value={t.id} />
              <input name="titulo" defaultValue={t.titulo} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel font-display font-bold text-sm" />
              <textarea name="descricao" defaultValue={t.descricao} rows={2} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
              <div className="grid sm:grid-cols-2 gap-4">
                <ImageUploader name="imagem_antes" initialUrl={t.imagem_antes} label="Foto de ANTES" />
                <ImageUploader name="imagem_depois" initialUrl={t.imagem_depois} label="Foto de DEPOIS" />
              </div>
              <input name="ordem" type="number" defaultValue={t.ordem} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-32" />
              <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
                Salvar
              </button>
            </form>
            <form action={excluirTransformacao} className="mt-3 pt-3 border-t border-card-line">
              <input type="hidden" name="id" value={t.id} />
              <button type="submit" className="text-xs font-bold text-warn hover:underline">Excluir</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
