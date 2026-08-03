"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarIntegracaoGbr(formData: FormData) {
  const api_url = String(formData.get("api_url") || "");
  const api_key_novo = String(formData.get("api_key") || "");
  const ativo = formData.get("ativo") === "on";

  // Se o campo da chave for deixado em branco, mantém a chave já salva
  // (evita apagar sem querer só por não ter digitado de novo).
  const { data: atual } = await supabaseAdmin.from("gbr_integracao").select("api_key").eq("id", 1).maybeSingle();
  const api_key = api_key_novo || atual?.api_key || "";

  const { error } = await supabaseAdmin
    .from("gbr_integracao")
    .upsert({ id: 1, api_url, api_key, ativo, atualizado_em: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/integracao-gbr");
}
