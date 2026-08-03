export const dynamic = "force-dynamic";

import ImageUploader from "@/components/ImageUploader";
import { getCampanha } from "@/lib/site-content";
import { salvarCampanha } from "./actions";

export default async function CampanhaAdminPage() {
  const campanha = await getCampanha();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Campanha (pop-up promocional)</h1>
      <p className="text-steel-line text-sm mb-6">
        Aparece 3 segundos depois de alguém entrar no site. Enquanto estiver ativa, ela substitui o
        pop-up de cupom de primeira visita (só um pop-up aparece por vez).
      </p>

      <form action={salvarCampanha} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-xl">
        <label className="flex items-center gap-2 text-sm font-bold text-steel">
          <input type="checkbox" name="ativo" defaultChecked={campanha.ativo} /> Campanha ativa
        </label>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Título</label>
          <input name="titulo" defaultValue={campanha.titulo} placeholder="Ex: Semana do Cliente — 20% OFF" className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Texto</label>
          <textarea name="texto" defaultValue={campanha.texto} rows={3} placeholder="Descreva a promoção" className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <ImageUploader name="imagem_url" initialUrl={campanha.imagem_url ?? ""} label="Imagem (opcional)" aspect={16 / 9} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Texto do botão</label>
            <input name="texto_botao" defaultValue={campanha.texto_botao} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Link do botão</label>
            <input name="link_botao" defaultValue={campanha.link_botao} placeholder="/beneficios, /orcamento, link do WhatsApp..." className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          </div>
        </div>
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Salvar
        </button>
      </form>
    </div>
  );
}
