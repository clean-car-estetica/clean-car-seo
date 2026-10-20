"use client";

import { useRef, useState } from "react";
import type { Ponto } from "@/lib/series";

// 20/10/2026: substitui o GraficoDiario. Um indicador por gráfico (nunca dois
// eixos), agora com o período anterior em cinza por baixo, para ver de relance
// se subiu ou caiu, e funcionando por hora (Hoje), por dia ou por semana.
const COR_ANTES = "#6b7686";

const fmt = (v: number, casas = 0) => v.toLocaleString("pt-BR", { maximumFractionDigits: casas });

function marcasY(max: number) {
  if (max <= 4) return { topo: Math.max(1, Math.ceil(max)), passo: 1 };
  const bruto = max / 3;
  const ordem = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * ordem).find((p) => p >= bruto) ?? bruto;
  return { topo: passo * Math.ceil(max / passo), passo };
}

export default function GraficoSerie({
  pontos,
  unidade,
  tipo = "linha",
  cor = "var(--verniz)",
  altura = 190,
  comparar = true,
  inverter = false,
  casas = 0,
  somar = true,
  totais,
}: {
  pontos: Ponto[];
  unidade: string;
  tipo?: "linha" | "barras";
  cor?: string;
  altura?: number;
  /** desenha o período anterior em cinza (quando houver) */
  comparar?: boolean;
  /** menor é melhor (posição no Google): o eixo cresce para baixo */
  inverter?: boolean;
  casas?: number;
  /** mostra o total no topo (não faz sentido para médias, como posição) */
  somar?: boolean;
  /** total certo quando somar os pontos daria errado (pessoas diferentes: quem volta em dois dias conta uma vez) */
  totais?: { atual: number; antes?: number };
}) {
  const caixa = useRef<HTMLDivElement>(null);
  const [foco, setFoco] = useState<number | null>(null);
  const n = pontos.length;
  if (n <= 2) tipo = "barras";
  const temAntes = comparar && pontos.some((p) => p.antes !== undefined && p.antes > 0);
  const temPrev = pontos.some((p) => p.prev !== undefined);
  if (temPrev) tipo = "linha";
  const valores = pontos.map((p) => p.valor ?? 0);
  const soma = valores.reduce((t, v) => t + v, 0);
  const total = totais?.atual ?? soma;
  const totalAntes = totais?.antes ?? pontos.reduce((t, p) => t + (p.antes ?? 0), 0);

  if (n === 0 || (soma === 0 && !temAntes && !temPrev)) {
    return (
      <div className="h-[150px] grid place-items-center text-sm text-steel-line border border-dashed border-card-line rounded-xl px-4 text-center">
        Ainda sem {unidade} neste período.
      </div>
    );
  }

  const L = 640, A = altura, mE = 38, mD = 10, mT = 12, mB = 24;
  const max = Math.max(...valores, ...(temAntes ? pontos.map((p) => p.antes ?? 0) : [0]), ...pontos.map((p) => p.faixa?.[1] ?? p.prev ?? 0));
  const { topo, passo } = marcasY(max);
  const y = (v: number) => (inverter ? mT + (A - mT - mB) * (v / topo) : mT + (A - mT - mB) * (1 - v / topo));
  const base = inverter ? mT : A - mB;
  const fatia = (L - mE - mD) / n;
  const larguraBarra = Math.min(48, Math.max(3, fatia - 2));
  const xc = (i: number) => (tipo === "barras" ? mE + i * fatia + fatia / 2 : mE + (n <= 1 ? (L - mE - mD) / 2 : (i * (L - mE - mD)) / (n - 1)));
  const marcas: number[] = [];
  for (let v = 0; v <= topo + 1e-9; v += passo) marcas.push(v);

  // linha: quebra onde o valor é null (horas que ainda não chegaram)
  const caminho = (vals: (number | null)[]) => {
    let d = "";
    let caneta = false;
    vals.forEach((v, i) => {
      if (v === null) { caneta = false; return; }
      d += `${caneta ? "L" : "M"}${xc(i).toFixed(1)},${y(v).toFixed(1)} `;
      caneta = true;
    });
    return d.trim();
  };
  const linha = caminho(pontos.map((p) => p.valor));
  const ultimo = pontos.reduce((u, p, i) => (p.valor !== null ? i : u), -1);
  const primeiro = pontos.findIndex((p) => p.valor !== null);
  const area = ultimo >= 0 ? `${caminho(pontos.slice(0, ultimo + 1).map((p) => p.valor))} L${xc(ultimo)},${base} L${xc(primeiro)},${base} Z` : "";
  const linhaAntes = temAntes ? caminho(pontos.map((p) => p.antes ?? 0)) : "";
  // previsão: sai do último ponto real, tracejada, com a faixa provável por baixo
  const iPrev = pontos.map((p, i) => (p.prev !== undefined ? i : -1)).filter((i) => i >= 0);
  const ancora = ultimo >= 0 ? [{ i: ultimo, v: pontos[ultimo].valor ?? 0 }] : [];
  const linhaPrev = iPrev.length
    ? [...ancora, ...iPrev.map((i) => ({ i, v: pontos[i].prev! }))].map((q, k) => `${k ? "L" : "M"}${xc(q.i).toFixed(1)},${y(q.v).toFixed(1)}`).join(" ")
    : "";
  const faixaPrev = iPrev.length
    ? `${[...ancora.map((q) => ({ i: q.i, v: q.v })), ...iPrev.map((i) => ({ i, v: pontos[i].faixa?.[1] ?? pontos[i].prev! }))].map((q, k) => `${k ? "L" : "M"}${xc(q.i).toFixed(1)},${y(q.v).toFixed(1)}`).join(" ")} ${[...iPrev].reverse().map((i) => `L${xc(i).toFixed(1)},${y(pontos[i].faixa?.[0] ?? pontos[i].prev!).toFixed(1)}`).join(" ")}${ancora.length ? ` L${xc(ancora[0].i).toFixed(1)},${y(ancora[0].v).toFixed(1)}` : ""} Z`
    : "";

  const qtdRotulos = n <= 8 ? n : n === 24 ? 8 : 5;
  const rotulosX = [...new Set(Array.from({ length: qtdRotulos }, (_, k) => Math.round((k * (n - 1)) / Math.max(1, qtdRotulos - 1))))];
  const mostrarValores = tipo === "barras" && n <= 14 && !temAntes;

  function mover(clientX: number) {
    const r = caixa.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((clientX - r.left) / r.width) * L;
    const i = tipo === "barras" ? Math.floor((px - mE) / fatia) : Math.round(((px - mE) / (L - mE - mD)) * (n - 1));
    setFoco(Math.min(n - 1, Math.max(0, i)));
  }

  const f = foco !== null ? pontos[foco] : null;
  const variacao = temAntes && totalAntes > 0 && somar ? Math.round(((total - totalAntes) / totalAntes) * 100) : null;
  const melhorou = variacao !== null && (inverter ? variacao < 0 : variacao > 0);

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-steel-line">
        {somar && (
          <span>
            Total <b className="text-steel text-sm tabular-nums">{fmt(total, casas)}</b>
            {variacao !== null && (
              <b className={`ml-1.5 tabular-nums ${variacao === 0 ? "text-steel-line" : melhorou ? "text-ok" : "text-warn"}`}>
                {variacao > 0 ? "+" : variacao < 0 ? "−" : ""}{Math.abs(variacao)}%
              </b>
            )}
          </span>
        )}
        {temPrev && (
          <span className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5"><i className="inline-block w-3 h-[3px] rounded" style={{ background: cor }} /> até agora</span>
            <span className="flex items-center gap-1.5"><i className="inline-block w-3 border-t-2 border-dashed" style={{ borderColor: cor }} /> previsão</span>
            <span className="flex items-center gap-1.5"><i className="inline-block w-3 h-2 rounded-sm opacity-30" style={{ background: cor }} /> faixa provável</span>
          </span>
        )}
        {temAntes && (
          <span className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5"><i className="inline-block w-3 h-[3px] rounded" style={{ background: cor }} /> este período</span>
            <span className="flex items-center gap-1.5"><i className="inline-block w-3 h-[3px] rounded" style={{ background: COR_ANTES }} /> anterior{somar ? ` (${fmt(totalAntes, casas)})` : ""}</span>
          </span>
        )}
      </div>
      <div
        ref={caixa}
        className="relative select-none touch-pan-y"
        onMouseMove={(e) => mover(e.clientX)}
        onMouseLeave={() => setFoco(null)}
        onTouchStart={(e) => mover(e.touches[0].clientX)}
        onTouchMove={(e) => mover(e.touches[0].clientX)}
      >
        <svg viewBox={`0 0 ${L} ${A}`} className="w-full h-auto block" role="img" aria-label={`${unidade}: total ${fmt(total, casas)}`}>
          {marcas.map((v) => (
            <g key={v}>
              <line x1={mE} x2={L - mD} y1={y(v)} y2={y(v)} stroke="var(--card-line)" strokeWidth="1" />
              <text x={mE - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--steel-line)">{fmt(v, passo < 1 ? 1 : 0)}</text>
            </g>
          ))}
          {tipo === "linha" ? (
            <>
              {linhaAntes && <path d={linhaAntes} fill="none" stroke={COR_ANTES} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />}
              {area && !inverter && <path d={area} fill={cor} opacity="0.12" />}
              {faixaPrev && <path d={faixaPrev} fill={cor} opacity="0.13" />}
              {linhaPrev && <path d={linhaPrev} fill="none" stroke={cor} strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />}
              <path d={linha} fill="none" stroke={cor} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {ultimo >= 0 && <circle cx={xc(ultimo)} cy={y(pontos[ultimo].valor ?? 0)} r="4" fill={cor} stroke="var(--card)" strokeWidth="2" />}
            </>
          ) : (
            pontos.map((p, i) => {
              const xb = xc(i) - larguraBarra / 2;
              const ativo = foco === null || foco === i;
              return (
                <g key={i} opacity={ativo ? 1 : 0.5}>
                  {temAntes && (p.antes ?? 0) > 0 && (
                    <rect x={xb} y={Math.min(y(p.antes!), base)} width={larguraBarra} height={Math.max(1, Math.abs(base - y(p.antes!)))} rx={Math.min(3, larguraBarra / 2)} fill={COR_ANTES} opacity="0.35" />
                  )}
                  {(p.valor ?? 0) > 0 && (
                    <rect
                      x={temAntes ? xb + larguraBarra * 0.2 : xb}
                      y={Math.min(y(p.valor!), base)}
                      width={temAntes ? larguraBarra * 0.6 : larguraBarra}
                      height={Math.max(1, Math.abs(base - y(p.valor!)))}
                      rx={Math.min(3, larguraBarra / 2)}
                      fill={cor}
                      opacity={p.parcial ? 0.45 : 1}
                    />
                  )}
                </g>
              );
            })
          )}
          {mostrarValores && pontos.map((p, i) =>
            (p.valor ?? 0) > 0 ? (
              <text key={`v${i}`} x={xc(i)} y={Math.max(mT + 10, y(p.valor!) - 5)} fontSize="11" fontWeight="700" textAnchor="middle" fill="var(--steel)">
                {fmt(p.valor!, casas)}
              </text>
            ) : null
          )}
          {rotulosX.map((i) => (
            <text key={i} x={xc(i)} y={A - 6} fontSize="11" textAnchor={tipo === "barras" || n <= 1 ? "middle" : i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fill="var(--steel-line)">
              {pontos[i].rotulo}
            </text>
          ))}
          {f && (
            <>
              <line x1={xc(foco!)} x2={xc(foco!)} y1={mT} y2={A - mB} stroke="var(--steel-line)" strokeWidth="1" opacity="0.5" />
              {tipo === "linha" && f.valor !== null && <circle cx={xc(foco!)} cy={y(f.valor)} r="5" fill={cor} stroke="var(--card)" strokeWidth="2" />}
            </>
          )}
        </svg>
        {f && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-carbon border border-card-line px-3 py-1.5 text-xs shadow-lg whitespace-nowrap grid gap-0.5"
            style={{ left: `${Math.min(85, Math.max(15, (xc(foco!) / L) * 100))}%` }}
          >
            <span className="text-steel-line">{f.dica}{f.parcial ? " · Google ainda contando" : ""}</span>
            {(f.valor !== null || f.prev === undefined) && (
              <span>
                <b className="text-steel tabular-nums">{f.valor === null ? "—" : fmt(f.valor, casas)}</b> <span className="text-steel-line">{unidade}</span>
              </span>
            )}
            {f.prev !== undefined && (
              <span className="text-steel-line">
                previsão <b className="text-steel tabular-nums">≈ {fmt(f.prev, casas)}</b>
                {f.faixa ? ` (entre ${fmt(f.faixa[0], casas)} e ${fmt(f.faixa[1], casas)})` : ""}
              </span>
            )}
            {temAntes && f.antes !== undefined && (
              <span className="text-steel-line">antes: <b className="tabular-nums">{fmt(f.antes, casas)}</b></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
