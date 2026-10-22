import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabasePublico } from "@/lib/supabase";
import { CAMPANHA_VAZIA, campanhaDeHoje, campanhaProxima, getConfigCampanhas, type Campanha, type CampanhaItem } from "@/lib/site-content";

// SÓ SERVIDOR (usa a chave da integração GBR). Não importar em "use client".
//
// 15/10/2026: as campanhas passaram a ser cadastradas UMA vez, no SAS
// (Serviços e estoque > Campanhas). O site lê de lá pela API do GBR
// (/api/v1/campanhas) — a mesma que a IA do WhatsApp usa para confirmar o
// preço. Se o SAS não responder, usa a agenda antiga do console do site
// (site_content "campanhas") como reserva, para a página nunca quebrar.

type CampanhaSas = {
  id: string; nome: string; selo: string; texto: string; observacao: string; servico: string;
  precoNormal: number | null; precoCampanha: number | null; iniciaEm: string | null; terminaEm: string | null;
  imagemUrl: string | null; textoBotao: string; mensagemWhatsapp: string;
};

export type OrigemCampanhas = "sas" | "reserva" | "sas-vazio";

function doSas(c: CampanhaSas): CampanhaItem {
  return {
    ...CAMPANHA_VAZIA,
    id: c.id,
    ativo: true,
    titulo: c.nome,
    selo: c.selo || "",
    texto: c.texto || "",
    observacao: c.observacao || "",
    servico: c.servico || "",
    preco_de: c.precoNormal,
    preco_por: c.precoCampanha,
    inicia_em: c.iniciaEm,
    termina_em: c.terminaEm,
    imagem_url: c.imagemUrl,
    texto_botao: c.textoBotao || CAMPANHA_VAZIA.texto_botao,
    mensagem_whatsapp: c.mensagemWhatsapp || "",
  };
}

async function lerDoSas(): Promise<CampanhaItem[] | null> {
  try {
    const { data } = await supabaseAdmin.from("gbr_integracao").select("api_url, api_key, ativo").eq("id", 1).maybeSingle();
    if (!data?.ativo || !data.api_url || !data.api_key) return null;
    const resposta = await fetch(`${String(data.api_url).replace(/\/$/, "")}/campanhas`, {
      headers: { Authorization: `Bearer ${data.api_key}` },
      next: { revalidate: 120, tags: ["campanhas"] },
      signal: AbortSignal.timeout(4000),
    });
    if (!resposta.ok) return null;
    const json = (await resposta.json()) as { campanhas?: CampanhaSas[]; proximas?: CampanhaSas[] };
    return [...(json.campanhas ?? []), ...(json.proximas ?? [])].map(doSas);
  } catch {
    return null;
  }
}

async function lerReserva(): Promise<CampanhaItem[]> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "campanhas").maybeSingle();
    const lista = (data?.data as { lista?: Partial<CampanhaItem>[] } | undefined)?.lista ?? [];
    return lista.map((c) => ({ ...CAMPANHA_VAZIA, ...c, id: String(c.id ?? "") }));
  } catch {
    return [];
  }
}

/** Campanhas (no ar e agendadas) e de onde vieram */
export async function getCampanhasComOrigem(): Promise<{ lista: CampanhaItem[]; origem: OrigemCampanhas }> {
  const sas = await lerDoSas();
  // SAS ainda sem nenhuma campanha cadastrada (logo depois do PATCH-57):
  // segura a reserva para a campanha atual não sumir do site no meio do mês.
  if (sas && sas.length) return { lista: sas, origem: "sas" };
  // 16/10/2026: distingue "SAS respondeu, mas sem campanha" de "SAS fora do ar".
  return { lista: await lerReserva(), origem: sas ? "sas-vazio" : "reserva" };
}

export async function getCampanhas(): Promise<CampanhaItem[]> {
  return (await getCampanhasComOrigem()).lista;
}

export async function getCampanha(): Promise<Campanha> {
  return campanhaDeHoje(await getCampanhas());
}

/**
 * Próxima campanha agendada no SAS (para o "Vem aí" do site), ou null.
 * 22/10/2026: só quando o "Vem aí" está ligado no admin (Campanhas);
 * desligado, campanha agendada só aparece na data de começar.
 */
export async function getCampanhaProxima(): Promise<CampanhaItem | null> {
  const { mostrarVemAi } = await getConfigCampanhas();
  if (!mostrarVemAi) return null;
  return campanhaProxima(await getCampanhas());
}
