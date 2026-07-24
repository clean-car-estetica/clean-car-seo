"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function uploadImagem(formData: FormData): Promise<string> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Nenhum arquivo enviado.");

  const extensao = file.name.split(".").pop() || "jpg";
  const caminho = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

  const { error } = await supabaseAdmin.storage.from("imagens").upload(caminho, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabaseAdmin.storage.from("imagens").getPublicUrl(caminho);
  return data.publicUrl;
}
