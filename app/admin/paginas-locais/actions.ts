"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function salvarPaginaLocal(formData: FormData) {
  const service_slug = String(formData.get("service_slug"));
  const city_slug = String(formData.get("city_slug"));
  const imagem_url = String(formData.get("imagem_url") || "");
  const paragrafos = [
    String(formData.get("paragrafo1") || ""),
    String(formData.get("paragrafo2") || ""),
    String(formData.get("paragrafo3") || ""),
  ].filter(Boolean);

  const { error } = await supabaseAdmin.from("local_pages_content").upsert({
    service_slug,
    city_slug,
    paragrafos,
    imagem_url: imagem_url || null,
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/servicos/${service_slug}/${city_slug}`);
  revalidatePath("/admin/paginas-locais");
}
