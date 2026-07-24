"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function marcarAtendido(formData: FormData) {
  const id = Number(formData.get("id"));
  const atendido = formData.get("atendido") === "true";
  const { error } = await supabaseAdmin.from("leads").update({ atendido: !atendido }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/leads");
}
