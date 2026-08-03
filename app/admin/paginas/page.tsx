export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import ImageUploader from "@/components/ImageUploader";
import { salvarPagina, excluirPagina } from "./actions";

export default async function PaginasAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const sp = await searchParams;
  const { data: paginas } = await supabaseAdmin.from("paginas_customizadas").select("*").order("criado_em", { ascending: false });
  const editando = sp.editar ? paginas?.find((p) => p.slug === sp.editar) : null;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Páginas personalizadas</h1>
      <p className="text-steel-line text-sm mb-2">
        Crie qualquer página nova (uma promoção sazonal, uma parceria, uma landing page específica)
        sem precisar mexer em código. Ela fica disponível em:
      </p>
      <p className="text-steel-line text-sm mb-6 font-mono bg-card border border-card-line rounded-lg px-3 py-2 inline-block">
        clean-car-seo.vercel.app/paginas/<span className="text-verniz-shine">seu-titulo-vira-isso</span>
      </p>

      <form action={salvarPagina} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-2xl mb-10">
        <input type="hidden" name="slug_existente" value={editando?.slug ?? ""} />
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Título</label>
          <input name="titulo" required defaultValue={editando?.titulo ?? ""} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Descrição curta (aparece no Google)</label>
          <input name="meta_descricao" defaultValue={editando?.meta_descricao ?? ""} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Conteúdo</label>
          <textarea name="conteudo" required rows={8} defaultValue={editando?.conteudo ?? ""} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <ImageUploader name="imagem_url" initialUrl={editando?.imagem_url ?? ""} label="Imagem de topo (opcional)" aspect={21 / 9} />
        <label className="flex items-center gap-2 text-sm text-steel-line">
          <input type="checkbox" name="publicado" defaultChecked={editando?.publicado ?? false} /> Publicada (visível no site)
        </label>
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          {editando ? "Atualizar página" : "Criar página"}
        </button>
      </form>

      <div className="grid gap-3">
        {paginas?.map((p) => (
          <div key={p.slug} className="bg-card border border-card-line rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-steel">
                {p.titulo}{" "}
                <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${p.publicado ? "bg-ok/15 text-ok" : "bg-steel-line/15 text-steel-line"}`}>
                  {p.publicado ? "publicada" : "rascunho"}
                </span>
              </div>
              <div className="text-xs text-steel-line">/paginas/{p.slug}</div>
            </div>
            <div className="flex gap-2">
              <a href={`/admin/paginas?editar=${p.slug}`} className="text-xs font-bold text-verniz-shine hover:underline">Editar</a>
              <form action={excluirPagina}>
                <input type="hidden" name="slug" value={p.slug} />
                <button type="submit" className="text-xs font-bold text-warn hover:underline">Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {(!paginas || paginas.length === 0) && <p className="text-steel-line text-sm">Nenhuma página criada ainda.</p>}
      </div>
    </div>
  );
}
