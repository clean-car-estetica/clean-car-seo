"use client";

import { useActionState, useEffect, useState } from "react";
import { enviarPergunta, type EstadoEnvio } from "@/app/perguntas/actions";
import { gtagEvent } from "@/lib/gtag";

const campo = "w-full px-4 py-3 rounded-xl bg-carbon border border-card-line text-steel placeholder:text-steel-line/60 focus:border-verniz focus:outline-none";

export default function PerguntaForm({ servico }: { servico?: string }) {
  const [estado, acao, enviando] = useActionState<EstadoEnvio, FormData>(enviarPergunta, { ok: false });
  const [inicio] = useState(() => Date.now());

  useEffect(() => {
    if (estado.ok) gtagEvent("form_submit", { tipo: "pergunta" });
  }, [estado.ok]);

  if (estado.ok) {
    return (
      <div className="rounded-2xl bg-card border border-ok/40 p-6">
        <p className="font-display font-bold text-xl text-steel">Pergunta recebida!</p>
        <p className="mt-2 text-steel-line">
          Respondemos por aqui no site (sem o seu nome) e, se você deixou o WhatsApp, também por lá. Se for urgente, chame direto no WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form action={acao} className="rounded-2xl bg-card border border-card-line p-6 grid gap-4">
      <input type="hidden" name="inicio" value={inicio} />
      {servico && <input type="hidden" name="servico" value={servico} />}
      {/* Campo invisível: só robô preenche */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Site <input type="text" name="site" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div>
        <label htmlFor="pergunta" className="block font-display font-bold text-steel mb-2">Sua pergunta</label>
        <textarea
          id="pergunta"
          name="pergunta"
          required
          minLength={10}
          maxLength={600}
          rows={4}
          placeholder="Ex.: Derramei café no banco de tecido. Ainda dá para tirar a mancha?"
          className={campo}
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nome" className="block text-sm text-steel-line mb-1">Seu nome (opcional)</label>
          <input id="nome" name="nome" maxLength={60} autoComplete="given-name" className={campo} />
        </div>
        <div>
          <label htmlFor="whatsapp" className="block text-sm text-steel-line mb-1">WhatsApp (opcional)</label>
          <input id="whatsapp" name="whatsapp" inputMode="tel" maxLength={20} autoComplete="tel" placeholder="(11) 9…" className={campo} />
        </div>
      </div>
      <p className="text-xs text-steel-line">
        Nome e WhatsApp não aparecem no site — servem só para a gente responder você direto. A pergunta pode ser publicada, sem
        identificação, para ajudar outras pessoas.
      </p>
      {estado.erro && <p className="text-sm text-warn">{estado.erro}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-7 py-3 hover:bg-verniz-shine disabled:opacity-60"
      >
        {enviando ? "Enviando…" : "Enviar pergunta"}
      </button>
    </form>
  );
}
