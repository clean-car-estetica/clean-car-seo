"use client";

import { useState } from "react";

export default function CampoCor({ nome, valorInicial, label, ajuda }: { nome: string; valorInicial: string; label: string; ajuda: string }) {
  const [valor, setValor] = useState(valorInicial);

  return (
    <div className="flex items-center gap-4">
      <input
        type="color"
        name={nome}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        className="w-14 h-14 rounded-lg border border-card-line bg-carbon cursor-pointer"
      />
      <div className="flex-1">
        <label className="block text-sm font-bold text-steel">{label}</label>
        <p className="text-xs text-steel-line">{ajuda}</p>
      </div>
      <span className="w-24 px-2 py-1 rounded-lg bg-carbon border border-card-line text-steel-line text-xs font-mono">
        {valor}
      </span>
    </div>
  );
}
