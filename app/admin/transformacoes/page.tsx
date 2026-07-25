export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import FormularioTransformacao from "@/components/FormularioTransformacao";
import { excluirTransformacao } from "./actions";

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
        <div className="mt-4">
          <FormularioTransformacao
            item={{ titulo: "", descricao: "", imagem_antes: "", imagem_depois: "", ordem: itens?.length ?? 0 }}
            textoBotao="Adicionar"
          />
        </div>
      </details>

      {!error && (!itens || itens.length === 0) && (
        <p className="text-steel-line text-sm mb-6">
          Nenhum ainda — o site está usando 2 exemplos padrão com fotos de banco. Adicione os seus pra substituir.
        </p>
      )}

      {!error && itens && itens.length > 0 && (
        <h2 className="font-display font-bold text-lg text-steel mb-4">
          Itens cadastrados ({itens.length})
        </h2>
      )}

      <div className="grid gap-5">
        {itens?.map((t) => (
          <div key={t.id} className="bg-card border border-card-line rounded-2xl p-6">
            <FormularioTransformacao item={t} textoBotao="Salvar" />
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
