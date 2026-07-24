"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { servicos as servicosPadrao, cidades as cidadesPadrao } from "@/lib/data";

export async function importarDadosPadrao() {
  const linhasServicos = servicosPadrao.map((s) => ({
    slug: s.slug,
    nome: s.nome,
    resumo: s.resumo,
    descricao: s.descricao,
    duracao: s.duracao ?? null,
    preco_desde: s.precoDesde ?? null,
    imagem_url: s.imagem,
    tag: s.tag ?? null,
  }));
  const linhasCidades = cidadesPadrao.map((c) => ({
    slug: c.slug,
    nome: c.nome,
    bairros: c.bairros,
  }));

  const { error: e1 } = await supabaseAdmin.from("services").upsert(linhasServicos);
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await supabaseAdmin.from("cities").upsert(linhasCidades);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/conteudo");
}

export async function atualizarServico(formData: FormData) {
  const slug = String(formData.get("slug"));
  const nome = String(formData.get("nome"));
  const resumo = String(formData.get("resumo"));
  const descricao = String(formData.get("descricao"));
  const imagem_url = String(formData.get("imagem_url"));
  const precoRaw = formData.get("preco_desde");
  const preco_desde = precoRaw ? Number(precoRaw) : null;

  const { error } = await supabaseAdmin
    .from("services")
    .update({ nome, resumo, descricao, imagem_url, preco_desde, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/conteudo");
}
