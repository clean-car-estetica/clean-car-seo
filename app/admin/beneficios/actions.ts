"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function criarBeneficio(formData: FormData) {
  const nome = String(formData.get("nome"));
  const pontos_necessarios = Number(formData.get("pontos_necessarios"));
  const { error } = await supabaseAdmin.from("beneficios").insert({ nome, pontos_necessarios });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/beneficios");
  revalidatePath("/beneficios");
}

export async function excluirBeneficio(formData: FormData) {
  const id = Number(formData.get("id"));
  const { error } = await supabaseAdmin.from("beneficios").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/beneficios");
  revalidatePath("/beneficios");
}
