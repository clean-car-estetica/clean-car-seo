export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { salvarDepoimento, excluirDepoimento, definirVideoCliente } from "./actions";
import { getVideoCliente } from "@/lib/site-content";
import { VIDEO_CLIENTE } from "@/components/VideoCliente";

export default async function DepoimentosAdminPage() {
  const [{ data: depoimentos }, video] = await Promise.all([
    supabaseAdmin.from("depoimentos").select("*").order("ordem"),
    getVideoCliente(),
  ]);
  const base = "px-4 py-1.5 text-sm font-bold transition-colors";

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Depoimentos</h1>
      <p className="text-steel-line text-sm mb-6">
        Copie e cole avaliações reais do seu Perfil da Empresa no Google aqui — não é automático
        (isso exigiria uma API paga do Google), mas leva 30 segundos por avaliação.
      </p>


      {/* Vídeo de cliente: pronto no site, aparece só quando publicado */}
      <div className="bg-card border border-card-line rounded-2xl p-6 max-w-3xl mb-10 flex flex-wrap gap-6 items-start">
        <video src={VIDEO_CLIENTE.src} poster={VIDEO_CLIENTE.capa} controls playsInline preload="none" className="w-40 aspect-[9/16] rounded-xl bg-carbon object-cover" />
        <div className="flex-1 min-w-[220px]">
          <h2 className="font-display font-bold text-xl text-steel">Vídeo da cliente (placa coberta)</h2>
          <p className="text-sm text-steel-line mt-1">
            Aparece na página inicial, antes dos depoimentos do Google, com a frase “Não sei se saiu do lava rápido ou da
            concessionária” e o que ela diz no vídeo. Só publique depois que a cliente autorizar.
          </p>
          <form action={definirVideoCliente} className="mt-4 inline-flex rounded-full border border-card-line overflow-hidden" role="group" aria-label="Status do vídeo">
            <button type="submit" name="status" value="rascunho" disabled={!video.publicado}
              className={`${base} ${!video.publicado ? "bg-steel-line/20 text-steel cursor-default" : "text-steel-line hover:bg-carbon"}`}>
              Fora do site
            </button>
            <button type="submit" name="status" value="publicado" disabled={video.publicado}
              className={`${base} ${video.publicado ? "bg-ok/20 text-ok cursor-default" : "text-steel-line hover:bg-ok/10 hover:text-ok"}`}>
              Publicar no site
            </button>
          </form>
          <p className={`mt-2 text-xs font-bold ${video.publicado ? "text-ok" : "text-steel-line"}`}>
            {video.publicado ? "No ar na página inicial." : "Pronto, aguardando você publicar."}
          </p>
        </div>
      </div>

      <form action={salvarDepoimento} className="bg-card border border-card-line rounded-2xl p-6 grid gap-3 max-w-xl mb-10">
        <input name="autor" placeholder="Nome do cliente (ou 'Cliente Google')" defaultValue="Cliente Google" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        <select name="nota" defaultValue="5" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-32">
          {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrelas</option>)}
        </select>
        <textarea name="texto" required rows={3} placeholder="Texto da avaliação" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        <input name="ordem" type="number" defaultValue={depoimentos?.length ?? 0} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-32" />
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Adicionar depoimento
        </button>
      </form>

      <div className="grid gap-3">
        {depoimentos?.map((d) => (
          <div key={d.id} className="bg-card border border-card-line rounded-xl p-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-display font-bold text-steel">{d.autor} · {d.nota}★</div>
              <p className="text-sm text-steel-line mt-1">{d.texto}</p>
            </div>
            <form action={excluirDepoimento}>
              <input type="hidden" name="id" value={d.id} />
              <button type="submit" className="text-xs font-bold text-warn hover:underline shrink-0">Excluir</button>
            </form>
          </div>
        ))}
        {(!depoimentos || depoimentos.length === 0) && <p className="text-steel-line text-sm">Nenhum ainda — usando os 2 padrão do site.</p>}
      </div>
    </div>
  );
}
