import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabasePublico } from "@/lib/supabase";

/**
 * Sincronização com o GBR SAS (17/10/2026).
 *
 * O que vem do SAS, sem cadastrar duas vezes:
 * - serviços: nome, preço, duração, destaque ("Mais pedido") e pausa
 *   (serviço pausado no SAS some do site);
 * - horário de funcionamento, feriados, horários especiais e fechamentos;
 * - leva e traz (pausado no SAS = some do site).
 *
 * O que continua SÓ no console do site: fotos, descrições, textos de SEO.
 *
 * Os dados do SAS ficam em cache por 5 minutos (fetch com revalidate) — as
 * páginas se atualizam sozinhas nesse intervalo. O botão "Atualizar agora"
 * em /admin/integracao-gbr força na hora (revalidateTag "gbr-sync").
 *
 * Qualquer falha (SAS fora do ar, chave errada, integração desligada) faz o
 * site continuar com o que está cadastrado no console. Nunca derruba página.
 */

export const TAG_GBR = "gbr-sync";
const CACHE_SEGUNDOS = 300;

export type ServicoSas = {
  id: string;
  nome: string;
  preco: number | null;
  duracao: string | null;
  destaque: boolean;
  ativo: boolean;
};

export type DiaSemanaSas = { dia: string; nome: string; aberto: boolean; inicio: string | null; fim: string | null };
export type ExcecaoSas = { tipo: "fechado" | "horario" | "pausa"; data: string; dataFim: string | null; inicio: string | null; fim: string | null; motivo: string | null };
export type FuncionamentoSas = {
  configurado: boolean;
  semana: DiaSemanaSas[];
  hoje: { data: string; aberto: boolean; abertoAgora: boolean; inicio: string | null; fim: string | null; especial: boolean; motivo: string | null; reabreAs: string | null };
  excecoes: ExcecaoSas[];
  levaTras: { disponivel: boolean };
};

/** Vínculo serviço do site → serviço do SAS. "nenhum" = não sincronizar. */
export type Vinculos = Record<string, string>;

async function credenciais(): Promise<{ apiUrl: string; apiKey: string } | null> {
  try {
    const { data } = await supabaseAdmin.from("gbr_integracao").select("api_url, api_key, ativo").eq("id", 1).maybeSingle();
    if (!data?.ativo || !data.api_url || !data.api_key) return null;
    return { apiUrl: String(data.api_url).replace(/\/$/, ""), apiKey: String(data.api_key) };
  } catch {
    return null;
  }
}

