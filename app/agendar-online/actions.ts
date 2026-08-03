"use server";

import { gbrListarServicos, gbrListarHorarios, gbrCriarAgendamento } from "@/lib/gbr-api";

export async function buscarServicosGbr() {
  try {
    return { ok: true as const, dados: await gbrListarServicos() };
  } catch (e: any) {
    return { ok: false as const, erro: e?.message ?? "Erro ao buscar serviços." };
  }
}

export async function buscarHorariosGbr(data: string) {
  try {
    return { ok: true as const, dados: await gbrListarHorarios(data) };
  } catch (e: any) {
    return { ok: false as const, erro: e?.message ?? "Erro ao buscar horários." };
  }
}

export async function criarAgendamentoGbr(payload: {
  servico_id: string;
  data: string;
  hora: string;
  cliente: { nome: string; whatsapp: string; cep?: string };
}) {
  try {
    const resultado = await gbrCriarAgendamento(payload);
    return { ok: true as const, dados: resultado };
  } catch (e: any) {
    return { ok: false as const, erro: e?.message ?? "Erro ao criar agendamento." };
  }
}
