"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarPromocao(formData: FormData) {
  const chave = String(formData.get("chave"));
  const titulo = String(formData.get("titulo"));
  const texto = String(formData.get("texto"));
  const regras = String(formData.get("regras") || "");

  const { error } = await supabaseAdmin
    .from("promocoes")
    .upsert({ chave, titulo, texto, regras, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/promocoes");
}
