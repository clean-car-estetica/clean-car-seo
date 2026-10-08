"use client";

import { useState } from "react";
import Link from "next/link";
import type { ServicoDB } from "@/lib/site-data";
import Midia from "@/components/Midia";

// Os outros cuidados em lista, como um catálogo: no computador a foto do
// serviço aparece ao lado quando o mouse (ou o foco do teclado) passa na
// linha; no celular cada linha já traz a foto pequena.
export default function ServicosLista({ servicos, titulo, subtitulo }: { servicos: ServicoDB[]; titulo: string; subtitulo: string }) {
  const [ativo, setAtivo] = useState(0);
  if (servicos.length === 0) return null;
  const foto = servicos[ativo]?.imagem_url;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <h2 className="font-display font-bold text-4xl md:text-5xl text-steel leading-none">{titulo}</h2>
      <p className="mt-3 text-steel-line max-w-xl">{subtitulo}</p>

      <div className="mt-10 grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] gap-10 items-start">
        <ul className="border-t border-card-line">
          {servicos.map((s, i) => (
            <li key={s.slug} className="border-b border-card-line">
              <Link
                href={`/servicos/${s.slug}`}
                onMouseEnter={() => setAtivo(i)}
                onFocus={() => setAtivo(i)}
                className="group grid grid-cols-[4.5rem_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_auto] gap-4 items-center py-5 focus-visible:outline-2 focus-visible:outline-verniz"
              >
                <span className="lg:hidden h-16 w-[4.5rem] rounded-lg overflow-hidden bg-card">
                  {s.imagem_url && <Midia src={s.imagem_url} className="foto-servico h-full w-full object-cover" lazy />}
                </span>
                <span className="min-w-0">
                  <span className={`block font-display font-bold text-xl md:text-2xl transition-colors ${i === ativo ? "lg:text-verniz-shine" : ""} text-steel group-hover:text-verniz-shine`}>
                    {s.nome}
                  </span>
                  <span className="block text-sm text-steel-line mt-1 truncate">{s.resumo}</span>
                </span>
                <span className="hidden lg:block text-right">
                  {s.preco_desde ? (
                    <span className="font-display font-bold text-lg text-steel">R$ {s.preco_desde}</span>
                  ) : (
                    <span className="text-xs text-steel-line">Consulte</span>
                  )}
                  {s.duracao && <span className="block text-xs text-steel-line">{s.duracao}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block sticky top-28">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-card-line bg-card">
            {foto ? (
              <Midia key={foto} src={foto} alt={servicos[ativo].nome} className="painel-foto foto-servico absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center font-display font-bold text-3xl text-steel-line/50">
                {servicos[ativo].nome}
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-carbon/95 to-transparent">
              <p className="text-sm text-steel">{servicos[ativo].resumo}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
