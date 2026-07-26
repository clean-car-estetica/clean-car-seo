"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

const BASE_URL = "https://clean-car-seo.vercel.app";

const SUGESTOES = [
  { canal: "instagram", campanha: "" },
  { canal: "whatsapp", campanha: "" },
  { canal: "google_perfil", campanha: "" },
  { canal: "facebook", campanha: "" },
];

function montarLink(canal: string, campanha: string, pagina: string) {
  const params = new URLSearchParams();
  if (canal) params.set("utm_source", canal);
  if (campanha) params.set("utm_campaign", campanha);
  const query = params.toString();
  return `${BASE_URL}${pagina}${query ? `?${query}` : ""}`;
}

function LinhaLink({ url }: { url: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="flex items-center gap-2 bg-carbon border border-card-line rounded-lg px-3 py-2">
      <code className="flex-1 text-xs text-steel-line overflow-x-auto whitespace-nowrap">{url}</code>
      <button
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopiado(true);
          setTimeout(() => setCopiado(false), 1500);
        }}
        className="shrink-0 text-verniz-shine hover:text-verniz"
      >
        {copiado ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  );
}

export default function LinksAdminPage() {
  const [canal, setCanal] = useState("instagram");
  const [campanha, setCampanha] = useState("");
  const [pagina, setPagina] = useState("/");

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Links de rastreamento</h1>
      <p className="text-steel-line text-sm mb-6">
        Gere um link diferente pra cada canal — o site já sabe identificar de onde a pessoa veio
        quando ela clica nesse link, e isso aparece no Dashboard em "Por origem".
      </p>

      <div className="bg-card border border-card-line rounded-2xl p-6 mb-8 grid gap-3 max-w-xl">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Canal</label>
          <input value={canal} onChange={(e) => setCanal(e.target.value)} placeholder="instagram, whatsapp, google_perfil..." className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Campanha (opcional)</label>
          <input value={campanha} onChange={(e) => setCampanha(e.target.value)} placeholder="ex: stories_promo_julho" className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Página de destino</label>
          <select value={pagina} onChange={(e) => setPagina(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm">
            <option value="/">Home</option>
            <option value="/servicos/vitrificacao">Página de Vitrificação</option>
            <option value="/servicos/higienizacao">Página de Higienização</option>
            <option value="/blog">Blog</option>
            <option value="/beneficios">Benefícios</option>
          </select>
        </div>
        <div className="mt-2">
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Seu link</label>
          <LinhaLink url={montarLink(canal, campanha, pagina)} />
        </div>
      </div>

      <h2 className="font-display font-bold text-lg text-steel mb-3">Links prontos pra usar</h2>
      <div className="grid gap-2 max-w-xl">
        {SUGESTOES.map((s) => (
          <LinhaLink key={s.canal} url={montarLink(s.canal, s.campanha, "/")} />
        ))}
      </div>
    </div>
  );
}
