"use server";

import { gbrBuscarOuCriarCliente, gbrConsultarFidelidade } from "@/lib/gbr-api";

export async function consultarClienteGbr(whatsapp: string) {
  try {
    const [cliente, fidelidade] = await Promise.all([
      gbrBuscarOuCriarCliente(whatsapp),
      gbrConsultarFidelidade(whatsapp),
    ]);
    return { ok: true as const, cliente, fidelidade };
  } catch (e: any) {
    return { ok: false as const, erro: e?.message ?? "Erro ao consultar." };
  }
}
