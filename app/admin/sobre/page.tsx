export const dynamic = "force-dynamic";

import { getSobre } from "@/lib/site-content";
import { salvarSobre } from "./actions";

export default async function SobreAdminPage() {
  const sobre = await getSobre();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Sobre Nós</h1>
      <p className="text-steel-line text-sm mb-6">Texto da página /sobre.</p>

      <form action={salvarSobre} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-2xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Título</label>
          <input name="titulo" defaultValue={sobre.titulo} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Texto</label>
          <textarea name="texto" defaultValue={sobre.texto} rows={10} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Salvar
        </button>
      </form>
    </div>
  );
}
