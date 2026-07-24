"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Indicacao() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [codigo, setCodigo] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await supabaseBrowser().from("leads").insert({
      tipo: "indicacao",
      nome,
      whatsapp,
      codigo_indicacao: codigo || null,
    });
    setEnviando(false);
    setEnviado(true);
  }

  return (
    <section className="mx-auto max-w-2xl px-6 py-20 text-center">
      <Users className="mx-auto text-verniz-shine mb-4" size={32} />
      <h2 className="font-display font-bold text-3xl text-steel mb-2">Indique um amigo</h2>
      <p className="text-steel-line mb-8">
        Já é cliente e tem um código de indicação? Cadastre aqui e a gente confirma seu benefício.
      </p>

      {enviado ? (
        <p className="text-verniz-shine font-display font-bold">Recebemos! Vamos confirmar e te avisar pelo WhatsApp. 🙌</p>
      ) : (
        <form onSubmit={enviar} className="grid gap-3 max-w-sm mx-auto">
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome"
            className="px-4 py-3 rounded-lg bg-card border border-card-line text-steel text-sm"
          />
          <input
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Seu WhatsApp"
            className="px-4 py-3 rounded-lg bg-card border border-card-line text-steel text-sm"
          />
          <input
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Código de indicação (se tiver)"
            className="px-4 py-3 rounded-lg bg-card border border-card-line text-steel text-sm"
          />
          <button
            type="submit"
            disabled={enviando}
            className="rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 hover:bg-verniz-shine transition-colors disabled:opacity-40"
          >
            {enviando ? "Enviando..." : "Cadastrar indicação"}
          </button>
        </form>
      )}
    </section>
  );
}
