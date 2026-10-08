import { supabaseAdmin } from "@/lib/supabase-admin";

// Avaliações do Google entrando sozinhas no site.
//
// Caminho A — API de Lugares (Places API New): traz as 5 avaliações mais
//   relevantes de cada vez. Rodando todo dia, o site vai guardando as novas.
//   Variáveis: GOOGLE_PLACES_API_KEY (e opcional GOOGLE_PLACE_ID).
//
// Caminho B — API do Perfil da Empresa (Business Profile): traz todas as
//   avaliações e permite responder. Precisa de acesso aprovado pelo Google e
//   de um login único do dono do perfil (refresh token OAuth).
//   Variáveis: GBP_CLIENT_ID, GBP_CLIENT_SECRET, GBP_REFRESH_TOKEN,
//              GBP_ACCOUNT_ID, GBP_LOCATION_ID.
//
// Quando o B estiver configurado, ele é usado no lugar do A. As duas fontes
// gravam na mesma tabela (avaliacoes_google) com a mesma chave (autor + dia),
// então a troca não duplica nada.

const PLACE_ID_PADRAO = "ChIJMZEnptZ3zpQR1y0wizguiwM";

export type FonteAvaliacoes = "perfil" | "places" | null;

export function fonteAtiva(): FonteAvaliacoes {
  const e = process.env;
  if (e.GBP_CLIENT_ID && e.GBP_CLIENT_SECRET && e.GBP_REFRESH_TOKEN && e.GBP_ACCOUNT_ID && e.GBP_LOCATION_ID) return "perfil";
  if (e.GOOGLE_PLACES_API_KEY) return "places";
  return null;
}

type Avaliacao = {
  chave: string;
  fonte: "places" | "perfil";
  id_externo: string | null;
  autor: string;
  foto_url: string | null;
  nota: number;
  texto: string | null;
  publicado_em: string;
  resposta?: string | null;
  respondido_em?: string | null;
};

function chaveDe(autor: string, quando: string) {
  const nome = autor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  return `${nome}|${quando.slice(0, 10)}`;
}

// ---------------------------------------------------------------- A: Places
async function buscarPlaces(): Promise<{ avaliacoes: Avaliacao[]; nota: number | null; total: number | null }> {
  const id = process.env.GOOGLE_PLACE_ID || PLACE_ID_PADRAO;
  const r = await fetch(`https://places.googleapis.com/v1/places/${id}?languageCode=pt-BR`, {
    headers: {
      "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!,
      "X-Goog-FieldMask": "rating,userRatingCount,reviews",
    },
    cache: "no-store",
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || `Places respondeu ${r.status}`);
  type R = {
    name: string;
    rating: number;
    publishTime: string;
    text?: { text: string };
    originalText?: { text: string };
    authorAttribution?: { displayName?: string; photoUri?: string };
  };
  const avaliacoes = ((j.reviews ?? []) as R[]).map((v) => {
    const autor = v.authorAttribution?.displayName || "Cliente do Google";
    return {
      chave: chaveDe(autor, v.publishTime),
      fonte: "places" as const,
      id_externo: v.name,
      autor,
      foto_url: v.authorAttribution?.photoUri ?? null,
      nota: Math.round(v.rating),
      texto: v.originalText?.text ?? v.text?.text ?? null,
      publicado_em: v.publishTime,
    };
  });
  return { avaliacoes, nota: j.rating ?? null, total: j.userRatingCount ?? null };
}

// ---------------------------------------------------------------- B: Perfil
async function tokenPerfil(): Promise<string> {
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GBP_CLIENT_ID!,
      client_secret: process.env.GBP_CLIENT_SECRET!,
      refresh_token: process.env.GBP_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`Login do Perfil da Empresa expirou ou foi recusado: ${j.error_description || j.error}`);
  return j.access_token;
}

const ESTRELAS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
const baseReviews = () =>
  `https://mybusiness.googleapis.com/v4/accounts/${process.env.GBP_ACCOUNT_ID}/locations/${process.env.GBP_LOCATION_ID}/reviews`;

