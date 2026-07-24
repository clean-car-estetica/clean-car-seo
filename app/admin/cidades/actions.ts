"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function criarCidade(formData: FormData) {
  const nome = String(formData.get("nome"));
  const slug = slugify(nome);
  const bairros = String(formData.get("bairros") || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
  const sede = formData.get("sede") === "on";

  const { error } = await supabaseAdmin.from("cities").insert({ slug, nome, bairros, sede });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cidades");
  revalidatePath("/", "layout");
}

export async function atualizarCidade(formData: FormData) {
  const slug = String(formData.get("slug"));
  const nome = String(formData.get("nome"));
  const bairros = String(formData.get("bairros") || "")
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
  const sede = formData.get("sede") === "on";

  const { error } = await supabaseAdmin.from("cities").update({ nome, bairros, sede }).eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cidades");
  revalidatePath("/", "layout");
}

export async function excluirCidade(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { error } = await supabaseAdmin.from("cities").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cidades");
  revalidatePath("/", "layout");
}
