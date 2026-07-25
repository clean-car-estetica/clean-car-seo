"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarTransformacao(formData: FormData) {
  const idRaw = formData.get("id");
  const titulo = String(formData.get("titulo"));
  const descricao = String(formData.get("descricao"));
  const imagem_antes = String(formData.get("imagem_antes"));
  const imagem_depois = String(formData.get("imagem_depois"));
  const ordem = Number(formData.get("ordem") || 0);

  if (idRaw) {
    const { error } = await supabaseAdmin
      .from("transformacoes")
      .update({ titulo, descricao, imagem_antes, imagem_depois, ordem })
      .eq("id", Number(idRaw));
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin
      .from("transformacoes")
      .insert({ titulo, descricao, imagem_antes, imagem_depois, ordem });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/");
  revalidatePath("/admin/transformacoes");
}

export async function excluirTransformacao(formData: FormData) {
  const id = Number(formData.get("id"));
  const { error } = await supabaseAdmin.from("transformacoes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/transformacoes");
}
