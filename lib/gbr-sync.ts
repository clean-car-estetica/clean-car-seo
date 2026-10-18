import { supabaseAdmin } from "@/lib/supabase-admin";
import { supabasePublico } from "@/lib/supabase";
import { slugify } from "@/lib/slug";

/**
 * Sincronização com o GBR SAS (17/10/2026).
 *
 * O que vem do SAS, sem cadastrar duas vezes:
 * - serviços: nome, preço, duração, destaque ("Mais pedido") e pausa
 *   (serviço pausado no SAS some do site);
 * - horário de funcionamento, feriados, horários especiais e fechamentos;
 * - leva e traz (pausado no SAS = some do site);
 * - fidelidade (18/10/2026): pontos por serviço, benefícios (regras de
 *   resgate) e pontos do Indique e Ganhe.
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
  descricao?: string | null;
  preco: number | null;
  /** Valor "a partir de": o preço final só depois de avaliar o carro */
  avaliacaoPrevia?: boolean;
  duracao: string | null;
  destaque: boolean;
  ativo: boolean;
  /** Pontos de fidelidade que o serviço credita (18/10/2026). Ausente em SAS antigo. */
  pontos?: number;
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
 * escolhido no console ou, sem vínculo, o de mesmo nome — ou nome parecido
 * ("Higienização Interna VIP" × "Higienização Interna"), se só um servir.
 */
export function casarServicos<T extends { slug: string; nome: string }>(site: T[], sas: ServicoSas[], vinculos: Vinculos): Map<string, ServicoSas> {
  const porId = new Map(sas.map((s) => [s.id, s]));
  const nomeSas = new Map(sas.map((s) => [s.id, normalizarNome(limparNome(s.nome))]));
  const mapa = new Map<string, ServicoSas>();
  const usados = new Set<string>();
  // 1) vínculos escolhidos à mão
  for (const s of site) {
    const v = vinculos[s.slug];
    if (v && v !== "nenhum" && porId.has(v) && !usados.has(v)) { mapa.set(s.slug, porId.get(v)!); usados.add(v); }
  }
  // 2) mesmo nome
  for (const s of site) {
    if (mapa.has(s.slug) || vinculos[s.slug]) continue;
    const n = normalizarNome(s.nome);
    const achado = sas.find((x) => !usados.has(x.id) && nomeSas.get(x.id) === n);
    if (achado) { mapa.set(s.slug, achado); usados.add(achado.id); }
  }
  // 3) nome parecido: um contém o outro, palavra por palavra, e só há um candidato
  const contem = (a: string, b: string) => (` ${a} `).includes(` ${b} `);
  for (const s of site) {
    if (mapa.has(s.slug) || vinculos[s.slug]) continue;
    const n = normalizarNome(s.nome);
    const cands = sas.filter((x) => !usados.has(x.id) && (contem(n, nomeSas.get(x.id)!) || contem(nomeSas.get(x.id)!, n)));
    if (cands.length === 1) { mapa.set(s.slug, cands[0]); usados.add(cands[0].id); }
  }
  return mapa;
}

const TAG_DESTAQUE = "Mais pedido";

type ServicoSite = {
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  duracao: string | null;
  preco_desde: number | null;
  avaliacao_previa?: boolean;
  imagem_url: string;
  tag: string | null;
  pontos_fidelidade: number;
  ordem: number;
  termo_popular: string | null;
  ativo: boolean;
};

function slugUnico(nome: string, ocupados: Set<string>): string {
  const base = slugify(limparNome(nome)) || "servico";
  let s = base, i = 2;
  while (ocupados.has(s)) s = `${base}-${i++}`;
  ocupados.add(s);
  return s;
}

/** Primeira frase da descrição do SAS, para o resumo do card. */
function resumoDe(descricao: string | null | undefined): string {
  const t = String(descricao || "").replace(/\s+/g, " ").trim();
  if (!t) return "";
  const m = /^(.{20,160}?[.!?])(\s|$)/.exec(t);
  return (m ? m[1] : t.slice(0, 140)).trim();
}

/**
 * 17/10/2026 (Glauber): o SAS manda nos serviços. Com a integração ligada,
 * o site mostra exatamente os serviços ativos do SAS, na ordem do SAS, com
 * nome, preço, duração e destaque do SAS. Do cadastro do site vêm só foto,
 * descrição, resumo e textos de SEO (e o endereço da página, quando já
 * existia). Serviço novo no SAS aparece sozinho (com a descrição do SAS até
 * alguém escrever uma no console). Serviço que só existe no site some —
 * a não ser que esteja marcado no console para continuar ("nenhum").
 * Sem integração ou com erro, devolve a lista como estava.
 */
