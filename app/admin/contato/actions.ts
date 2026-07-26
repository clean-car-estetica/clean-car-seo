"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarContato(formData: FormData) {
  const dados = {
    whatsapp: String(formData.get("whatsapp")).replace(/\D/g, ""),
    whatsappMsg: String(formData.get("whatsappMsg")),
    instagram: String(formData.get("instagram")).replace(/^@/, ""),
    instagramUrl: String(formData.get("instagramUrl")),
    agendamentoUrl: String(formData.get("agendamentoUrl")),
    codigoIndicacaoUrl: String(formData.get("codigoIndicacaoUrl")),
    googleUrl: String(formData.get("googleUrl")),
    endereco: String(formData.get("endereco")),
    horarioSemana: String(formData.get("horarioSemana")),
    horarioSabado: String(formData.get("horarioSabado")),
    observacaoHorario: String(formData.get("observacaoHorario")),
    formasPagamento: String(formData.get("formasPagamento") || ""),
  };

  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "contato", data: dados, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/contato");
}
