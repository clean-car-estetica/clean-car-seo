"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import AgendarButton from "@/components/AgendarButton";
import type { ServicoDB } from "@/lib/site-data";
import Midia from "@/components/Midia";

// "Qual lavagem seu carro precisa?" — a pessoa diz o que quer e o pacote
// certo aparece. Bronze, Prata e Ouro são níveis de cuidado, então o
// medidor de 3 barras mostra quanto cada um entrega.
const OPCOES = [
  { slug: "lavagem-bronze", pergunta: "Só quero o carro limpo", nivel: 1 },
  { slug: "lavagem-prata", pergunta: "Quero brilho e proteção", nivel: 2 },
  { slug: "lavagem-ouro", pergunta: "Quero ele como novo, dentro e fora", nivel: 3 },
];

export default function EscolhaLavagem({ servicos }: { servicos: ServicoDB[] }) {
  const opcoes = OPCOES.map((o) => ({ ...o, servico: servicos.find((s) => s.slug === o.slug) })).filter(
    (o): o is typeof o & { servico: ServicoDB } => Boolean(o.servico)
  );
  const [ativo, setAtivo] = useState(Math.min(1, opcoes.length - 1));
  if (opcoes.length === 0) return null;
  const atual = opcoes[ativo];
  const s = atual.servico;

  return (
    <section id="servicos" className="mx-auto max-w-6xl px-6 py-20 md:py-28 scroll-mt-24">
      <h2 className="font-display font-bold text-4xl md:text-5xl text-steel leading-none">Qual lavagem seu carro precisa?</h2>
      <p className="mt-3 text-steel-line max-w-xl">Escolha o que você espera do resultado. A gente mostra o pacote certo.</p>

      <div className="mt-10 grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-6 lg:gap-10 items-stretch">
        <div role="tablist" aria-label="O que você espera da lavagem" className="flex flex-col gap-3">
          {opcoes.map((o, i) => {
            const sel = i === ativo;
            return (
              <button
                key={o.slug}
                type="button"
                role="tab"
                aria-selected={sel}
                aria-controls="painel-lavagem"
                onClick={() => setAtivo(i)}
                className={`text-left rounded-xl border px-5 py-4 transition-colors focus-visible:outline-2 focus-visible:outline-verniz ${
                  sel ? "border-verniz bg-verniz/10" : "border-card-line bg-card hover:border-verniz/50"
                }`}
              >
                <span className={`block font-display font-bold text-xl ${sel ? "text-verniz-shine" : "text-steel"}`}>{o.pergunta}</span>
                <span className="mt-2 flex items-center gap-3 text-xs text-steel-line">
                  <Medidor nivel={o.nivel} ativo={sel} />
                  {o.servico.nome}
                </span>
              </button>
            );
          })}
        </div>

        <div
          id="painel-lavagem"
          role="tabpanel"
          className="relative overflow-hidden rounded-2xl border border-card-line bg-card min-h-[420px] flex flex-col justify-end"
        >
          {s.imagem_url && (
            <Midia key={s.slug} src={s.imagem_url} alt={s.nome} className="painel-foto foto-servico absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/85 to-carbon/10" />
          <div className="relative p-6 md:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h3 className="font-display font-extrabold text-4xl md:text-5xl text-steel">{s.nome}</h3>
              {s.preco_desde ? (
                <p className="font-display font-bold text-2xl text-verniz-shine">a partir de R$ {s.preco_desde}</p>
              ) : null}
            </div>
            <p className="mt-3 text-steel max-w-2xl leading-relaxed">{s.descricao}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <AgendarButton servico={s.nome} className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-7 py-3 hover:bg-verniz-shine transition-colors">
                Agendar {s.nome}
              </AgendarButton>
              <Link href={`/servicos/${s.slug}`} className="text-sm font-bold text-steel-line hover:text-verniz-shine underline underline-offset-4">
                Ver detalhes
              </Link>
              {s.duracao && (
                <span className="flex items-center gap-1.5 text-sm text-steel-line">
                  <Clock size={15} /> {s.duracao}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Medidor({ nivel, ativo }: { nivel: number; ativo: boolean }) {
  return (
    <span className="flex gap-1" aria-label={`Nível de cuidado ${nivel} de 3`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`h-1.5 w-6 rounded-full ${n <= nivel ? (ativo ? "bg-verniz" : "bg-steel-line") : "bg-card-line"}`}
        />
      ))}
    </span>
  );
}
