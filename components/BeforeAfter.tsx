"use client";

import { useState } from "react";
import { MoveHorizontal } from "lucide-react";

export default function BeforeAfter({
  before,
  after,
  beforeLabel = "Antes",
  afterLabel = "Depois",
  title,
  description,
}: {
  before: string;
  after: string;
  beforeLabel?: string;
  afterLabel?: string;
  title: string;
  description: string;
}) {
  const [pos, setPos] = useState(50);

  return (
    <div className="rounded-2xl bg-card border border-card-line overflow-hidden">
      <div className="relative h-[280px] md:h-[340px] bg-black select-none">
        <img src={after} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" />
        <img
          src={before}
          alt={beforeLabel}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />
        <div
          className="absolute top-0 bottom-0 w-[3px] bg-verniz shadow-[0_0_15px_var(--verniz-glow)]"
          style={{ left: `${pos}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-verniz text-carbon flex items-center justify-center border-4 border-white/90 shadow-lg"
          style={{ left: `${pos}%` }}
        >
          <MoveHorizontal size={18} />
        </div>
        <span className="absolute top-3 left-3 text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-ok/15 text-ok border border-ok/30">
          {afterLabel}
        </span>
        <span className="absolute top-3 right-3 text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-warn/15 text-warn border border-warn/30">
          {beforeLabel}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
          aria-label={`Arraste para comparar ${beforeLabel} e ${afterLabel}`}
        />
      </div>
      <div className="p-6">
        <h3 className="font-display font-bold text-xl text-steel">{title}</h3>
        <p className="mt-2 text-sm text-steel-line leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
