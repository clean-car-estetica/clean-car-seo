"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { produtosPadrao } from "@/lib/site-data";

export async function importarProdutosPadrao() {
  const { count } = await supabaseAdmin.from("produtos_lista").select("*", { count: "exact", head: true });
  if (count && count > 0) return;
  const linhas = produtosPadrao.map((nome, i) => ({ nome, ordem: i }));
  const { error } = await supabaseAdmin.from("produtos_lista").insert(linhas);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/produtos");
}

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
