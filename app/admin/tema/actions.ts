"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarTema(formData: FormData) {
  const dados = {
    carbon: String(formData.get("carbon")),
    carbonSoft: String(formData.get("carbonSoft")),
    card: String(formData.get("card")),
    cardLine: String(formData.get("cardLine")),
    verniz: String(formData.get("verniz")),
    vernizShine: String(formData.get("vernizShine")),
    cera: String(formData.get("cera")),
  };
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "tema", data: dados, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/tema");
}
