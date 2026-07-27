export const dynamic = "force-dynamic";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { salvarFaq, excluirFaq, importarFaqsPadrao } from "./actions";

export default async function FaqAdminPage() {
  const { data: faqs } = await supabaseAdmin.from("faqs").select("*").order("ordem");

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-display font-bold text-3xl text-steel">Dúvidas frequentes (FAQ)</h1>
        {(!faqs || faqs.length === 0) && (
          <form action={importarFaqsPadrao}>
            <button type="submit" className="rounded-full bg-card border border-card-line px-4 py-2 text-sm font-bold text-steel-line hover:border-verniz hover:text-verniz-shine">
              Importar perguntas padrão pra editar
            </button>
          </form>
        )}
      </div>
      <p className="text-steel-line text-sm mb-6">
        Aparece na home e também vira dado estruturado (FAQPage), que ajuda o Google e assistentes de IA
        a citar suas respostas diretamente.
      </p>

      <form action={salvarFaq} className="bg-card border border-card-line rounded-2xl p-6 grid gap-3 max-w-2xl mb-10">
        <input
          name="pergunta"
          required
          placeholder="Pergunta"
          className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
        />
        <textarea
          name="resposta"
          required
          rows={3}
          placeholder="Resposta"
          className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
        />
        <input
          name="ordem"
          type="number"
          defaultValue={faqs?.length ?? 0}
          placeholder="Ordem"
          className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm w-32"
        />
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Adicionar pergunta
        </button>
      </form>

      <div className="grid gap-3">
        {faqs?.map((f) => (
          <div key={f.id} className="bg-card border border-card-line rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display font-bold text-steel">{f.pergunta}</div>
                <div className="text-sm text-steel-line mt-1">{f.resposta}</div>
              </div>
              <form action={excluirFaq}>
                <input type="hidden" name="id" value={f.id} />
                <button type="submit" className="text-xs font-bold text-warn hover:underline shrink-0">Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {(!faqs || faqs.length === 0) && <p className="text-steel-line text-sm">Nenhuma pergunta ainda — usando as 3 padrão do site.</p>}
      </div>
    </div>
  );
}