async function buscar<T>(caminho: string): Promise<T | null> {
  const c = await credenciais();
  if (!c) return null;
  try {
    const r = await fetch(`${c.apiUrl}${caminho}`, {
      headers: { Authorization: `Bearer ${c.apiKey}` },
      next: { revalidate: CACHE_SEGUNDOS, tags: [TAG_GBR] },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) {
      console.warn(`[gbr-sync] ${caminho} → ${r.status}`);
      return null;
    }
    return (await r.json()) as T;
  } catch (e) {
    console.warn(`[gbr-sync] ${caminho} falhou: ${String((e as Error)?.message || e).slice(0, 120)}`);
    return null;
  }
}

export async function getServicosSas(): Promise<ServicoSas[] | null> {
  const r = await buscar<{ servicos: (Omit<ServicoSas, "ativo"> & { ativo?: boolean })[] }>("/servicos?todos=1");
  if (!r?.servicos) return null;
  return r.servicos.map((s) => ({ ...s, ativo: s.ativo !== false, destaque: s.destaque === true }));
}

export async function getFuncionamentoSas(): Promise<FuncionamentoSas | null> {
  const r = await buscar<FuncionamentoSas>("/funcionamento");
  return r && Array.isArray(r.semana) ? r : null;
}

export async function getVinculos(): Promise<Vinculos> {
  try {
    const { data } = await supabasePublico.from("site_content").select("data").eq("section", "gbr_vinculos").maybeSingle();
    return (data?.data as Vinculos) || {};
  } catch {
    return {};
  }
}

/** "🥉 Lavagem Bronze" → "lavagem bronze" (para casar nomes do site com o SAS). */
export function normalizarNome(nome: string): string {
  return String(nome || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Nome do SAS sem emoji/símbolo na frente. */
export function limparNome(nome: string): string {
  return String(nome || "").replace(/^[^\p{L}\p{N}]+/u, "").trim();
}

/** "1h 30min" / "45min" / "2h" (formato do SAS) → "1h30" / "45min" / "2h" (formato do site). */
export function duracaoSite(tempo: string | null): string | null {
  if (!tempo) return null;
  const h = /(\d+)\s*h/i.exec(tempo);
  const m = /(\d+)\s*min/i.exec(tempo);
  const total = (h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0);
  if (!total) return null;
  const hh = Math.floor(total / 60), mm = total % 60;
  if (!hh) return `${mm}min`;
  return mm ? `${hh}h${String(mm).padStart(2, "0")}` : `${hh}h`;
}

/**
 * Para cada serviço do site, qual serviço do SAS corresponde: o vínculo
 * escolhido no console ou, sem vínculo, o de mesmo nome.
 */
export function casarServicos<T extends { slug: string; nome: string }>(site: T[], sas: ServicoSas[], vinculos: Vinculos): Map<string, ServicoSas> {
  const porId = new Map(sas.map((s) => [s.id, s]));
  const porNome = new Map(sas.map((s) => [normalizarNome(limparNome(s.nome)), s]));
  const mapa = new Map<string, ServicoSas>();
  for (const s of site) {
    const v = vinculos[s.slug];
    if (v === "nenhum") continue;
    const achado = v ? porId.get(v) : porNome.get(normalizarNome(s.nome));
    if (achado) mapa.set(s.slug, achado);
  }
  return mapa;
}

const TAG_DESTAQUE = "Mais pedido";

type ServicoSite = {
  slug: string;
  nome: string;
  duracao: string | null;
  preco_desde: number | null;
  tag: string | null;
  ativo: boolean;
};

/**
 * Aplica o que vem do SAS por cima do cadastro do site. Pausado no SAS =
 * fora da lista. Sem integração ou com erro, devolve a lista como estava.
 */
export async function aplicarServicosSas<T extends ServicoSite>(lista: T[]): Promise<(T & { sincronizadoSas?: boolean })[]> {
  const sas = await getServicosSas();
  if (!sas) return lista;
  const mapa = casarServicos(lista, sas, await getVinculos());
  if (!mapa.size) return lista;
  const algumDestaque = [...mapa.values()].some((s) => s.destaque);
  return lista
    .map((s) => {
      const v = mapa.get(s.slug);
      if (!v) return s;
      let tag = s.tag;
      if (algumDestaque) {
        if (v.destaque && !tag) tag = TAG_DESTAQUE;
        if (!v.destaque && tag === TAG_DESTAQUE) tag = null;
      }
      return {
        ...s,
        nome: limparNome(v.nome) || s.nome,
        preco_desde: v.preco == null ? null : Math.round(Number(v.preco) * 100) / 100,
        duracao: duracaoSite(v.duracao) ?? s.duracao,
        tag,
        ativo: v.ativo,
        sincronizadoSas: true,
      };
    })
    .filter((s) => s.ativo !== false);
}

// ── Horário de funcionamento ────────────────────────────────────────

/** "09:00" → "9h", "09:30" → "9h30" */
function horaCurta(hm: string | null): string {
  if (!hm) return "";
  const [h, m] = hm.split(":");
  return `${Number(h)}h${m && m !== "00" ? m : ""}`;
}

const dataBr = (iso: string) => iso.split("-").reverse().slice(0, 2).join("/");

/**
 * Semana em linhas agrupando dias seguidos com o mesmo horário:
 * ["Segunda a sexta: 9h às 18h", "Sábado: 9h às 17h", "Domingo: fechado"]
 */
export function linhasSemana(semana: DiaSemanaSas[]): string[] {
  const grupos: { dias: DiaSemanaSas[]; chave: string }[] = [];
  for (const d of semana) {
    const chave = d.aberto ? `${d.inicio}-${d.fim}` : "fechado";
    const ult = grupos[grupos.length - 1];
    if (ult && ult.chave === chave) ult.dias.push(d);
    else grupos.push({ dias: [d], chave });
  }
  return grupos.map(({ dias, chave }) => {
    const nomes = dias.length === 1 ? dias[0].nome : dias.length === 2 ? `${dias[0].nome} e ${dias[1].nome.toLowerCase()}` : `${dias[0].nome} a ${dias[dias.length - 1].nome.toLowerCase()}`;
    const d = dias[0];
    return chave === "fechado" ? `${nomes}: fechado` : `${nomes}: ${horaCurta(d.inicio)} às ${horaCurta(d.fim)}`;
  });
}

/** "02/11 (Finados): fechado" / "15/11 (Proclamação da República): 10h às 14h" */
export function linhasExcecoes(excecoes: ExcecaoSas[], limite = 4): string[] {
  return excecoes.slice(0, limite).map((e) => {
    const quando = e.dataFim && e.dataFim !== e.data ? `${dataBr(e.data)} a ${dataBr(e.dataFim)}` : dataBr(e.data);
    const motivo = e.motivo ? ` (${e.motivo})` : "";
    const o = e.tipo === "fechado" ? "fechado" : e.tipo === "horario" ? `${horaCurta(e.inicio)} às ${horaCurta(e.fim)}` : `fechado das ${horaCurta(e.inicio)} às ${horaCurta(e.fim)}`;
    return `${quando}${motivo}: ${o}`;
  });
}

/** Aviso do dia para o topo/rodapé: só quando hoje foge do normal. */
export function avisoHoje(f: FuncionamentoSas): string {
  const h = f.hoje;
  if (!h.aberto && h.motivo) return `Hoje estamos fechados (${h.motivo}).`;
  if (h.aberto && !h.abertoAgora && h.reabreAs) return `Fechado agora${h.motivo ? ` (${h.motivo})` : ""}. Reabrimos hoje às ${horaCurta(h.reabreAs)}.`;
  if (h.aberto && h.especial) return `Hoje em horário especial${h.motivo ? ` (${h.motivo})` : ""}: ${horaCurta(h.inicio)} às ${horaCurta(h.fim)}.`;
  return "";
}

type ContatoBase = {
  horarioSemana: string;
  horarioSabado: string;
  observacaoHorario: string;
  levaETraz: boolean;
};

export type ContatoSincronizado<T> = T & { horarioLinhas?: string[]; horarioAvisoHoje?: string; horarioSas?: FuncionamentoSas };

/** Horário e leva e traz do SAS por cima do que foi digitado no console. */
export async function aplicarFuncionamentoSas<T extends ContatoBase>(contato: T): Promise<ContatoSincronizado<T>> {
  const f = await getFuncionamentoSas();
  if (!f) return contato;
  const out: ContatoSincronizado<T> = { ...contato, levaETraz: f.levaTras.disponivel, horarioSas: f };
  if (f.configurado) {
    const linhas = linhasSemana(f.semana);
    out.horarioLinhas = linhas;
    // Os dois campos antigos continuam preenchidos para quem ainda os lê.
    out.horarioSemana = linhas[0] || contato.horarioSemana;
    out.horarioSabado = linhas.slice(1).join(" · ");
    const especiais = linhasExcecoes(f.excecoes.filter((e) => e.tipo !== "pausa"));
    out.observacaoHorario = especiais.length ? `Datas especiais: ${especiais.join(" · ")}` : contato.observacaoHorario;
    out.horarioAvisoHoje = avisoHoje(f);
  }
  return out;
}
