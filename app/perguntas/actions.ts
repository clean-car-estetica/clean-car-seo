"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type EstadoEnvio = { ok: boolean; erro?: string };

// Pergunta enviada pelo site. Gravada pelo servidor (o navegador não escreve
// direto no banco). Proteções simples contra robô: campo invisível e tempo
// mínimo de preenchimento.
export async function enviarPergunta(_anterior: EstadoEnvio, formData: FormData): Promise<EstadoEnvio> {
  if (String(formData.get("site") || "")) return { ok: true }; // robô preencheu o campo invisível
  const inicio = Number(formData.get("inicio") || 0);
  if (inicio && Date.now() - inicio < 3000) return { ok: true };

  const pergunta = String(formData.get("pergunta") || "").trim().replace(/\s+/g, " ");
  const nome = String(formData.get("nome") || "").trim().slice(0, 60);
  const whatsapp = String(formData.get("whatsapp") || "").replace(/\D/g, "").slice(0, 20);
  const servico_slug = String(formData.get("servico") || "") || null;

  if (pergunta.length < 10) return { ok: false, erro: "Escreva a sua pergunta com um pouco mais de detalhe." };
  if (pergunta.length > 600) return { ok: false, erro: "A pergunta ficou longa demais (máximo 600 letras)." };
  if (/https?:\/\//i.test(pergunta)) return { ok: false, erro: "Envie a pergunta sem links." };

  const { data, error } = await supabaseAdmin
    .from("perguntas_clientes")
    .insert({ pergunta, servico_slug })
    .select("id")
    .single();
  if (error || !data) return { ok: false, erro: "Não conseguimos enviar agora. Tente de novo ou chame no WhatsApp." };

  if (nome || whatsapp) {
    await supabaseAdmin.from("perguntas_contatos").insert({ pergunta_id: data.id, nome: nome || null, whatsapp: whatsapp || null });
  }
  revalidatePath("/admin/perguntas");
  return { ok: true };
}
