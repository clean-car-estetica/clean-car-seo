"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CAMPANHA_VAZIA, type CampanhaItem } from "@/lib/site-content";

const num = (v: FormDataEntryValue | null) => {
  const t = String(v ?? "").replace(/[^\d,.]/g, "").replace(",", ".");
  return t ? Number(t) : null;
};
const txt = (v: FormDataEntryValue | null) => String(v ?? "").trim();

async function lerLista(): Promise<CampanhaItem[]> {
  const { data } = await supabaseAdmin.from("site_content").select("data").eq("section", "campanhas").maybeSingle();
  return ((data?.data as { lista?: CampanhaItem[] } | undefined)?.lista ?? []).map((c) => ({ ...CAMPANHA_VAZIA, ...c }));
}

async function gravarLista(lista: CampanhaItem[]) {
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "campanhas", data: { lista }, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/campanha");
}

export async function salvarCampanha(formData: FormData) {
  const lista = await lerLista();
  const id = txt(formData.get("id")) || `c${Date.now().toString(36)}`;
  const item: CampanhaItem = {
    id,
    ativo: formData.get("ativo") === "on",
    titulo: txt(formData.get("titulo")),
    selo: txt(formData.get("selo")),
    texto: txt(formData.get("texto")),
    observacao: txt(formData.get("observacao")),
    servico: txt(formData.get("servico")),
    preco_de: num(formData.get("preco_de")),
    preco_por: num(formData.get("preco_por")),
    inicia_em: txt(formData.get("inicia_em")) || null,
    termina_em: txt(formData.get("termina_em")) || null,
    imagem_url: txt(formData.get("imagem_url")) || null,
    texto_botao: txt(formData.get("texto_botao")) || "Quero aproveitar",
    link_botao: txt(formData.get("link_botao")),
    mensagem_whatsapp: txt(formData.get("mensagem_whatsapp")),
  };
  const i = lista.findIndex((c) => c.id === id);
  if (i >= 0) lista[i] = item;
  else lista.push(item);
  await gravarLista(lista);
  redirect(`/admin/campanha?salvo=1`);
}

export async function alternarCampanha(formData: FormData) {
  const id = txt(formData.get("id"));
  const lista = await lerLista();
  await gravarLista(lista.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c)));
}

export async function excluirCampanha(formData: FormData) {
  const id = txt(formData.get("id"));
  const lista = await lerLista();
  await gravarLista(lista.filter((c) => c.id !== id));
}
