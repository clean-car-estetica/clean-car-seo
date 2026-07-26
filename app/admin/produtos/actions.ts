"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function adicionarProduto(formData: FormData) {
  const nome = String(formData.get("nome"));
  const ordem = Number(formData.get("ordem") || 0);
  const { error } = await supabaseAdmin.from("produtos_lista").insert({ nome, ordem });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/produtos");
}

export async function excluirProduto(formData: FormData) {
  const id = Number(formData.get("id"));
  const { error } = await supabaseAdmin.from("produtos_lista").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/produtos");
}
