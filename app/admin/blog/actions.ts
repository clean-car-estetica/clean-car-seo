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

  const { error } = await supabaseAdmin.from("blog_posts").upsert({
    slug,
    titulo,
    resumo,
    conteudo,
    imagem_url: imagem_url || null,
    status,
  });
  if (error) throw new Error(error.message);

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
