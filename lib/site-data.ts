import { supabasePublico } from "@/lib/supabase";
import { servicos as servicosPadrao, cidades as cidadesPadrao } from "@/lib/data";
import { fotoServico } from "@/lib/fotos";
import { aplicarServicosSas } from "@/lib/gbr-sync";

export type CidadeDB = {
  slug: string;
  nome: string;
  bairros: string[];
  sede: boolean;
};

export async function getCidadesPublicas(): Promise<CidadeDB[]> {
  try {
    const { data, error } = await supabasePublico.from("cities").select("*").order("nome");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data as CidadeDB[];
  } catch {
    return cidadesPadrao;
  }
}

export async function getCidadePublica(slug: string): Promise<CidadeDB | null> {
  const todas = await getCidadesPublicas();
  return todas.find((c) => c.slug === slug) ?? null;
}

export type ServicoDB = {
  slug: string;
  nome: string;
  resumo: string;
  descricao: string;
  duracao: string | null;
  preco_desde: number | null;
  /** Vem do SAS: valor "a partir de", final após avaliação prévia */
  avaliacao_previa?: boolean;
  imagem_url: string;
  tag: string | null;
  pontos_fidelidade: number;
  ordem: number;
  termo_popular: string | null;
  ativo: boolean;
};

// 17/10/2026: nome, preço, duração, destaque e pausa vêm do GBR SAS quando a
// integração está ligada (lib/gbr-sync.ts). Fotos e textos seguem do console.
export async function getServicosPublicos(): Promise<ServicoDB[]> {
  return apenasAtivos(await aplicarServicosSas(await getServicosDoConsole(), (slug) => fotoServico(slug, "")));
}

// Com a integração do SAS ligada, traz também os desligados no console:
// quem decide se aparece é o SAS.
async function getServicosDoConsole(): Promise<ServicoDB[]> {
  try {
    const { data, error } = await supabasePublico.from("services").select("*").order("ordem");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return (data as ServicoDB[]).map((s) => ({ ...s, imagem_url: fotoServico(s.slug, s.imagem_url) }));
  } catch {
    return padraoDoCodigo();
  }
}

/** Sem SAS: só os ativos no console (como sempre foi). */
export function apenasAtivos<T extends { ativo: boolean; sincronizadoSas?: boolean }>(lista: T[]): T[] {
  return lista.filter((s) => s.sincronizadoSas || s.ativo !== false);
}

// Fallback: dados fixos do código, usados até a tabela ser populada no console
function padraoDoCodigo(): ServicoDB[] {
  {
    return [...servicosPadrao]
      .sort((a, b) => a.ordem - b.ordem)
      .map((s) => ({
        slug: s.slug,
        nome: s.nome,
        resumo: s.resumo,
        descricao: s.descricao,
        duracao: s.duracao ?? null,
        preco_desde: s.precoDesde ?? null,
        imagem_url: fotoServico(s.slug, s.imagem),
        tag: s.tag ?? null,
        pontos_fidelidade: s.pontosFidelidade ?? 0,
        ordem: s.ordem,
        termo_popular: s.termoPopular ?? null,
        ativo: true,
      }));
  }
}

export async function getServicoPublico(slug: string): Promise<ServicoDB | null> {
  const todos = await getServicosPublicos();
  return todos.find((s) => s.slug === slug) ?? null;
}

export type Transformacao = {
  id: number;
  titulo: string;
  descricao: string;
  imagem_antes: string;
  imagem_depois: string;
};

const transformacoesPadrao: Transformacao[] = [];

export async function getConteudoLocalPublico(servico: ServicoDB, cidade: { slug: string; bairros: string[]; sede: boolean }) {
  try {
    const { data, error } = await supabasePublico
      .from("local_pages_content")
      .select("*")
      .eq("service_slug", servico.slug)
      .eq("city_slug", cidade.slug)
      .maybeSingle();
    if (error) throw error;
    if (data?.paragrafos?.length) {
      return { paragrafos: data.paragrafos as string[], imagemOverride: data.imagem_url as string | null, proprio: true };
    }
  } catch {
    // sem override — usa o template padrão abaixo
  }
  const { getConteudoLocal } = await import("@/lib/content");
  const template = getConteudoLocal(
    {
      slug: servico.slug,
      nome: servico.nome,
      resumo: servico.resumo,
      descricao: servico.descricao,
      duracao: servico.duracao ?? undefined,
      precoDesde: servico.preco_desde ?? undefined,
      imagem: servico.imagem_url,
      tag: servico.tag ?? undefined,
      ordem: 0,
    },
    cidade as any
  );
  return { paragrafos: template.paragrafos, imagemOverride: null as string | null, proprio: false };
}

export type DepoimentoDB = { id: number; autor: string; nota: number; texto: string };

const depoimentosPadrao: DepoimentoDB[] = [];

export async function getDepoimentosPublicos(): Promise<DepoimentoDB[]> {
  try {
    const { data, error } = await supabasePublico.from("depoimentos").select("*").order("ordem");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data as DepoimentoDB[];
  } catch {
    return depoimentosPadrao;
  }
}

