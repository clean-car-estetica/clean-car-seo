export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { servicos, cidades } from "@/lib/data";
import { getConteudoLocal } from "@/lib/content";
import ImageUploader from "@/components/ImageUploader";
import { salvarPaginaLocal } from "./actions";

export default async function PaginasLocaisPage({
  searchParams,
}: {
  searchParams: { servico?: string; cidade?: string };
}) {
  const servicoSlug = searchParams.servico || servicos[0].slug;
  const cidadeSlug = searchParams.cidade || cidades[0].slug;
  const servico = servicos.find((s) => s.slug === servicoSlug)!;
  const cidade = cidades.find((c) => c.slug === cidadeSlug)!;

  const { data: override } = await supabaseAdmin
    .from("local_pages_content")
    .select("*")
    .eq("service_slug", servicoSlug)
    .eq("city_slug", cidadeSlug)
    .maybeSingle();

  const template = getConteudoLocal(servico, cidade);
  const paragrafos = override?.paragrafos?.length ? override.paragrafos : template.paragrafos;
  const temPersonalizacao = Boolean(override?.paragrafos?.length);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Páginas locais</h1>
      <p className="text-steel-line text-sm mb-6">
        {servicos.length} serviços × {cidades.length} cidades = {servicos.length * cidades.length} páginas.
        Escolha uma combinação para editar o texto exibido nela.
      </p>

      <form method="GET" className="flex gap-3 mb-6">
        <select name="servico" defaultValue={servicoSlug} className="px-3 py-2 rounded-lg bg-card border border-card-line text-steel text-sm">
          {servicos.map((s) => (
            <option key={s.slug} value={s.slug}>{s.nome}</option>
          ))}
        </select>
        <select name="cidade" defaultValue={cidadeSlug} className="px-3 py-2 rounded-lg bg-card border border-card-line text-steel text-sm">
          {cidades.map((c) => (
            <option key={c.slug} value={c.slug}>{c.nome}</option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-card border border-card-line px-4 py-2 text-sm font-bold text-steel-line hover:border-verniz hover:text-verniz-shine">
          Abrir
        </button>
      </form>

      {!temPersonalizacao && (
        <p className="text-steel-line text-xs mb-3">
          Esta página ainda usa o texto padrão gerado automaticamente. Edite e salve para personalizar.
        </p>
      )}

      <form action={salvarPaginaLocal} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-2xl">
        <input type="hidden" name="service_slug" value={servicoSlug} />
        <input type="hidden" name="city_slug" value={cidadeSlug} />

        <ImageUploader
          name="imagem_url"
          initialUrl={override?.imagem_url || servico.imagem}
          label={`Imagem de topo (${servico.nome} em ${cidade.nome})`}
        />

        {[0, 1, 2].map((i) => (
          <div key={i}>
            <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">
              Parágrafo {i + 1}
            </label>
            <textarea
              name={`paragrafo${i + 1}`}
              defaultValue={paragrafos[i] ?? ""}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
            />
          </div>
        ))}

        <button
          type="submit"
          className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine"
        >
          Salvar esta página
        </button>
      </form>
    </div>
  );
}
