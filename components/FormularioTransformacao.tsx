"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import { salvarTransformacao } from "@/app/admin/transformacoes/actions";

type Item = {
  id?: number;
  titulo: string;
  descricao: string;
  imagem_antes: string;
  imagem_depois: string;
  ordem: number;
};

export default function FormularioTransformacao({ item, textoBotao }: { item: Item; textoBotao: string }) {
  const router = useRouter();
  const [pendente, startTransition] = useTransition();
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [imagemAntes, setImagemAntes] = useState(item.imagem_antes);
  const [imagemDepois, setImagemDepois] = useState(item.imagem_depois);

  function handleSubmit(formData: FormData) {
    setErro(null);
    setSucesso(false);

    if (!imagemAntes || !imagemDepois) {
      setErro("Envie (ou cole o link de) as duas fotos antes de salvar.");
      return;
    }

    formData.set("imagem_antes", imagemAntes);
    formData.set("imagem_depois", imagemDepois);
    if (item.id) formData.set("id", String(item.id));

    startTransition(async () => {
      try {
        await salvarTransformacao(formData);
        setSucesso(true);
        router.refresh();
      } catch (e: any) {
        setErro(e?.message ?? "Erro desconhecido ao salvar. Confirme se a tabela `transformacoes` existe no Supabase.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="grid gap-4">
      <input name="titulo" required defaultValue={item.titulo} placeholder="Título" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
      <textarea name="descricao" required rows={2} defaultValue={item.descricao} placeholder="Descrição curta" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
      <div className="grid sm:grid-cols-2 gap-4">
        <ImageUploader name="imagem_antes_upload" initialUrl={item.imagem_antes} label="Foto de ANTES" aspect={4 / 3} specTexto="1000x750px (proporção 4:3)" onUrlChange={setImagemAntes} />
        <ImageUploader name="imagem_depois_upload" initialUrl={item.imagem_depois} label="Foto de DEPOIS" aspect={4 / 3} specTexto="1000x750px (proporção 4:3)" onUrlChange={setImagemDepois} />
      </div>
      <input name="ordem" type="number" defaultValue={item.ordem} placeholder="Ordem" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-32" />

      {erro && <p className="text-warn text-sm bg-warn/10 border border-warn/30 rounded-lg px-3 py-2">{erro}</p>}
      {sucesso && <p className="text-ok text-sm">Salvo com sucesso!</p>}

      <button
        type="submit"
        disabled={pendente}
        className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine disabled:opacity-50"
      >
        {pendente ? "Salvando..." : textoBotao}
      </button>
    </form>
  );
}
