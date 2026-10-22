"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

/** Liga/desliga o "Vem aí" (próxima campanha agendada) na página inicial. */
export async function definirVemAi(formData: FormData) {
  const mostrarVemAi = String(formData.get("vemAi")) === "ligado";
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ section: "campanhas_config", data: { mostrarVemAi }, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  revalidatePath("/admin/campanha");
}
