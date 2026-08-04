export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import ImageUploader from "@/components/ImageUploader";
import { salvarPost, excluirPost } from "./actions";

export default async function BlogAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  const sp = await searchParams;
  const { data: posts } = await supabaseAdmin.from("blog_posts").select("*").order("publicado_em", { ascending: false });
  const editando = sp.editar ? posts?.find((p) => p.slug === sp.editar) : null;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Blog</h1>
      <p className="text-steel-line text-sm mb-6">Crie e publique posts. Deixe como "rascunho" até estar pronto.</p>

      <form action={salvarPost} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-2xl mb-10">
        <input type="hidden" name="slug" value={editando?.slug ?? ""} />
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Título</label>
          <input
            name="titulo"
            required
            defaultValue={editando?.titulo ?? ""}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Resumo</label>
          <input
            name="resumo"
            required
            defaultValue={editando?.resumo ?? ""}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Conteúdo</label>
          <textarea
            name="conteudo"
            required
            rows={8}
            defaultValue={editando?.conteudo ?? ""}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <ImageUploader name="imagem_url" initialUrl={editando?.imagem_url ?? ""} label="Imagem de capa" aspect={16 / 9} specTexto="1200x675px (proporção 16:9)" nomeArquivo={editando?.titulo ?? "blog"} />
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Status</label>
          <select
            name="status"
            defaultValue={editando?.status ?? "rascunho"}
            className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          >
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          {editando ? "Atualizar post" : "Criar post"}
        </button>
      </form>

      <div className="grid gap-3">
        {posts?.map((p) => (
          <div key={p.slug} className="bg-card border border-card-line rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-steel">
                {p.titulo}{" "}
                <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${p.status === "publicado" ? "bg-ok/15 text-ok" : "bg-steel-line/15 text-steel-line"}`}>
                  {p.status}
                </span>
              </div>
              <div className="text-xs text-steel-line">/{p.slug}</div>
            </div>
            <div className="flex gap-2">
              <a href={`/admin/blog?editar=${p.slug}`} className="text-xs font-bold text-verniz-shine hover:underline">Editar</a>
              <form action={excluirPost}>
                <input type="hidden" name="slug" value={p.slug} />
                <button type="submit" className="text-xs font-bold text-warn hover:underline">Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {(!posts || posts.length === 0) && <p className="text-steel-line text-sm">Nenhum post ainda.</p>}
      </div>
    </div>
  );
}
