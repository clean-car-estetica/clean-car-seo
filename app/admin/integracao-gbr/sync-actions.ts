"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TAG_GBR } from "@/lib/gbr-sync";

/** Salva qual serviço do SAS corresponde a cada serviço do site. */
export async function salvarVinculosGbr(formData: FormData) {
  const vinculos: Record<string, string> = {};
  for (const [k, v] of formData.entries()) {
    if (!k.startsWith("vinculo:")) continue;
    const slug = k.slice("vinculo:".length);
    const valor = String(v);
    // "" = automático (pelo nome) — não precisa guardar
    if (slug && valor) vinculos[slug] = valor;
  }
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "gbr_vinculos", data: vinculos, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidateTag(TAG_GBR, "max");
  revalidatePath("/", "layout");
}

/** Busca de novo no SAS agora (sem esperar os 5 minutos do cache). */
export async function atualizarAgoraGbr() {
  revalidateTag(TAG_GBR, { expire: 0 });
  revalidatePath("/", "layout");
}
