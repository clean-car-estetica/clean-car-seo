"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { slugify } from "@/lib/slug";

export async function uploadImagem(formData: FormData): Promise<string> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Nenhum arquivo enviado.");

  const dica = String(formData.get("nome_arquivo") || "").trim();
  const extensao = file.name.split(".").pop() || "jpg";
  const sufixo = Math.random().toString(36).slice(2, 6);
  const base = dica ? slugify(dica) : "imagem";
  const caminho = `uploads/${base}-${sufixo}.${extensao}`;

  const { error } = await supabaseAdmin.storage.from("imagens").upload(caminho, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabaseAdmin.storage.from("imagens").getPublicUrl(caminho);
  return data.publicUrl;
}

/**
 * Vídeo do topo (07/10/2026): vídeo é grande demais para passar pelo
 * servidor, então o servidor só gera um endereço de envio assinado e o
 * navegador manda o arquivo direto para o Storage.
 */
export async function criarEnvioVideo(nomeArquivo: string): Promise<{ caminho: string; token: string; publicUrl: string }> {
  const extensao = (nomeArquivo.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4";
  const sufixo = Math.random().toString(36).slice(2, 8);
  const caminho = `videos/topo-${sufixo}.${extensao}`;
  const { data, error } = await supabaseAdmin.storage.from("imagens").createSignedUploadUrl(caminho);
  if (error || !data) throw new Error(error?.message || "Não consegui preparar o envio do vídeo.");
  const { data: pub } = supabaseAdmin.storage.from("imagens").getPublicUrl(caminho);
  return { caminho, token: data.token, publicUrl: pub.publicUrl };
}
