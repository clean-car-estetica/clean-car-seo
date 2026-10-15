"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function salvarPost(formData: FormData) {
  const slugExistente = String(formData.get("slug") || "");
  const titulo = String(formData.get("titulo"));
  const resumo = String(formData.get("resumo"));
  const conteudo = String(formData.get("conteudo"));
  const imagem_url = String(formData.get("imagem_url") || "");
  const status = String(formData.get("status")) as "rascunho" | "publicado";
  const slug = slugExistente || slugify(titulo);
  const servicos = formData.getAll("servicos").map(String);

  // Data de publicação = quando foi publicado pela 1ª vez (não quando o rascunho nasceu)
  const { data: atual } = await supabaseAdmin.from("blog_posts").select("status").eq("slug", slug).maybeSingle();
  const agora = new Date().toISOString();
  const estreia = status === "publicado" && atual?.status !== "publicado";

  const { error } = await supabaseAdmin.from("blog_posts").upsert({
    slug,
    titulo,
    resumo,
    conteudo,
    imagem_url: imagem_url || null,
    status,
    servicos,
    atualizado_em: agora,
    ...(estreia || !atual ? { publicado_em: agora } : {}),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/sitemap.xml");

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blog");
}

export async function excluirPost(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { error } = await supabaseAdmin.from("blog_posts").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}

// Seletor da lista: muda só o status, sem abrir o post
export async function definirStatusPost(formData: FormData) {
  const slug = String(formData.get("slug"));
  const status = String(formData.get("status")) === "publicado" ? "publicado" : "rascunho";
  const { data: atual } = await supabaseAdmin.from("blog_posts").select("status").eq("slug", slug).single();
  if (!atual || atual.status === status) return;
  const agora = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("blog_posts")
    .update({ status, atualizado_em: agora, ...(status === "publicado" ? { publicado_em: agora } : {}) })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/blog");
}
