"use client";

import { useState, useTransition } from "react";
import { Upload } from "lucide-react";
import { uploadImagem } from "@/app/admin/_actions/media";

export default function ImageUploader({
  name,
  initialUrl,
  label = "Imagem",
}: {
  name: string;
  initialUrl?: string;
  label?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErro(null);
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      try {
        const novaUrl = await uploadImagem(formData);
        setUrl(novaUrl);
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
        {url && <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-card-line" />}
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel-line text-sm cursor-pointer hover:border-verniz hover:text-verniz-shine">
          <Upload size={16} />
          {pendente ? "Enviando..." : "Trocar imagem"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={pendente} />
        </label>
      </div>
      {erro && <p className="text-warn text-xs mt-1">{erro}</p>}
    </div>
  );
}
