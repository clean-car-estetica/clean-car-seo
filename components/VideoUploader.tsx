"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { supabasePublico } from "@/lib/supabase";
import { criarEnvioVideo } from "@/app/admin/_actions/media";

// Campo de vídeo do painel: cola um link (.mp4) ou envia o arquivo do
// computador/celular. O arquivo vai direto para o Storage.
export default function VideoUploader({ name, initialUrl, label, dica }: { name: string; initialUrl?: string; label: string; dica?: string }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErro(null);
    if (!file.type.startsWith("video/")) { setErro("Escolha um arquivo de vídeo (.mp4)."); return; }
    if (file.size > 50 * 1024 * 1024) { setErro("O vídeo tem mais de 50 MB. Corte para 10 a 20 segundos ou exporte em 720p."); return; }
    setEnviando(true);
    try {
      const { caminho, token, publicUrl } = await criarEnvioVideo(file.name);
      const { error } = await supabasePublico.storage.from("imagens").uploadToSignedUrl(caminho, token, file, { contentType: file.type });
      if (error) throw new Error(error.message);
      setUrl(publicUrl);
    } catch (err) {
      setErro("Não consegui enviar: " + (err instanceof Error ? err.message : String(err)) + ". Você pode colar um link de vídeo no campo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…/video.mp4"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
        />
        <label className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-card-line px-3 py-2 text-sm text-steel cursor-pointer hover:border-verniz">
          <Upload size={15} /> {enviando ? "Enviando…" : "Enviar vídeo"}
          <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={enviar} disabled={enviando} />
        </label>
      </div>
      {dica && <p className="mt-1 text-xs text-steel-line">{dica}</p>}
      {erro && <p className="mt-1 text-xs text-warn">{erro}</p>}
      {url && !erro && (
        <video src={url} muted loop autoPlay playsInline className="mt-2 w-full max-w-sm rounded-lg border border-card-line" />
      )}
    </div>
  );
}
