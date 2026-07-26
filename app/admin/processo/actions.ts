"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarPasso(formData: FormData) {
  const idRaw = formData.get("id");
  const titulo = String(formData.get("titulo"));
  const texto = String(formData.get("texto"));
  const ordem = Number(formData.get("ordem") || 0);
  if (idRaw) {
    const { error } = await supabaseAdmin.from("processo_passos").update({ titulo, texto, ordem }).eq("id", Number(idRaw));
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("processo_passos").insert({ titulo, texto, ordem });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/");
  revalidatePath("/admin/processo");
}

export async function excluirPasso(formData: FormData) {
  const id = Number(formData.get("id"));
  const { error } = await supabaseAdmin.from("processo_passos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/processo");
}
