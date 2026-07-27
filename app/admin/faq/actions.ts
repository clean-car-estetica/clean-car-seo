"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { faqsPadrao } from "@/lib/site-data";

export async function importarFaqsPadrao() {
  const { count } = await supabaseAdmin.from("faqs").select("*", { count: "exact", head: true });
  if (count && count > 0) return;
  const linhas = faqsPadrao.map((f, i) => ({ pergunta: f.pergunta, resposta: f.resposta, ordem: i }));
  const { error } = await supabaseAdmin.from("faqs").insert(linhas);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/faq");
}

export async function salvarFaq(formData: FormData) {
  const idRaw = formData.get("id");
  const pergunta = String(formData.get("pergunta"));
  const resposta = String(formData.get("resposta"));
  const ordem = Number(formData.get("ordem") || 0);

  if (idRaw) {
    const { error } = await supabaseAdmin.from("faqs").update({ pergunta, resposta, ordem }).eq("id", Number(idRaw));
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabaseAdmin.from("faqs").insert({ pergunta, resposta, ordem });
    if (error) throw new Error(error.message);
  }
  revalidatePath("/");
  revalidatePath("/admin/faq");
}

export async function excluirFaq(formData: FormData) {
  const id = Number(formData.get("id"));
  const { error } = await supabaseAdmin.from("faqs").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/admin/faq");
}
