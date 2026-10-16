import { supabaseAdmin } from "@/lib/supabase-admin";
import { getPlanosPublicos, type PlanoDB } from "@/lib/site-data";

// SÓ SERVIDOR (usa a chave da integração GBR). Não importar em "use client".
//
// 16/10/2026: os pacotes passam a vir do SAS (Planos Mensais), pela API do GBR
// (/api/v1/pacotes) — os mesmos que a IA do WhatsApp oferece. Antes o site
// tinha pacotes próprios, cadastrados à parte, e ficaram diferentes. Se o SAS
// não responder, usa a tabela antiga "planos" do console como reserva.

type PacoteSas = {
  id: string;
  nome: string;
  preco: number;
  precoGrande: number | null;
  validadeDias: number;
  paraQuem: string;
  servicos: { nome: string; quantidade: number }[];
  vantagens: string[];
};

const moeda = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });

function doSas(p: PacoteSas, ordem: number): PlanoDB {
  const itens = [
    ...p.servicos.map((s) => (s.quantidade > 1 ? `${s.quantidade}x ${s.nome}` : s.nome)),
    ...p.vantagens,
  ];
  if (p.precoGrande) itens.push(`SUV / picape: R$ ${moeda(p.precoGrande)}`);
  return {
    id: ordem,
    nome: p.nome,
    preco: p.preco,
    descricao: p.paraQuem,
    itens,
    destaque: /maioria|mais (procurad|escolhid|vendid)/i.test(p.paraQuem),
    validadeDias: p.validadeDias,
  };
}

export async function getPacotes(): Promise<PlanoDB[]> {
  try {
    const { data } = await supabaseAdmin.from("gbr_integracao").select("api_url, api_key, ativo").eq("id", 1).maybeSingle();
    if (data?.ativo && data.api_url && data.api_key) {
      const resposta = await fetch(`${String(data.api_url).replace(/\/$/, "")}/pacotes`, {
        headers: { Authorization: `Bearer ${data.api_key}` },
        next: { revalidate: 300, tags: ["pacotes"] },
        signal: AbortSignal.timeout(4000),
      });
      if (resposta.ok) {
        const json = (await resposta.json()) as { pacotes?: PacoteSas[] };
        if (json.pacotes?.length) return json.pacotes.map(doSas);
      }
    }
  } catch {
    // cai na reserva
  }
  return getPlanosPublicos();
}
