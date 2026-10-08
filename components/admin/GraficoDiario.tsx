"use client";

import { useRef, useState } from "react";

// Gráfico de um indicador por dia: linha com área (ou barras), grade discreta,
// eixo Y com 3 marcas e dica ao passar o mouse/dedo. Um indicador por gráfico,
// nunca dois eixos.
export default function GraficoDiario({
  pontos,
  unidade,
  tipo = "linha",
  cor = "var(--verniz)",
  altura = 180,
}: {
  pontos: { data: string; valor: number }[];
  unidade: string;
  tipo?: "linha" | "barras";
  cor?: string;
  altura?: number;
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const [foco, setFoco] = useState<number | null>(null);
  const L = 640, A = altura, mE = 34, mD = 8, mT = 10, mB = 24;
  const n = pontos.length;
  const max = Math.max(1, ...pontos.map((p) => p.valor));
  const passo = max <= 4 ? 1 : Math.ceil(max / 3 / (max > 50 ? 10 : 1)) * (max > 50 ? 10 : 1);
  const topo = Math.max(passo * 3, max);
  const x = (i: number) => mE + (n <= 1 ? 0 : (i * (L - mE - mD)) / (n - 1));
  const larguraBarra = Math.max(2, (L - mE - mD) / Math.max(n, 1) - 3);
  const xb = (i: number) => mE + i * ((L - mE - mD) / Math.max(n, 1)) + 1.5;
  const y = (v: number) => mT + (A - mT - mB) * (1 - v / topo);
  const fmtData = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
  const marcas = [0, passo, passo * 2, passo * 3].filter((v) => v <= topo);
  const total = pontos.reduce((s, p) => s + p.valor, 0);

  if (n === 0 || total === 0) {
    return (
      <div className="h-[140px] grid place-items-center text-sm text-steel-line border border-dashed border-card-line rounded-xl">
        Ainda sem {unidade} neste período.
      </div>
    );
  }

  const linha = pontos.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.valor).toFixed(1)}`).join(" ");
  const area = `${linha} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const rotulosX = [0, Math.floor((n - 1) / 2), n - 1].filter((v, i, a) => a.indexOf(v) === i);

  function mover(clientX: number) {
    const r = caixa.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((clientX - r.left) / r.width) * L;
    const i = tipo === "barras"
      ? Math.floor((px - mE) / ((L - mE - mD) / n))
      : Math.round(((px - mE) / (L - mE - mD)) * (n - 1));
    setFoco(Math.min(n - 1, Math.max(0, i)));
  }

  const f = foco !== null ? pontos[foco] : null;
  const fx = foco !== null ? (tipo === "barras" ? xb(foco) + larguraBarra / 2 : x(foco)) : 0;

  return (
    <div
      ref={caixa}
      className="relative select-none touch-pan-y"
      onMouseMove={(e) => mover(e.clientX)}
      onMouseLeave={() => setFoco(null)}
      onTouchStart={(e) => mover(e.touches[0].clientX)}
      onTouchMove={(e) => mover(e.touches[0].clientX)}
    >
      <svg viewBox={`0 0 ${L} ${A}`} className="w-full h-auto block" role="img" aria-label={`${unidade} por dia`}>
        {marcas.map((v) => (
          <g key={v}>
            <line x1={mE} x2={L - mD} y1={y(v)} y2={y(v)} stroke="var(--card-line)" strokeWidth="1" />
            <text x={mE - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--steel-line, #8b96a5)">{v}</text>
          </g>
        ))}
        {tipo === "linha" ? (
          <>
            <path d={area} fill={cor} opacity="0.14" />
            <path d={linha} fill="none" stroke={cor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <circle cx={x(n - 1)} cy={y(pontos[n - 1].valor)} r="4" fill={cor} stroke="var(--card)" strokeWidth="2" />
          </>
        ) : (
          pontos.map((p, i) =>
            p.valor > 0 ? (
              <rect
                key={p.data}
                x={xb(i)}
                y={y(p.valor)}
                width={larguraBarra}
                height={Math.max(1, y(0) - y(p.valor))}
                rx={Math.min(4, larguraBarra / 2)}
                fill={cor}
                opacity={foco === null || foco === i ? 1 : 0.45}
              />
            ) : null
          )
        )}
        {rotulosX.map((i) => (
          <text key={i} x={tipo === "barras" ? xb(i) + larguraBarra / 2 : x(i)} y={A - 6} fontSize="11" textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fill="var(--steel-line, #8b96a5)">
            {fmtData(pontos[i].data)}
          </text>
        ))}
        {f && (
          <>
            <line x1={fx} x2={fx} y1={mT} y2={y(0)} stroke="var(--steel-line, #8b96a5)" strokeWidth="1" strokeDasharray="3 3" />
            {tipo === "linha" && <circle cx={fx} cy={y(f.valor)} r="5" fill={cor} stroke="var(--card)" strokeWidth="2" />}
          </>
        )}
      </svg>
      {f && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-carbon border border-card-line px-3 py-1.5 text-xs shadow-lg whitespace-nowrap"
          style={{ left: `${Math.min(88, Math.max(12, (fx / L) * 100))}%` }}
        >
          <span className="text-steel-line">{fmtData(f.data)}</span>{" "}
          <b className="text-steel tabular-nums">{f.valor.toLocaleString("pt-BR")}</b>{" "}
          <span className="text-steel-line">{unidade}</span>
        </div>
      )}
    </div>
  );
}
