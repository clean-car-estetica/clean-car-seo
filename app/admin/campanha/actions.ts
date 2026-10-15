"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

const num = (v: FormDataEntryValue | null) => {
  const t = String(v ?? "").replace(/[^\d,.]/g, "").replace(",", ".");
  return t ? Number(t) : null;
};

export async function salvarCampanha(formData: FormData) {
  const dados = {
    id: 1,
    ativo: formData.get("ativo") === "on",
    titulo: String(formData.get("titulo") || ""),
    selo: String(formData.get("selo") || ""),
    texto: String(formData.get("texto") || ""),
    preco_de: num(formData.get("preco_de")),
    preco_por: num(formData.get("preco_por")),
    termina_em: String(formData.get("termina_em") || "") || null,
    imagem_url: String(formData.get("imagem_url") || "") || null,
    texto_botao: String(formData.get("texto_botao") || "Quero aproveitar"),
    link_botao: String(formData.get("link_botao") || ""),
    atualizado_em: new Date().toISOString(),
  };
  const { error } = await supabaseAdmin.from("campanha").upsert(dados);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/campanha");
}

export async function desligarCampanha() {
  const { error } = await supabaseAdmin.from("campanha").update({ ativo: false, atualizado_em: new Date().toISOString() }).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/campanha");
}
