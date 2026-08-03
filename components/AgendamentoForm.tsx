"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { buscarHorariosGbr, criarAgendamentoGbr } from "@/app/agendar-online/actions";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { parseRota, obterOrigem } from "@/lib/track";
import { gtagEvent } from "@/lib/gtag";
import type { ServicoGbr, HorarioGbr } from "@/lib/gbr-api";

type Etapa = "servico" | "data" | "horario" | "dados" | "sucesso";

export default function AgendamentoForm({ servicosIniciais }: { servicosIniciais: ServicoGbr[] }) {
  const pathname = usePathname();
  const [etapa, setEtapa] = useState<Etapa>("servico");
  const [servicoId, setServicoId] = useState("");
  const [data, setData] = useState("");
  const [horarios, setHorarios] = useState<HorarioGbr[]>([]);
  const [hora, setHora] = useState("");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cep, setCep] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const servicoEscolhido = servicosIniciais.find((s) => s.id === servicoId);

  async function avancarParaHorarios() {
    if (!data) return;
    setCarregando(true);
    setErro(null);
    const resp = await buscarHorariosGbr(data);
    setCarregando(false);
    if (!resp.ok) {
      setErro(resp.erro);
      return;
    }
    setHorarios(resp.dados.filter((h) => h.disponivel));
    setEtapa("horario");
  }

  async function confirmarAgendamento() {
    setCarregando(true);
    setErro(null);
    const resp = await criarAgendamentoGbr({
      servico_id: servicoId,
      data,
      hora,
      cliente: { nome, whatsapp, cep: cep || undefined },
    });
    setCarregando(false);
    if (!resp.ok) {
      setErro(resp.erro);
      return;
    }
    const { service_slug, city_slug } = parseRota(pathname);
    const origem = obterOrigem();
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "form_submit", page_path: pathname, service_slug, city_slug, origem })
      .then(() => {});
    gtagEvent("agendamento_online", { servico_id: servicoId });
    setEtapa("sucesso");
  }

  if (etapa === "sucesso") {
    return (
      <div className="bg-card border border-card-line rounded-2xl p-6 text-center">
        <h2 className="font-display font-bold text-xl text-steel mb-2">Agendamento enviado! 🎉</h2>
        <p className="text-steel-line text-sm">
          Seu horário está como <strong>pendente</strong> — a Clean Car confirma em breve pelo WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-4">
      {erro && <p className="text-warn text-sm bg-warn/10 border border-warn/30 rounded-lg px-3 py-2">{erro}</p>}

      {etapa === "servico" && (
        <>
          <label className="text-xs font-bold uppercase tracking-wide text-steel-line">Qual serviço?</label>
          <select value={servicoId} onChange={(e) => setServicoId(e.target.value)} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm">
            <option value="">Selecione</option>
            {servicosIniciais.map((s) => (
              <option key={s.id} value={s.id}>{s.nome}{s.preco ? ` — a partir de R$ ${s.preco}` : ""}</option>
            ))}
          </select>
          <button
            disabled={!servicoId}
            onClick={() => setEtapa("data")}
            className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine disabled:opacity-40"
          >
            Continuar
          </button>
        </>
      )}

      {etapa === "data" && (
        <>
          <p className="text-sm text-steel-line">Serviço: <strong className="text-steel">{servicoEscolhido?.nome}</strong></p>
          <label className="text-xs font-bold uppercase tracking-wide text-steel-line">Qual dia?</label>
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} min={new Date().toISOString().split("T")[0]} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <button
            disabled={!data || carregando}
            onClick={avancarParaHorarios}
            className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine disabled:opacity-40"
          >
            {carregando ? "Buscando..." : "Ver horários"}
          </button>
        </>
      )}

      {etapa === "horario" && (
        <>
          <p className="text-sm text-steel-line">
            Serviço: <strong className="text-steel">{servicoEscolhido?.nome}</strong> · Dia: <strong className="text-steel">{data}</strong>
          </p>
          {horarios.length === 0 ? (
            <p className="text-steel-line text-sm">Nenhum horário livre nesse dia — tenta outra data.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {horarios.map((h) => (
                <button
                  key={h.hora}
                  onClick={() => setHora(h.hora)}
                  className={`px-4 py-2 rounded-lg text-sm font-display font-bold ${hora === h.hora ? "bg-verniz text-carbon" : "bg-carbon border border-card-line text-steel-line"}`}
                >
                  {h.hora}
                </button>
              ))}
            </div>
          )}
          <button
            disabled={!hora}
            onClick={() => setEtapa("dados")}
            className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine disabled:opacity-40"
          >
            Continuar
          </button>
        </>
      )}

      {etapa === "dados" && (
        <>
          <p className="text-sm text-steel-line">
            {servicoEscolhido?.nome} · {data} às {hora}
          </p>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="WhatsApp com DDD" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="CEP (se quiser Leva e Trás)" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <button
            disabled={!nome || !whatsapp || carregando}
            onClick={confirmarAgendamento}
            className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine disabled:opacity-40"
          >
            {carregando ? "Enviando..." : "Confirmar agendamento"}
          </button>
        </>
      )}
    </div>
  );
}
