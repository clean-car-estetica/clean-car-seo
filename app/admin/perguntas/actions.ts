"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { slugify } from "@/lib/slug";

function revalidar(slug?: string | null) {
  revalidatePath("/perguntas");
  if (slug) revalidatePath(`/perguntas/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/perguntas");
}

async function slugLivre(base: string, id: number) {
  const slug = slugify(base).slice(0, 80).replace(/-+$/, "") || `pergunta-${id}`;
  const { data } = await supabaseAdmin.from("perguntas_clientes").select("id").eq("slug", slug).neq("id", id).maybeSingle();
  return data ? `${slug}-${id}` : slug;
}

// Botões do console: "salvar" (fica respondida, fora do site), "publicar",
// "despublicar" e "arquivar".
export async function salvarResposta(formData: FormData) {
  const id = Number(formData.get("id"));
  const acao = String(formData.get("acao"));
  const titulo = String(formData.get("titulo") || "").trim() || null;
  const resposta = String(formData.get("resposta") || "").trim() || null;
  const servico_slug = String(formData.get("servico_slug") || "") || null;

  const { data: atual } = await supabaseAdmin.from("perguntas_clientes").select("pergunta, slug, respondido_em").eq("id", id).single();
  if (!atual) return;

  let status: string;
  let slug = atual.slug as string | null;
  if (acao === "arquivar") status = "arquivada";
  else if (acao === "despublicar") status = resposta ? "respondida" : "nova";
  else if (acao === "publicar") {
    if (!resposta) throw new Error("Escreva a resposta antes de publicar.");
    status = "publicada";
    slug = slug ?? (await slugLivre(titulo || atual.pergunta, id));
  } else status = resposta ? "respondida" : "nova";

  const { error } = await supabaseAdmin
    .from("perguntas_clientes")
    .update({
      titulo,
      resposta,
      servico_slug,
      status,
      slug,
      respondido_em: resposta ? atual.respondido_em ?? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidar(slug);
}

export async function excluirPergunta(formData: FormData) {
  const id = Number(formData.get("id"));
  const { data } = await supabaseAdmin.from("perguntas_clientes").select("slug").eq("id", id).single();
  const { error } = await supabaseAdmin.from("perguntas_clientes").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidar(data?.slug);
}
