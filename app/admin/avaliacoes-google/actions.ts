"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { responderNoGoogle, sincronizarAvaliacoes } from "@/lib/avaliacoes-google";

function atualizar() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/avaliacoes-google");
}

export async function buscarAgora(): Promise<{ ok: boolean; msg: string }> {
  try {
    const r = await sincronizarAvaliacoes();
    atualizar();
    return { ok: true, msg: r.novas ? `${r.novas} avaliação(ões) nova(s) trazida(s) do Google.` : "Tudo em dia: nenhuma avaliação nova." };
  } catch (e) {
    return { ok: false, msg: (e as Error).message };
  }
}

export async function alternarVisivel(formData: FormData) {
  const chave = String(formData.get("chave"));
  const visivel = formData.get("visivel") === "1";
  const { error } = await supabaseAdmin.from("avaliacoes_google").update({ visivel, visivel_manual: true }).eq("chave", chave);
  if (error) throw new Error(error.message);
  atualizar();
}

export async function responder(formData: FormData) {
  const chave = String(formData.get("chave"));
  const idExterno = String(formData.get("id_externo"));
  const texto = String(formData.get("resposta") || "").trim();
  if (!texto) return;
  await responderNoGoogle(idExterno, texto);
  const { error } = await supabaseAdmin
    .from("avaliacoes_google")
    .update({ resposta: texto, respondido_em: new Date().toISOString() })
    .eq("chave", chave);
  if (error) throw new Error(error.message);
  atualizar();
}
