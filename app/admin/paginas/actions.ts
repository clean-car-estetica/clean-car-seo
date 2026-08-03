"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { slugify } from "@/lib/slug";

export async function salvarPagina(formData: FormData) {
  const slugExistente = String(formData.get("slug_existente") || "");
  const titulo = String(formData.get("titulo"));
  const meta_descricao = String(formData.get("meta_descricao") || "");
  const conteudo = String(formData.get("conteudo"));
  const imagem_url = String(formData.get("imagem_url") || "") || null;
  const publicado = formData.get("publicado") === "on";
  const slug = slugExistente || slugify(titulo);

  const { error } = await supabaseAdmin
    .from("paginas_customizadas")
    .upsert({ slug, titulo, meta_descricao, conteudo, imagem_url, publicado });
  if (error) throw new Error(error.message);

  revalidatePath(`/paginas/${slug}`);
  revalidatePath("/admin/paginas");
}

export async function excluirPagina(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { error } = await supabaseAdmin.from("paginas_customizadas").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/paginas");
}
