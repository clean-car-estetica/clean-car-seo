"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { servicos as servicosPadrao, cidades as cidadesPadrao } from "@/lib/data";

export async function importarDadosPadrao() {
  // Só insere serviços que AINDA NÃO existem — nunca sobrescreve o que você já personalizou.
  const linhasServicos = servicosPadrao.map((s) => ({
    slug: s.slug,
    nome: s.nome,
    resumo: s.resumo,
    descricao: s.descricao,
    duracao: s.duracao ?? null,
    preco_desde: s.precoDesde ?? null,
    imagem_url: s.imagem,
    tag: s.tag ?? null,
    ordem: s.ordem,
    termo_popular: s.termoPopular ?? null,
  }));
  const linhasCidades = cidadesPadrao.map((c) => ({
    slug: c.slug,
    nome: c.nome,
    bairros: c.bairros,
    sede: c.sede,
  }));

  const { error: e1 } = await supabaseAdmin
    .from("services")
    .upsert(linhasServicos, { onConflict: "slug", ignoreDuplicates: true });
  if (e1) throw new Error(e1.message);
  const { error: e2 } = await supabaseAdmin
    .from("cities")
    .upsert(linhasCidades, { onConflict: "slug", ignoreDuplicates: true });
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin/conteudo");
}

export async function atualizarOrdemPadrao() {
  // Atualiza SÓ o campo "ordem" de cada serviço, sem tocar em imagem, texto ou preço.
  for (const s of servicosPadrao) {
    const { error } = await supabaseAdmin.from("services").update({ ordem: s.ordem }).eq("slug", s.slug);
    if (error) throw new Error(error.message);
  }
  revalidatePath("/admin/conteudo");
  revalidatePath("/");
}

export async function criarServico(formData: FormData) {
  const nome = String(formData.get("nome"));
  const slug = String(formData.get("nome"))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const resumo = String(formData.get("resumo") || "");
  const descricao = String(formData.get("descricao") || "");
  const imagem_url =
    String(formData.get("imagem_url") || "") ||
    "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80";
  const pontos_fidelidade = Number(formData.get("pontos_fidelidade") || 0);
  const ordem = Number(formData.get("ordem") || 0);
  const termo_popular = String(formData.get("termo_popular") || "") || null;

  const { error } = await supabaseAdmin.from("services").insert({ slug, nome, resumo, descricao, imagem_url, pontos_fidelidade, ordem, termo_popular });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/conteudo");
  revalidatePath("/");
}

export async function excluirServico(formData: FormData) {
  const slug = String(formData.get("slug"));
  const { error } = await supabaseAdmin.from("services").delete().eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/conteudo");
  revalidatePath("/");
}

export async function atualizarServico(formData: FormData) {
  const slug = String(formData.get("slug"));
  const nome = String(formData.get("nome"));
  const resumo = String(formData.get("resumo"));
  const descricao = String(formData.get("descricao"));
  const imagem_url = String(formData.get("imagem_url"));
  const precoRaw = formData.get("preco_desde");
  const preco_desde = precoRaw ? Number(precoRaw) : null;
  const pontos_fidelidade = Number(formData.get("pontos_fidelidade") || 0);
  const ordem = Number(formData.get("ordem") || 0);
  const termo_popular = String(formData.get("termo_popular") || "") || null;
  const ativo = formData.get("ativo") === "on";

  const { error } = await supabaseAdmin
    .from("services")
    .update({ nome, resumo, descricao, imagem_url, preco_desde, pontos_fidelidade, ordem, termo_popular, ativo, updated_at: new Date().toISOString() })
    .eq("slug", slug);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/conteudo");
}
