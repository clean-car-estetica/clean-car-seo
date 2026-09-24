"use client";

import { useActionState } from "react";
import { aplicarCatalogoNovo } from "@/app/admin/conteudo/actions";

export default function AplicarCatalogoButton() {
  const [estado, acao, pendente] = useActionState(aplicarCatalogoNovo, null);

  return (
    <div className="flex flex-col gap-2">
      <form action={acao}>
        <button
          type="submit"
          disabled={pendente}
          className="rounded-full bg-verniz text-carbon px-4 py-2 text-sm font-bold hover:bg-verniz-shine disabled:opacity-60 disabled:cursor-wait"
        >
          {pendente ? "Aplicando…" : "Aplicar catálogo novo (14 serviços)"}
        </button>
      </form>
      {estado && (
        <p
          role="status"
          className={`max-w-md text-xs rounded-lg px-3 py-2 border ${
            estado.ok ? "bg-verniz/10 border-verniz/30 text-verniz-shine" : "bg-warn/10 border-warn/30 text-warn"
          }`}
        >
          {estado.mensagem}
        </p>
      )}
    </div>
  );
}
