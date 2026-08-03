import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Cliente da API do addon "Site próprio" do GBR Sistemas.
 * Roda SEMPRE no servidor (Server Actions / Route Handlers) — a chave
 * nunca deve chegar ao navegador. Lê a URL/chave da tabela `gbr_integracao`
 * (sem leitura pública, só service_role).
 */

async function obterCredenciais() {
  const { data, error } = await supabaseAdmin.from("gbr_integracao").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || !data.ativo || !data.api_url || !data.api_key) {
    throw new Error("Integração com o GBR SAS não está configurada/ativa.");
  }
  return { apiUrl: data.api_url.replace(/\/$/, ""), apiKey: data.api_key };
}

async function chamarGbr(caminho: string, init?: RequestInit) {
  const { apiUrl, apiKey } = await obterCredenciais();
  const resposta = await fetch(`${apiUrl}${caminho}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => "");
    throw new Error(`GBR API (${resposta.status}): ${texto || resposta.statusText}`);
  }
  return resposta.json();
}

export type ServicoGbr = { id: string; nome: string; duracao?: number; preco?: number; destaque?: boolean };
export type HorarioGbr = { hora: string; disponivel: boolean };
export type ClienteGbr = { id?: string; nome: string; whatsapp: string; cep?: string };
export type FidelidadeGbr = { pontos: number; historico: { servico: string; data: string; pontos: number }[] };

export async function gbrListarServicos(): Promise<ServicoGbr[]> {
  return chamarGbr("/servicos");
}

export async function gbrListarHorarios(data: string): Promise<HorarioGbr[]> {
  return chamarGbr(`/horarios?data=${encodeURIComponent(data)}`);
}

export async function gbrBuscarOuCriarCliente(whatsapp: string, nome?: string): Promise<ClienteGbr> {
  if (nome) {
    return chamarGbr("/clientes", { method: "POST", body: JSON.stringify({ whatsapp, nome }) });
  }
  return chamarGbr(`/clientes?whatsapp=${encodeURIComponent(whatsapp)}`);
}

export async function gbrConsultarFidelidade(whatsapp: string): Promise<FidelidadeGbr> {
  return chamarGbr(`/fidelidade?whatsapp=${encodeURIComponent(whatsapp)}`);
}

export async function gbrCriarAgendamento(payload: {
  servico_id: string;
  data: string;
  hora: string;
  cliente: { nome: string; whatsapp: string; cep?: string };
}) {
  return chamarGbr("/agendamentos", { method: "POST", body: JSON.stringify(payload) });
}
