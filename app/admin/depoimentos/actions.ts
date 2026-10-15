"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarDepoimento(formData: FormData) {
  const autor = String(formData.get("autor") || "Cliente Google");
  const nota = Number(formData.get("nota") || 5);
  const texto = String(formData.get("texto"));
  const ordem = Number(formData.get("ordem") || 0);

  const { error } = await supabaseAdmin.from("depoimentos").insert({ autor, nota, texto, ordem });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/depoimentos");
}

export async function excluirDepoimento(formData: FormData) {
  const id = Number(formData.get("id"));
  const { error } = await supabaseAdmin.from("depoimentos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/depoimentos");
}

export async function definirVideoCliente(formData: FormData) {
  const publicado = String(formData.get("status")) === "publicado";
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "video_cliente", data: { publicado }, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/depoimentos");
}
