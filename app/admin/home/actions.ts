"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarHero(formData: FormData) {
  const dados = {
    titulo_parte1: String(formData.get("titulo_parte1")),
    titulo_destaque: String(formData.get("titulo_destaque")),
    subtitulo: String(formData.get("subtitulo")),
    badge_texto: String(formData.get("badge_texto")),
    imagem_url: String(formData.get("imagem_url")),
  };

  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "hero", data: dados, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/admin/home");
}
