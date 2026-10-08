"use client";

import { useState, useTransition, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Upload, Check, X as XIcon, Film } from "lucide-react";
import { uploadImagem, criarEnvioVideo } from "@/app/admin/_actions/media";
import { supabasePublico } from "@/lib/supabase";
import Midia, { ehVideo } from "@/components/Midia";
import { gerarImagemRecortada, type AreaPixels } from "@/lib/crop-image";

export default function ImageUploader({
  name,
  initialUrl,
  label = "Imagem",
  aspect = 16 / 9,
  specTexto,
  onUrlChange,
  nomeArquivo,
}: {
  name: string;
  initialUrl?: string;
  label?: string;
  /** Proporção largura/altura que a imagem final deve ter (ex: 16/9, 1, 4/3) */
  aspect?: number;
  /** Texto de especificação mostrado abaixo do campo (ex: "1200x675px") */
  specTexto?: string;
  onUrlChange?: (url: string) => void;
  /** Dica pro nome do arquivo (ex: "lavagem mogi das cruzes centro") — vira lavagem-mogi-das-cruzes-centro-xxxx.jpg em vez de nome genérico */
  nomeArquivo?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  // Estado do modal de recorte
  const [imagemBruta, setImagemBruta] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaRecorte, setAreaRecorte] = useState<AreaPixels | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);

    if (file.size > 15 * 1024 * 1024) {
      setErro("Essa foto tem mais de 15MB — tente uma versão um pouco mais leve.");
      return;
    }

    const leitor = new FileReader();
    leitor.onload = () => setImagemBruta(leitor.result as string);
    leitor.readAsDataURL(file);
    e.target.value = "";
  }

  // 08/10/2026: todo campo de imagem aceita vídeo também. Vídeo vai direto
  // do navegador para o Storage (é grande demais para passar pelo servidor).
  const [enviandoVideo, setEnviandoVideo] = useState(false);
  async function handleVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErro(null);
    if (file.size > 50 * 1024 * 1024) { setErro("O vídeo tem mais de 50 MB. Corte para 10 a 20 segundos ou exporte em 720p."); return; }
    setEnviandoVideo(true);
    try {
      const { caminho, token, publicUrl } = await criarEnvioVideo(file.name);
      const { error } = await supabasePublico.storage.from("imagens").uploadToSignedUrl(caminho, token, file, { contentType: file.type || "video/mp4" });
      if (error) throw new Error(error.message);
      setUrl(publicUrl);
      onUrlChange?.(publicUrl);
    } catch (err: any) {
      setErro("Não consegui enviar o vídeo: " + (err?.message ?? err) + ". Você pode colar o link do vídeo no campo abaixo.");
    } finally {
      setEnviandoVideo(false);
    }
  }

  const aoMudarArea = useCallback((_: unknown, areaPixels: AreaPixels) => {
    setAreaRecorte(areaPixels);
  }, []);

  function cancelarRecorte() {
    setImagemBruta(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setAreaRecorte(null);
  }

  async function confirmarRecorte() {
    if (!imagemBruta || !areaRecorte) return;
    setErro(null);
    startTransition(async () => {
      try {
        const blob = await gerarImagemRecortada(imagemBruta, areaRecorte);
        const formData = new FormData();
        formData.append("file", new File([blob], "recorte.jpg", { type: "image/jpeg" }));
        if (nomeArquivo) formData.append("nome_arquivo", nomeArquivo);
        const novaUrl = await uploadImagem(formData);
        setUrl(novaUrl);
        onUrlChange?.(novaUrl);
        cancelarRecorte();
      } catch (err: any) {
        setErro(err?.message ?? "Falha no upload.");
      }
    });
  }

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">{label}</label>
      <input type="hidden" name={name} value={url} />

      <div className="flex items-center gap-3">
        {url && (
          <div className="w-20 h-20 rounded-lg border border-card-line overflow-hidden shrink-0">
            <Midia src={url} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel-line text-sm cursor-pointer hover:border-verniz hover:text-verniz-shine">
            <Upload size={16} />
            {pendente ? "Enviando..." : "Enviar foto"}
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={pendente || enviandoVideo} />
          </label>
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel-line text-sm cursor-pointer hover:border-verniz hover:text-verniz-shine">
            <Film size={16} />
            {enviandoVideo ? "Enviando vídeo..." : "Enviar vídeo"}
            <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideo} disabled={pendente || enviandoVideo} />
          </label>
          {url && (
            <button type="button" onClick={() => { setUrl(""); onUrlChange?.(""); }} className="px-3 py-2 rounded-lg border border-card-line text-steel-line text-sm hover:text-warn">
              Remover
            </button>
          )}
        </div>
      </div>
      <input
        type="url"
        value={url}
        onChange={(e) => { setUrl(e.target.value); onUrlChange?.(e.target.value); }}
        placeholder="ou cole aqui o link de uma foto ou vídeo (.mp4)"
        className="mt-2 w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-xs"
      />
      {url && ehVideo(url) && <p className="text-[11px] text-steel-line/70 mt-1">Vídeo: toca sozinho, sem som e em repetição no site.</p>}

      {specTexto && <p className="text-[11px] text-steel-line/60 mt-1">Recomendado: {specTexto}</p>}
      {erro && <p className="text-warn text-xs mt-1">{erro}</p>}

      {imagemBruta && (
        <div className="fixed inset-0 z-[100] bg-black/85 flex flex-col p-4">
          <div className="relative flex-1 rounded-xl overflow-hidden bg-black">
            <Cropper
              image={imagemBruta}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={aoMudarArea}
            />
          </div>
          <div className="flex items-center gap-4 pt-4 max-w-md mx-auto w-full">
            <span className="text-xs text-steel-line shrink-0">Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
          </div>
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={cancelarRecorte}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-card-line text-steel-line text-sm font-bold hover:text-steel"
            >
              <XIcon size={16} /> Cancelar
            </button>
            <button
              onClick={confirmarRecorte}
              disabled={pendente}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-verniz text-carbon text-sm font-display font-bold hover:bg-verniz-shine disabled:opacity-50"
            >
              <Check size={16} /> {pendente ? "Enviando..." : "Usar esta imagem"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
