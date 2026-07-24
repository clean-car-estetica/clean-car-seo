"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function registrarPosicao(formData: FormData) {
  const keyword = String(formData.get("keyword"));
  const city_slug = String(formData.get("city_slug") || "") || null;
  const posicaoRaw = formData.get("posicao");
  const posicao = posicaoRaw ? Number(posicaoRaw) : null;

  const { error } = await supabaseAdmin.from("keyword_rankings").insert({ keyword, city_slug, posicao });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/palavras-chave");
}
