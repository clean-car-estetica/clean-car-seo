"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarPlano(formData: FormData) {
  const idRaw = formData.get("id");
  const nome = String(formData.get("nome"));
  const preco = Number(formData.get("preco"));
  const descricao = String(formData.get("descricao") || "");
  const itens = String(formData.get("itens") || "")
    .split("\n")
    .map((i) => i.trim())
    .filter(Boolean);
  const destaque = formData.get("destaque") === "on";
  const ordem = Number(formData.get("ordem") || 0);

  const payload = { nome, preco, descricao, itens, destaque, ordem };

  if (idRaw) {
    const { error } = await supabaseAdmin.from("planos").update(payload).eq("id", Number(idRaw));
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("planos").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/");
  revalidatePath("/admin/planos");
}

export async function excluirPlano(formData: FormData) {
  const id = Number(formData.get("id"));
  const { error } = await supabaseAdmin.from("planos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/planos");
}
