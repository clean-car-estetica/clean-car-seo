export const dynamic = "force-dynamic";

import ImageUploader from "@/components/ImageUploader";
import AvisoCampanha from "@/components/admin/AvisoCampanha";
import { getCampanha } from "@/lib/site-content";
import { salvarCampanha, desligarCampanha } from "./actions";

const campo = "w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm";
const rotulo = "block text-xs font-bold uppercase tracking-wide text-steel-line mb-1";
const dica = "text-xs text-steel-line/80 mt-1";

export default async function CampanhaAdminPage() {
  const c = await getCampanha();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Campanha do mês</h1>
      <p className="text-steel-line text-sm mb-6 max-w-2xl">
        Aparece em destaque logo abaixo do topo da página inicial e como pop-up nas outras páginas. No dia seguinte à
        data de fim, <strong className="text-steel">sai do site sozinha</strong> e o console avisa para cadastrar a próxima.
      </p>

      <AvisoCampanha campanha={c} />

      <form action={salvarCampanha} className="bg-card border border-card-line rounded-2xl p-6 grid gap-5 max-w-2xl">
        <label className="flex items-center gap-2 text-sm font-bold text-steel">
          <input type="checkbox" name="ativo" defaultChecked={c.ligada} className="accent-verniz" /> Campanha no ar
        </label>
        <div className="grid sm:grid-cols-[2fr_1fr] gap-4">
          <div>
            <label className={rotulo}>Nome da campanha</label>
            <input name="titulo" defaultValue={c.titulo} placeholder="Ex.: Primavera Clean Car" className={campo} />
          </div>
          <div>
            <label className={rotulo}>Selo grande</label>
            <input name="selo" defaultValue={c.selo} placeholder="Ex.: 20% OFF" className={campo} />
          </div>
        </div>
        <div>
          <label className={rotulo}>Texto</label>
          <textarea name="texto" defaultValue={c.texto} rows={3} placeholder="O que está em promoção e o que a pessoa ganha" className={campo} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={rotulo}>Preço normal (R$)</label>
            <input name="preco_de" inputMode="decimal" defaultValue={c.preco_de ?? ""} placeholder="420" className={campo} />
          </div>
          <div>
            <label className={rotulo}>Preço na campanha (R$)</label>
            <input name="preco_por" inputMode="decimal" defaultValue={c.preco_por ?? ""} placeholder="336" className={campo} />
            <p className={dica}>Vazio = não mostra preço.</p>
          </div>
          <div>
            <label className={rotulo}>Último dia</label>
            <input name="termina_em" type="date" defaultValue={c.termina_em ?? ""} className={campo} />
          </div>
        </div>
        <ImageUploader name="imagem_url" initialUrl={c.imagem_url ?? ""} label="Foto (de preferência um antes e depois, sem texto escrito)" aspect={4 / 3} specTexto="1200x900px (4:3)" nomeArquivo={c.titulo || "campanha"} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={rotulo}>Texto do botão</label>
            <input name="texto_botao" defaultValue={c.texto_botao} className={campo} />
          </div>
          <div>
            <label className={rotulo}>Link do botão (opcional)</label>
            <input name="link_botao" defaultValue={c.link_botao} placeholder="vazio = WhatsApp citando a campanha" className={campo} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">Salvar</button>
        </div>
      </form>

      {c.ligada && (
        <form action={desligarCampanha} className="mt-4">
          <button type="submit" className="text-sm font-bold text-warn hover:underline">Tirar do ar agora</button>
        </form>
      )}
    </div>
  );
}
