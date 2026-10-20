// 20/10/2026: previsão e projeção do painel.
//
// Por dia: reta de tendência (mínimos quadrados) sobre o período escolhido
// mais o anterior, corrigida pelo dia da semana (sábado costuma ser diferente
// de terça) quando há pelo menos 3 semanas de dados. A faixa é o erro típico
// da reta (≈80% dos dias caem dentro). Nada de "IA": é a conta que qualquer
// planilha faz, e por isso dá para confiar no que ela diz e no que não diz.
//
// Hoje (por hora): o que falta do dia segue o desenho de ontem, na proporção
// do que hoje já fez até agora.

export type Previsao = {
  /** valores previstos, um por dia (ou hora) a partir do próximo */
  valores: number[];
  faixa: [number, number][];
  /** variação da tendência por semana, em % da média (null = poucos dados) */
  tendenciaSemana: number | null;
  mediaDia: number;
};

const diaSemana = (iso: string) => new Date(iso + "T12:00:00Z").getUTCDay();
const deslocar = (iso: string, dias: number) => new Date(Date.parse(iso + "T00:00:00Z") + dias * 86_400_000).toISOString().slice(0, 10);

export function preverDias(historico: { data: string; valor: number }[], horizonte: number): Previsao | null {
  const h = historico.filter((p) => Number.isFinite(p.valor));
  if (h.length < 5) return null;
  const media = h.reduce((t, p) => t + p.valor, 0) / h.length;
  if (media === 0) return { valores: Array(horizonte).fill(0), faixa: Array(horizonte).fill([0, 0]), tendenciaSemana: 0, mediaDia: 0 };

  // fator do dia da semana (só com 3 semanas ou mais; suavizado para não exagerar)
  const fator = Array<number>(7).fill(1);
  if (h.length >= 21) {
    const soma = Array<number>(7).fill(0), qtd = Array<number>(7).fill(0);
    for (const p of h) { soma[diaSemana(p.data)] += p.valor; qtd[diaSemana(p.data)]++; }
    for (let d = 0; d < 7; d++) if (qtd[d]) fator[d] = 0.5 + 0.5 * (soma[d] / qtd[d] / media || 0);
  }

  const ys = h.map((p) => p.valor / (fator[diaSemana(p.data)] || 1));
  const nPts = ys.length;
  const xm = (nPts - 1) / 2;
  const ym = ys.reduce((t, v) => t + v, 0) / nPts;
  let num = 0, den = 0;
  ys.forEach((y, x) => { num += (x - xm) * (y - ym); den += (x - xm) ** 2; });
  const b = den ? num / den : 0;
  const a = ym - b * xm;
  const residuos = ys.map((y, x) => y - (a + b * x));
  const dp = Math.sqrt(residuos.reduce((t, r) => t + r * r, 0) / Math.max(1, nPts - 2));

  const ultimo = h[h.length - 1].data;
  const valores: number[] = [];
  const faixa: [number, number][] = [];
  for (let i = 1; i <= horizonte; i++) {
    const f = fator[diaSemana(deslocar(ultimo, i))];
    const base = Math.max(0, a + b * (nPts - 1 + i));
    const margem = 1.28 * dp * Math.sqrt(1 + 1 / nPts + ((nPts - 1 + i - xm) ** 2) / Math.max(1, den));
    valores.push(base * f);
    faixa.push([Math.max(0, (base - margem) * f), (base + margem) * f]);
  }
  return { valores, faixa, tendenciaSemana: nPts >= 14 ? (b * 7) / media : null, mediaDia: media };
}

/** Resto de hoje, hora a hora, no desenho de ontem. */
export function preverHoras(hoje: number[], ontem: number[], ateHora: number): Previsao {
  const feitoHoje = hoje.slice(0, ateHora + 1).reduce((t, v) => t + v, 0);
  const feitoOntem = ontem.slice(0, ateHora + 1).reduce((t, v) => t + v, 0);
  const k = feitoOntem > 0 ? Math.min(3, Math.max(0.3, feitoHoje / feitoOntem)) : 1;
  const valores = ontem.slice(ateHora + 1).map((v) => v * k);
  return {
    valores,
    faixa: valores.map((v) => [v * 0.6, v * 1.4] as [number, number]),
    tendenciaSemana: null,
    mediaDia: ontem.reduce((t, v) => t + v, 0),
  };
}

export const somar = (v: number[]) => v.reduce((t, x) => t + x, 0);
