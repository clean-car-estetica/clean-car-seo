"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarMetadados(formData: FormData) {
  const dados = {
    titulo: String(formData.get("titulo")),
    descricao: String(formData.get("descricao")),
    palavrasChave: String(formData.get("palavrasChave")),
  };
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "metadados", data: dados, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/metadados");
}
