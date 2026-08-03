"use client";

import { useState } from "react";
import { consultarClienteGbr } from "./actions";

export default function ConsultaGbrPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [resultado, setResultado] = useState<Awaited<ReturnType<typeof consultarClienteGbr>> | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function consultar() {
    setCarregando(true);
    const r = await consultarClienteGbr(whatsapp);
    setCarregando(false);
    setResultado(r);
  }

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Consultar cliente (GBR)</h1>
      <p className="text-steel-line text-sm mb-6">
        Busca um cliente pelo WhatsApp direto no sistema GBR — pontos de fidelidade e histórico,
        sem precisar abrir o SAS. Exige a integração com API configurada e ativa.
      </p>

      <div className="flex gap-3 mb-6 max-w-md">
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="WhatsApp com DDD"
          className="flex-1 px-3 py-2 rounded-lg bg-card border border-card-line text-steel text-sm"
        />
        <button onClick={consultar} disabled={!whatsapp || carregando} className="rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine disabled:opacity-40">
          {carregando ? "Buscando..." : "Consultar"}
        </button>
      </div>

      {resultado && !resultado.ok && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-xl p-4 text-sm max-w-md">{resultado.erro}</div>
      )}

      {resultado?.ok && (
        <div className="bg-card border border-card-line rounded-2xl p-6 max-w-md grid gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Cliente</div>
            <div className="text-steel font-display font-bold">{resultado.cliente.nome}</div>
            <div className="text-steel-line text-sm">{resultado.cliente.whatsapp}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Pontos de fidelidade</div>
            <div className="text-verniz-shine font-display font-extrabold text-2xl">{resultado.fidelidade.pontos}</div>
          </div>
          {resultado.fidelidade.historico?.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-steel-line mb-2">Histórico</div>
              <div className="grid gap-1">
                {resultado.fidelidade.historico.map((h, i) => (
                  <div key={i} className="text-sm text-steel-line flex justify-between border-t border-card-line pt-1">
                    <span>{h.servico} · {h.data}</span>
                    <span className="text-steel font-bold">+{h.pontos}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