export type PlanoDB = {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  itens: string[];
  destaque: boolean;
  /** Pacotes do SAS: prazo para usar os serviços (30 = mensal) */
  validadeDias?: number;
};

export async function getPlanosPublicos(): Promise<PlanoDB[]> {
  try {
    const { data, error } = await supabasePublico.from("planos").select("*").order("ordem");
    if (error) throw error;
    return (data ?? []) as PlanoDB[];
  } catch {
    return [];
  }
}

export type BeneficioDB = { id: number; nome: string; pontos_necessarios: number };

export async function getBeneficiosPublicos(): Promise<BeneficioDB[]> {
  try {
    const { data, error } = await supabasePublico.from("beneficios").select("*").order("pontos_necessarios");
    if (error) throw error;
    return (data ?? []) as BeneficioDB[];
  } catch {
    return [];
  }
}

export type PassoDB = { id: number; titulo: string; texto: string };

export const processoPadrao: PassoDB[] = [
  { id: -1, titulo: "Você escolhe como entregar", texto: "Traz o carro até a loja e a gente cuida do resto, com hora marcada pra não perder tempo." },
  { id: -2, titulo: "Pré-lavagem técnica", texto: "Soltamos a sujeira mais grossa antes de qualquer contato direto na pintura, reduzindo o risco de microrriscos." },
  { id: -3, titulo: "Shampoo neutro + luvas próprias", texto: "Aplicação com luvas específicas para lavagem automotiva — o cuidado que protege o verniz do seu carro." },
  { id: -4, titulo: "Higienização com sanitizante", texto: "Limpeza interna que cuida da saúde de quem dirige, não só da aparência do carro." },
  { id: -5, titulo: "Produtos Vonixx do início ao fim", texto: "Química de ponta em cada etapa, da lavagem ao acabamento." },
];

export async function getProcessoPassos(): Promise<PassoDB[]> {
  try {
    const { data, error } = await supabasePublico.from("processo_passos").select("*").order("ordem");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data as PassoDB[];
  } catch {
    return processoPadrao;
  }
}

export const produtosPadrao = [
  "V-Floc", "V-Mol", "Sintra", "Delet", "Alumax", "Acidus", "Foam Gloss",
  "Pretinho Spray", "Hydrox", "Tok Final", "Impermeabilizante",
  "Revitalizador de Plásticos", "VLight Faróis",
  "Bactran", "Vexus", "Focus", "Glaco",
];

export async function getProdutosLista(): Promise<string[]> {
  try {
    const { data, error } = await supabasePublico.from("produtos_lista").select("nome").order("ordem");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data.map((d) => d.nome);
  } catch {
    return produtosPadrao;
  }
}

export type FaqDB = { id: number; pergunta: string; resposta: string };

export const faqsPadrao: FaqDB[] = [
  {
    id: -3,
    pergunta: "Preciso deixar o carro na loja o dia todo?",
    resposta:
      "Depende do serviço. Uma lavagem leva de 45 minutos a algumas horas, e a Higienização Interna VIP pede o dia todo. No agendamento a gente já informa o prazo certo.",
  },
  {
    id: -4,
    pergunta: "O que é hidrofobia e por que ela protege o carro?",
    resposta:
      "Hidrofobia é a propriedade que faz a água escorregar da pintura ou do vidro em vez de grudar. Com selantes e cristalizadores profissionais Vonixx, conseguimos essa repelência — o que reduz manchas de chuva ácida, facilita a limpeza e ajuda a manter a proteção da pintura por mais tempo.",
  },
  {
    id: -5,
    pergunta: "O tempo informado no site é exato?",
    resposta:
      "O tempo mostrado em cada serviço é o mínimo. Avaliamos o veículo antes de iniciar e informamos o tempo total definitivo — sem surpresas. Veículos em estado mais crítico podem levar um pouco mais.",
  },
  {
    id: -6,
    pergunta: "Vocês dão garantia do serviço?",
    resposta:
      "Sim. Lavagens: 24 horas para qualquer sujeira que tenha ficado do serviço. Higienizações: 72 horas para mancha ou odor que já existia e persistiu. Restauração de faróis: 48 horas para manchas que persistirem. A garantia não cobre sujeira nova, danos pré-existentes, desgaste natural ou uso inadequado.",
  },
  {
    id: -7,
    pergunta: "Qual o horário de funcionamento?",
    resposta:
      "Segunda a sexta das 9h às 18h, e sábado das 9h às 17h. Em feriados e feriados prolongados, o horário pode ser alterado — confirme pelo WhatsApp antes de vir.",
  },
];

export async function getFaqsPublicos(): Promise<FaqDB[]> {
  try {
    const { data, error } = await supabasePublico.from("faqs").select("*").order("ordem");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data as FaqDB[];
  } catch {
    return faqsPadrao;
  }
}

export async function getTransformacoesPublicas(): Promise<Transformacao[]> {
  try {
    const { data, error } = await supabasePublico.from("transformacoes").select("*").order("ordem");
    if (error || !data || data.length === 0) throw error ?? new Error("vazio");
    return data as Transformacao[];
  } catch {
    return transformacoesPadrao;
  }
}