async function buscarPerfil(): Promise<{ avaliacoes: Avaliacao[]; nota: number | null; total: number | null }> {
  const token = await tokenPerfil();
  const avaliacoes: Avaliacao[] = [];
  let pagina: string | undefined;
  let nota: number | null = null;
  let total: number | null = null;
  for (let i = 0; i < 20; i++) {
    const url = `${baseReviews()}?pageSize=50${pagina ? `&pageToken=${pagina}` : ""}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error?.message || `Perfil da Empresa respondeu ${r.status}`);
    nota = j.averageRating ?? nota;
    total = j.totalReviewCount ?? total;
    type R = {
      reviewId: string;
      reviewer?: { displayName?: string; profilePhotoUrl?: string };
      starRating: string;
      comment?: string;
      createTime: string;
      reviewReply?: { comment: string; updateTime: string };
    };
    for (const v of (j.reviews ?? []) as R[]) {
      const autor = v.reviewer?.displayName || "Cliente do Google";
      // O Google anexa "(Translated by Google)" em comentários traduzidos: fica só o original
      const texto = v.comment?.split("\n\n(Translated by Google)")[0].replace(/^\(Original\)\n/, "") ?? null;
      avaliacoes.push({
        chave: chaveDe(autor, v.createTime),
        fonte: "perfil",
        id_externo: v.reviewId,
        autor,
        foto_url: v.reviewer?.profilePhotoUrl ?? null,
        nota: ESTRELAS[v.starRating] ?? 5,
        texto,
        publicado_em: v.createTime,
        resposta: v.reviewReply?.comment ?? null,
        respondido_em: v.reviewReply?.updateTime ?? null,
      });
    }
    pagina = j.nextPageToken;
    if (!pagina) break;
  }
  return { avaliacoes, nota, total };
}

/** Responde uma avaliação no Google (só no caminho B). */
export async function responderNoGoogle(idExterno: string, texto: string) {
  if (fonteAtiva() !== "perfil") throw new Error("Responder pelo painel precisa da API do Perfil da Empresa ligada.");
  const token = await tokenPerfil();
  const r = await fetch(`${baseReviews()}/${idExterno}/reply`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ comment: texto }),
  });
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.error?.message || `Google respondeu ${r.status}`);
  }
}

// ---------------------------------------------------------------- Sincronização
export async function sincronizarAvaliacoes(): Promise<{ fonte: FonteAvaliacoes; novas: number; total: number; nota: number | null }> {
  const fonte = fonteAtiva();
  if (!fonte) throw new Error("Nenhuma fonte de avaliações configurada.");
  const { avaliacoes, nota, total } = fonte === "perfil" ? await buscarPerfil() : await buscarPlaces();

  const chaves = avaliacoes.map((a) => a.chave);
  const { data: existentes } = await supabaseAdmin
    .from("avaliacoes_google")
    .select("chave, visivel, visivel_manual")
    .in("chave", chaves.length ? chaves : ["-"]);
  const mapa = new Map((existentes ?? []).map((e) => [e.chave, e]));

  const linhas = avaliacoes.map((a) => {
    const atual = mapa.get(a.chave);
    // 4 e 5 estrelas aparecem sozinhas; o que o dono decidiu à mão é respeitado
    const visivel = atual?.visivel_manual ? atual.visivel : a.nota >= 4 && Boolean(a.texto?.trim());
    return { ...a, visivel, atualizado_em: new Date().toISOString() };
  });
  if (linhas.length) {
    const { error } = await supabaseAdmin.from("avaliacoes_google").upsert(linhas, { onConflict: "chave" });
    if (error) throw new Error(error.message);
  }

  // Nota e total do perfil para o selo do site
  await supabaseAdmin.from("site_content").upsert(
    { section: "google_resumo", data: { nota, total, atualizado: new Date().toISOString(), fonte }, updated_at: new Date().toISOString() },
    { onConflict: "section" }
  );

  return { fonte, novas: linhas.filter((l) => !mapa.has(l.chave)).length, total: linhas.length, nota };
}
