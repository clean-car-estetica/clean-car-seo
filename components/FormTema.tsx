"use client";

import { useState } from "react";
import type { Tema } from "@/lib/site-content";

// Cores do site com prontos para escolher em um clique (08/10/2026).
// Depois de escolher, ainda dá para ajustar cada cor e só então salvar.
const CAMPOS: { nome: keyof Tema; label: string; ajuda: string }[] = [
  { nome: "carbon", label: "Fundo principal", ajuda: "Cor de fundo do site inteiro" },
  { nome: "carbonSoft", label: "Fundo secundário", ajuda: "Seções alternadas (levemente diferente do fundo principal)" },
  { nome: "card", label: "Fundo dos cartões", ajuda: "Cards de serviço, FAQ, etc." },
  { nome: "cardLine", label: "Bordas", ajuda: "Contorno dos cartões e divisórias" },
  { nome: "verniz", label: "Cor de destaque", ajuda: "Botões, links, títulos em destaque" },
  { nome: "vernizShine", label: "Destaque (hover/brilho)", ajuda: "Tom mais claro da cor de destaque" },
  { nome: "cera", label: "Cor secundária (selo)", ajuda: "Selo Vonixx, avisos" },
];

export const PRONTOS: { nome: string; descricao: string; cores: Tema }[] = [
  {
    nome: "Escuro sóbrio",
    descricao: "Quase preto com azul discreto — o carro e as fotos aparecem mais",
    cores: { carbon: "#05070c", carbonSoft: "#0a0d14", card: "#0f131c", cardLine: "#1d2433", verniz: "#2bb3cf", vernizShine: "#6fd0e3", cera: "#d9a441" },
  },
  {
    nome: "Grafite",
    descricao: "Cinza bem escuro, neutro, com azul acinzentado",
    cores: { carbon: "#0b0c0e", carbonSoft: "#121417", card: "#17191d", cardLine: "#262a31", verniz: "#3aa9c9", vernizShine: "#7cc9de", cera: "#d4a24c" },
  },
  {
    nome: "Original (azul marinho)",
    descricao: "As cores que o site tinha antes",
    cores: { carbon: "#03071e", carbonSoft: "#050a28", card: "#070d32", cardLine: "#16205c", verniz: "#22d3ee", vernizShine: "#67e8f9", cera: "#f2b544" },
  },
];

export default function FormTema({ inicial, salvar }: { inicial: Tema; salvar: (f: FormData) => Promise<void> }) {
  const [cores, setCores] = useState<Tema>(inicial);
  const igual = (t: Tema) => CAMPOS.every((c) => t[c.nome].toLowerCase() === cores[c.nome].toLowerCase());

  return (
    <form action={salvar} className="grid gap-6 max-w-xl">
      <div className="grid gap-2">
        <p className="text-sm font-bold text-steel">Escolha um pronto</p>
        {PRONTOS.map((p) => (
          <button
            key={p.nome}
            type="button"
            onClick={() => setCores(p.cores)}
            className={`flex items-center gap-4 text-left rounded-xl border p-3 ${igual(p.cores) ? "border-verniz bg-verniz/10" : "border-card-line bg-card hover:border-verniz/50"}`}
          >
            <span className="flex shrink-0 rounded-lg overflow-hidden border border-card-line">
              {[p.cores.carbon, p.cores.card, p.cores.verniz, p.cores.cera].map((c, i) => (
                <span key={i} className="w-6 h-10" style={{ background: c }} />
              ))}
            </span>
            <span>
              <span className="block text-sm font-bold text-steel">{p.nome}</span>
              <span className="block text-xs text-steel-line">{p.descricao}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-4">
        <p className="text-sm font-bold text-steel">Ou ajuste cada cor</p>
        {CAMPOS.map((c) => (
          <div key={c.nome} className="flex items-center gap-4">
            <input
              type="color"
              name={c.nome}
              value={cores[c.nome]}
              onChange={(e) => setCores({ ...cores, [c.nome]: e.target.value })}
              className="w-14 h-14 rounded-lg border border-card-line bg-carbon cursor-pointer"
            />
            <div className="flex-1">
              <label className="block text-sm font-bold text-steel">{c.label}</label>
              <p className="text-xs text-steel-line">{c.ajuda}</p>
            </div>
            <span className="w-24 px-2 py-1 rounded-lg bg-carbon border border-card-line text-steel-line text-xs font-mono">{cores[c.nome]}</span>
          </div>
        ))}
      </div>

      <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
        Salvar cores
      </button>
    </form>
  );
}
