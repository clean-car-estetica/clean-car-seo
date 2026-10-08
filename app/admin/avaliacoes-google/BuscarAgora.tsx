"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { buscarAgora } from "./actions";

export default function BuscarAgora({ desligado }: { desligado?: boolean }) {
  const [pendente, iniciar] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; msg: string } | null>(null);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={desligado || pendente}
        onClick={() => iniciar(async () => setMsg(await buscarAgora()))}
        className="inline-flex items-center gap-2 rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm hover:bg-verniz-shine disabled:opacity-40"
      >
        <RefreshCw size={16} className={pendente ? "animate-spin" : ""} /> {pendente ? "Buscando…" : "Buscar agora"}
      </button>
      {msg && <span className={`text-sm ${msg.ok ? "text-ok" : "text-warn"}`}>{msg.msg}</span>}
    </div>
  );
}
