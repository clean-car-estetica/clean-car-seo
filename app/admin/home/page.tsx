export const dynamic = "force-dynamic";

import ImageUploader from "@/components/ImageUploader";
import VideoUploader from "@/components/VideoUploader";
import { getHeroContent } from "@/lib/site-content";
import { salvarHero } from "./actions";

export default async function HomeAdminPage() {
  const hero = await getHeroContent();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Home</h1>
      <p className="text-steel-line text-sm mb-6">Edite o texto e o fundo do topo da página inicial (vídeo ou foto).</p>

      <form action={salvarHero} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-2xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Selo (badge)</label>
          <input
            name="badge_texto"
            defaultValue={hero.badge_texto}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Título (parte normal)</label>
            <input
              name="titulo_parte1"
              defaultValue={hero.titulo_parte1}
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Título (parte destacada)</label>
            <input
              name="titulo_destaque"
              defaultValue={hero.titulo_destaque}
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Subtítulo</label>
          <textarea
            name="subtitulo"
            defaultValue={hero.subtitulo}
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <fieldset className="grid gap-2">
          <legend className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Fundo do topo</legend>
          <label className="flex items-center gap-2 text-sm text-steel">
            <input type="radio" name="tipo_midia" value="video" defaultChecked={hero.tipo_midia !== "imagem"} /> Vídeo (a foto abaixo aparece enquanto o vídeo carrega)
          </label>
          <label className="flex items-center gap-2 text-sm text-steel">
            <input type="radio" name="tipo_midia" value="imagem" defaultChecked={hero.tipo_midia === "imagem"} /> Só a foto
          </label>
        </fieldset>
        <VideoUploader name="video_url" initialUrl={hero.video_url} label="Vídeo do computador (horizontal)" dica="10 a 20 segundos, sem som, deitado (16:9). Até 50 MB; 720p já fica ótimo." />
        <VideoUploader name="video_mobile_url" initialUrl={hero.video_mobile_url} label="Vídeo do celular (em pé) — opcional" dica="Gravado em pé (9:16). Se ficar vazio, o celular usa o vídeo do computador." />
        <ImageUploader name="imagem_url" initialUrl={hero.imagem_url} label="Foto do topo" aspect={21 / 9} specTexto="1600x685px (proporção 21:9, bem larga) — fica atrás do texto, prefira fotos com espaço vazio à esquerda" />
        <button
          type="submit"
          className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine mt-2"
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
