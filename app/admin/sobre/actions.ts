"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarSobre(formData: FormData) {
  const dados = {
    titulo: String(formData.get("titulo")),
    texto: String(formData.get("texto")),
  };
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "sobre", data: dados, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/sobre");
  revalidatePath("/admin/sobre");
}
