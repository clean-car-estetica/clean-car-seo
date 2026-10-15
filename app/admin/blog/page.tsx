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
  const [{ data: posts }, { data: servicos }] = await Promise.all([
    supabaseAdmin.from("blog_posts").select("*").order("publicado_em", { ascending: false }),
    supabaseAdmin.from("services").select("slug, nome").eq("ativo", true).order("ordem"),
  ]);
  const editando = sp.editar ? posts?.find((p) => p.slug === sp.editar) : null;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Blog</h1>
      <p className="text-steel-line text-sm mb-6 max-w-2xl">
        Crie e publique artigos. Rascunho fica fora do site — use “Prévia” para ver como vai ficar. No conteúdo: parágrafos
        separados por linha em branco, subtítulo com “## ” no começo da linha e lista com “- ”. Publique aos poucos (uns 2 a 3 por semana).
      </p>

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
            rows={18}
            defaultValue={editando?.conteudo ?? ""}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <fieldset>
          <legend className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Serviços citados (viram cartões no fim do artigo)</legend>
          <div className="grid sm:grid-cols-2 gap-2 mt-1">
            {(servicos ?? []).map((s) => (
              <label key={s.slug} className="flex items-center gap-2 text-sm text-steel-line">
                <input type="checkbox" name="servicos" value={s.slug} defaultChecked={editando?.servicos?.includes(s.slug)} className="accent-verniz" />
                {s.nome}
              </label>
            ))}
          </div>
        </fieldset>
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
              <a href={`/admin/blog/previa/${p.slug}`} target="_blank" className="text-xs font-bold text-steel-line hover:underline">Prévia ↗</a>
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
