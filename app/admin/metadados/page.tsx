export const dynamic = "force-dynamic";

import { getMetadados } from "@/lib/site-content";
import { salvarMetadados } from "./actions";

export default async function MetadadosAdminPage() {
  const meta = await getMetadados();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Metadados do site</h1>
      <p className="text-steel-line text-sm mb-6">
        Título e descrição que aparecem no Google e ao compartilhar o link. Não muda nada visual do site.
      </p>

      <form action={salvarMetadados} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-2xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Título (aba do navegador / Google)</label>
          <input name="titulo" defaultValue={meta.titulo} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Descrição</label>
          <textarea name="descricao" defaultValue={meta.descricao} rows={3} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Palavras-chave (separadas por vírgula)</label>
          <textarea name="palavrasChave" defaultValue={meta.palavrasChave} rows={4} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Salvar
        </button>
      </form>
    </div>
  );
}