export async function aplicarServicosSas<T extends ServicoSite>(lista: T[], fotoPadrao?: (slug: string) => string): Promise<(T & { sincronizadoSas?: boolean; gbrServicoId?: string })[]> {
  const sas = await getServicosSas();
  if (!sas || !sas.length) return lista;
  const vinculos = await getVinculos();
  const mapa = casarServicos(lista, sas, vinculos);
  const siteDoSas = new Map([...mapa.entries()].map(([slug, v]) => [v.id, lista.find((s) => s.slug === slug)!]));
  const ocupados = new Set(lista.map((s) => s.slug));
  const algumDestaque = sas.some((s) => s.destaque);
  const saida: (T & { sincronizadoSas?: boolean; gbrServicoId?: string })[] = [];
  sas.forEach((v, i) => {
    if (!v.ativo) return;
    const base = siteDoSas.get(v.id) ?? ({
      slug: slugUnico(v.nome, ocupados), nome: limparNome(v.nome), resumo: resumoDe(v.descricao), descricao: v.descricao || "",
      duracao: null, preco_desde: null, imagem_url: "", tag: null, pontos_fidelidade: 0, ordem: 0, termo_popular: null, ativo: true,
    } as unknown as T);
    let tag = base.tag;
    if (algumDestaque) {
      if (v.destaque && !tag) tag = TAG_DESTAQUE;
      if (!v.destaque && tag === TAG_DESTAQUE) tag = null;
    }
    saida.push({
      ...base,
      nome: limparNome(v.nome) || base.nome,
      preco_desde: v.preco == null ? null : Math.round(Number(v.preco) * 100) / 100,
      avaliacao_previa: v.avaliacaoPrevia === true,
      duracao: duracaoSite(v.duracao) ?? base.duracao,
      descricao: base.descricao || v.descricao || "",
      resumo: base.resumo || resumoDe(v.descricao),
      imagem_url: base.imagem_url || (fotoPadrao ? fotoPadrao(base.slug) : ""),
      tag,
      // 18/10/2026: os pontos que aparecem no site são os mesmos que o Caixa credita.
      pontos_fidelidade: typeof v.pontos === "number" ? v.pontos : base.pontos_fidelidade,
      ordem: i + 1,
      ativo: true,
      sincronizadoSas: true,
      gbrServicoId: v.id,
    });
  });
  // Mantidos de propósito no console mesmo sem existir no SAS
  for (const s of lista) if (vinculos[s.slug] === "nenhum" && s.ativo !== false) saida.push({ ...s, ordem: saida.length + 1 });
  return saida;
}

// ── Fidelidade (18/10/2026) ─────────────────────────────────────────

export type BeneficioSas = {
  id: string;
  nome: string;
  pontos: number;
  tipo: string | null;
  descontoValor: number | null;
  servicoGratis: string | null;
  descricao: string | null;
};
export type ProgramaFidelidadeSas = {
  beneficios: BeneficioSas[];
  indicacao: { ativo: boolean; pontosIndicador: number; pontosIndicado: number } | null;
};

/** Regras de resgate e Indique e Ganhe cadastrados no SAS. null = sem integração/erro. */
export async function getProgramaFidelidadeSas(): Promise<ProgramaFidelidadeSas | null> {
  const r = await buscar<ProgramaFidelidadeSas>("/beneficios");
  return r && Array.isArray(r.beneficios) ? r : null;
}

/**
 * Troca o número de pontos dos textos do Indique e Ganhe pelos do SAS.
 * Aceita {pontos_indicador}/{pontos_indicado} no texto ou, em texto antigo
 * com número digitado ("ganha 20 pontos"), troca o número: o texto "Já sou
 * cliente" fala do indicador e as regras de "Recebi um código", do indicado.
 */
export function pontosNoTexto(texto: string, pontos: number, token: "pontos_indicador" | "pontos_indicado"): string {
  const t = String(texto || "");
  if (t.includes(`{${token}}`)) return t.split(`{${token}}`).join(String(pontos));
  return t.replace(/\b\d+(\s*pontos?)\b/gi, (_m, sufixo: string) => `${pontos}${pontos === 1 ? sufixo.replace(/s$/i, "") : sufixo.replace(/o$/i, "os")}`);
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

/**
 * Cria no cadastro do site (tabela services) os serviços do SAS que ainda
 * não têm entrada, para o console poder pôr foto e descrição neles. Também
 * grava o vínculo, para a página manter o mesmo endereço se o nome mudar.
 * Só roda no console (usa a chave service_role). Devolve quantos criou.
 */
export async function materializarServicosSas(): Promise<number> {
  const sas = await getServicosSas();
  if (!sas?.length) return 0;
  const { data: site } = await supabaseAdmin.from("services").select("slug, nome");
  const lista = (site || []) as { slug: string; nome: string }[];
  const vinculos = await getVinculos();
  const mapa = casarServicos(lista, sas, vinculos);
  const ligados = new Set([...mapa.values()].map((v) => v.id));
  const ocupados = new Set(lista.map((s) => s.slug));
  const novosVinculos: Vinculos = { ...vinculos };
  for (const [slug, v] of mapa) if (!vinculos[slug]) novosVinculos[slug] = v.id; // fixa os ligados pelo nome
  let criados = 0;
  for (const [i, v] of sas.entries()) {
    if (ligados.has(v.id) || !v.ativo) continue;
    const slug = slugUnico(v.nome, ocupados);
    const { error } = await supabaseAdmin.from("services").insert({
      slug, nome: limparNome(v.nome), resumo: resumoDe(v.descricao), descricao: v.descricao || "",
      imagem_url: "", ordem: i + 1, ativo: true, pontos_fidelidade: 0,
    });
    if (!error) { novosVinculos[slug] = v.id; criados++; }
  }
  if (JSON.stringify(novosVinculos) !== JSON.stringify(vinculos)) {
    await supabaseAdmin.from("site_content").upsert({ section: "gbr_vinculos", data: novosVinculos, updated_at: new Date().toISOString() });
  }
  return criados;
}
