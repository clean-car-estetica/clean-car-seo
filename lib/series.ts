// 20/10/2026: séries dos gráficos do painel, do mesmo jeito para qualquer período:
//   Hoje (1 dia)      → por hora, comparado com ontem
//   até 45 dias       → por dia, comparado com os mesmos dias antes
//   mais de 45 dias   → por semana (90 dias = 13 barras, não 90 riscos)
// O período anterior tem sempre o mesmo número de dias, então o ponto i de
// um corresponde ao ponto i do outro.

/** valor null = ainda não aconteceu (horas que faltam de hoje): a linha para ali. */
export type Ponto = {
  rotulo: string; dica: string; valor: number | null; antes?: number; parcial?: boolean;
  /** previsão (dias/horas que ainda não chegaram) e a faixa provável */
  prev?: number; faixa?: [number, number];
};

const dataBR = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const diaSemana = (d: string) => DIAS_SEMANA[new Date(d + "T12:00:00Z").getUTCDay()];

export const LIMITE_DIARIO = 45;

export function serieDiaria(
  atual: { data: string; valor: number }[],
  antes?: { data: string; valor: number }[],
  /** dias depois desta data ainda estão incompletos (Search Console) */
  completoAte?: string
): Ponto[] {
  const parcial = (d: string) => Boolean(completoAte && d > completoAte);
  if (atual.length <= LIMITE_DIARIO) {
    return atual.map((p, i) => ({
      rotulo: dataBR(p.data),
      dica: `${diaSemana(p.data)} ${dataBR(p.data)}`,
      valor: p.valor,
      antes: antes?.[i]?.valor,
      parcial: parcial(p.data),
    }));
  }
  const out: Ponto[] = [];
  for (let i = 0; i < atual.length; i += 7) {
    const fatia = atual.slice(i, i + 7);
    const fatiaAntes = antes?.slice(i, i + 7);
    const ult = fatia[fatia.length - 1];
    out.push({
      rotulo: dataBR(fatia[0].data),
      dica: fatia.length === 1 ? dataBR(fatia[0].data) : `${dataBR(fatia[0].data)} a ${dataBR(ult.data)}`,
      valor: fatia.reduce((t, p) => t + p.valor, 0),
      antes: fatiaAntes?.length ? fatiaAntes.reduce((t, p) => t + p.valor, 0) : undefined,
      parcial: fatia.some((p) => parcial(p.data)),
    });
  }
  return out;
}

/** 24 pontos (0h a 23h). ateHora: em "Hoje", as horas seguintes ficam sem valor. */
export function serieHoraria(atual: number[], antes?: number[], ateHora?: number): Ponto[] {
  return Array.from({ length: 24 }, (_, h) => ({
    rotulo: `${String(h).padStart(2, "0")}h`,
    dica: `${String(h).padStart(2, "0")}h às ${String(h).padStart(2, "0")}h59`,
    valor: ateHora !== undefined && h > ateHora ? null : atual[h] ?? 0,
    antes: antes ? antes[h] ?? 0 : undefined,
  }));
}

/** Soma por dia da semana (seg a dom) dos dias do período. */
export function seriePorDiaSemana(atual: { data: string; valor: number }[]): Ponto[] {
  const somas = Array<number>(7).fill(0);
  for (const p of atual) somas[new Date(p.data + "T12:00:00Z").getUTCDay()] += p.valor;
  return [1, 2, 3, 4, 5, 6, 0].map((d) => ({ rotulo: DIAS_SEMANA[d], dica: DIAS_SEMANA[d], valor: somas[d] }));
}

/** Hora atual em São Paulo (0 a 23). */
export const horaAgoraSP = () => new Date(Date.now() - 3 * 3_600_000).getUTCHours();
