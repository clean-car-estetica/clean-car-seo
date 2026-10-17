"use server";
import { FOTO_PADRAO, fotoServico, ehFotoAntiga } from "@/lib/fotos";

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
    imagem_url: fotoServico(s.slug, s.imagem),
    tag: s.tag ?? null,
    ordem: s.ordem,
    termo_popular: s.termoPopular ?? null,
    pontos_fidelidade: s.pontosFidelidade ?? 0,
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

// Serviços que saíram do catálogo: ficam ocultos (não são apagados) e os endereços antigos redirecionam.
const SERVICOS_DESATIVADOS = ["vitrificacao", "ducha"];

export async function aplicarCatalogoNovo(
  _estado: { ok: boolean; mensagem: string } | null
): Promise<{ ok: boolean; mensagem: string }> {
  // Atualiza nome, textos, tempo, preço, pontos, ordem e tag dos serviços do catálogo.
  // Mantém a IMAGEM que você já escolheu; serviços novos entram com uma imagem provisória.
  // Não lança erro: devolve uma mensagem para a tela mostrar o resultado real.
  try {
    const { data: existentes, error: e0 } = await supabaseAdmin.from("services").select("slug");
    if (e0) throw new Error(`Não consegui ler a tabela services: ${e0.message}`);
    const jaExiste = new Set((existentes ?? []).map((r) => r.slug as string));

    let atualizados = 0;
    let criados = 0;
    for (const s of servicosPadrao) {
      const campos = {
        nome: s.nome,
        resumo: s.resumo,
        descricao: s.descricao,
        duracao: s.duracao ?? null,
        preco_desde: s.precoDesde ?? null,
        tag: s.tag ?? null,
        ordem: s.ordem,
        termo_popular: s.termoPopular ?? null,
        pontos_fidelidade: s.pontosFidelidade ?? 0,
        ativo: true,
        updated_at: new Date().toISOString(),
      };
      if (jaExiste.has(s.slug)) {
        const { data, error } = await supabaseAdmin.from("services").update(campos).eq("slug", s.slug).select("slug");
        if (error) throw new Error(`${s.nome}: ${error.message}`);
        atualizados += data?.length ?? 0;
      } else {
        const { error } = await supabaseAdmin.from("services").insert({ slug: s.slug, imagem_url: fotoServico(s.slug, s.imagem), ...campos });
        if (error) throw new Error(`${s.nome}: ${error.message}`);
        criados += 1;
      }
    }

    const { data: ocultos, error: e2 } = await supabaseAdmin
      .from("services")
      .update({ ativo: false })
      .in("slug", SERVICOS_DESATIVADOS)
      .select("slug");
    if (e2) throw new Error(`Ocultar serviços antigos: ${e2.message}`);

    const { count, error: e3 } = await supabaseAdmin
      .from("services")
      .select("slug", { count: "exact", head: true })
      .eq("ativo", true);
    if (e3) throw new Error(`Conferência final: ${e3.message}`);

    revalidatePath("/", "layout");
    return {
      ok: true,
      mensagem: `Pronto: ${atualizados} serviços atualizados, ${criados} criados, ${ocultos?.length ?? 0} ocultos. Agora há ${count ?? "?"} serviços ativos no site.`,
    };
  } catch (e) {
    return { ok: false, mensagem: `Não foi possível aplicar: ${e instanceof Error ? e.message : String(e)}` };
  }
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
    FOTO_PADRAO;
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
  // Nunca grava de volta uma foto antiga do Unsplash: troca pela que o site mostra.
  const imagem_url = fotoServico(slug, String(formData.get("imagem_url") || ""));
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

/**
 * 17/10/2026: o site mostra as fotos novas (lib/fotos.ts) quando o banco ainda
 * tem a foto antiga do Unsplash (ou nenhuma), mas o admin mostrava a do banco
 * e, ao salvar, gravava a antiga de novo. Aqui o banco passa a guardar a mesma
 * foto que aparece no site, para o admin mostrar e trocar a foto certa.
 * Roda ao abrir a aba Serviços; não mexe em foto enviada pelo painel.
 */
export async function gravarFotosDoSiteNoBanco(): Promise<number> {
  const { data, error } = await supabaseAdmin.from("services").select("slug, imagem_url");
  if (error || !data) return 0;
  let n = 0;
  for (const s of data as { slug: string; imagem_url: string | null }[]) {
    if (!ehFotoAntiga(s.imagem_url)) continue;
    const nova = fotoServico(s.slug, s.imagem_url);
    if (nova === (s.imagem_url || "")) continue;
    const { error: e } = await supabaseAdmin.from("services").update({ imagem_url: nova }).eq("slug", s.slug);
    if (!e) n++;
  }
  return n;
}
