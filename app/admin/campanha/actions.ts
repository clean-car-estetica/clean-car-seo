"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarCampanha(formData: FormData) {
  const dados = {
    id: 1,
    ativo: formData.get("ativo") === "on",
    titulo: String(formData.get("titulo") || ""),
    texto: String(formData.get("texto") || ""),
    imagem_url: String(formData.get("imagem_url") || "") || null,
    texto_botao: String(formData.get("texto_botao") || "Saiba mais"),
    link_botao: String(formData.get("link_botao") || ""),
    atualizado_em: new Date().toISOString(),
  };
  const { error } = await supabaseAdmin.from("campanha").upsert(dados);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/campanha");
}
