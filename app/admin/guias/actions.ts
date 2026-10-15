"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { avisarIndexNow } from "@/lib/indexnow";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { slugify } from "@/lib/slug";
import { textoParaPerguntas, textoParaSecoes } from "@/lib/formato-console";
import { caminhoGuia, ROTA_GUIA, type TipoGuia } from "@/lib/guias";

function revalidarSite(tipo: TipoGuia, slug: string) {
  // Avisa Bing & cia. depois da resposta (não atrasa o console)
  after(() => avisarIndexNow([caminhoGuia({ tipo, slug }), ROTA_GUIA[tipo], "/sitemap.xml"]));
  revalidatePath(caminhoGuia({ tipo, slug }));
  revalidatePath(ROTA_GUIA[tipo]);
  revalidatePath("/sitemap.xml");
  revalidatePath("/servicos/[servico]", "page");
  revalidatePath("/admin/guias");
}

export async function salvarGuia(formData: FormData) {
  const slugExistente = String(formData.get("slug_existente") || "");
  const tipo = String(formData.get("tipo")) as TipoGuia;
  const titulo = String(formData.get("titulo") || "").trim();
  const slug = slugExistente || slugify(String(formData.get("slug") || "") || titulo);
  const status = String(formData.get("status")) === "publicado" ? "publicado" : "rascunho";

  const { data: atual } = await supabaseAdmin.from("guias").select("publicado_em").eq("slug", slug).maybeSingle();

  const { error } = await supabaseAdmin.from("guias").upsert({
    slug,
    tipo,
    titulo,
    titulo_seo: String(formData.get("titulo_seo") || "").trim(),
    meta_descricao: String(formData.get("meta_descricao") || "").trim(),
    chamada: String(formData.get("chamada") || "").trim(),
    intro: String(formData.get("intro") || "").trim(),
    secoes: textoParaSecoes(String(formData.get("secoes") || "")),
    perguntas: textoParaPerguntas(String(formData.get("perguntas") || "")),
    servicos: formData.getAll("servicos").map(String),
    imagem_url: String(formData.get("imagem_url") || "") || null,
    ordem: Number(formData.get("ordem") || 0),
    status,
    atualizado_em: new Date().toISOString(),
    publicado_em: status === "publicado" ? atual?.publicado_em ?? new Date().toISOString() : atual?.publicado_em ?? null,
  });
  if (error) throw new Error(error.message);

  revalidarSite(tipo, slug);
  redirect(`/admin/guias?editar=${slug}&salvo=1`);
}

export async function alternarPublicacao(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { data: g } = await supabaseAdmin.from("guias").select("tipo, status, publicado_em").eq("slug", slug).single();
  if (!g) return;
  const publicar = g.status !== "publicado";
  const { error } = await supabaseAdmin
    .from("guias")
    .update({
      status: publicar ? "publicado" : "rascunho",
      publicado_em: publicar ? g.publicado_em ?? new Date().toISOString() : g.publicado_em,
      atualizado_em: new Date().toISOString(),
    })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidarSite(g.tipo as TipoGuia, slug);
}

export async function excluirGuia(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { data: g } = await supabaseAdmin.from("guias").select("tipo").eq("slug", slug).single();
  const { error } = await supabaseAdmin.from("guias").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  if (g) revalidarSite(g.tipo as TipoGuia, slug);
  redirect("/admin/guias");
}

// Seletor da lista: muda só o status, sem abrir a guia
export async function definirStatusGuia(formData: FormData) {
  const slug = String(formData.get("slug"));
  const status = String(formData.get("status")) === "publicado" ? "publicado" : "rascunho";
  const { data: g } = await supabaseAdmin.from("guias").select("tipo, status, publicado_em").eq("slug", slug).single();
  if (!g || g.status === status) return;
  const { error } = await supabaseAdmin
    .from("guias")
    .update({
      status,
      publicado_em: status === "publicado" ? g.publicado_em ?? new Date().toISOString() : g.publicado_em,
      atualizado_em: new Date().toISOString(),
    })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidarSite(g.tipo as TipoGuia, slug);
}

// Botão do console: avisa Bing & cia. de todas as páginas do sitemap de uma vez
export async function avisarBuscadoresDeTudo() {
  const { default: sitemap } = await import("@/app/sitemap");
  const entradas = await sitemap();
  await avisarIndexNow(entradas.map((e) => e.url));
  redirect("/admin/guias?avisado=1");
}
