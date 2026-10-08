export const dynamic = "force-dynamic";

import Link from "next/link";
import { Star, Eye, EyeOff, MessageSquareReply } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { fonteAtiva } from "@/lib/avaliacoes-google";
import BuscarAgora from "./BuscarAgora";
import { alternarVisivel, responder } from "./actions";

type Linha = {
  chave: string;
  fonte: string;
  id_externo: string | null;
  autor: string;
  foto_url: string | null;
  nota: number;
  texto: string | null;
  publicado_em: string;
  resposta: string | null;
  visivel: boolean;
};

function Estrelas({ n }: { n: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${n} de 5 estrelas`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={14} className={i < n ? "fill-cera text-cera" : "text-card-line"} />
      ))}
    </span>
  );
}

export default async function AvaliacoesGoogle() {
  const fonte = fonteAtiva();
  const [{ data, error }, { data: resumo }] = await Promise.all([
    supabaseAdmin.from("avaliacoes_google").select("*").order("publicado_em", { ascending: false }),
    supabaseAdmin.from("site_content").select("data").eq("section", "google_resumo").maybeSingle(),
  ]);
  const lista = (data ?? []) as Linha[];
  const r = (resumo?.data ?? {}) as { nota?: number; total?: number; atualizado?: string };

  return (
    <div className="grid gap-6 max-w-4xl">
      <header>
        <h1 className="font-display font-bold text-3xl text-steel">Avaliações do Google</h1>
        <p className="text-steel-line text-sm mt-1">
          Entram sozinhas todo dia de manhã. As de 4 e 5 estrelas com comentário aparecem no site; você pode mostrar ou esconder qualquer uma.
        </p>
      </header>

      <section className="bg-card border border-card-line rounded-2xl p-5 grid gap-4 sm:grid-cols-[auto_1fr] items-center">
        <div className="flex items-baseline gap-2">
          <span className="font-display font-extrabold text-5xl text-steel tabular-nums">{r.nota ? r.nota.toLocaleString("pt-BR", { minimumFractionDigits: 1 }) : "–"}</span>
          <span className="text-steel-line text-sm">{r.total ? `${r.total} avaliações` : ""}</span>
        </div>
        <div className="grid gap-2 sm:justify-items-end">
          <BuscarAgora desligado={!fonte} />
          <p className="text-xs text-steel-line">
            {fonte === "perfil" && "Fonte: Perfil da Empresa (todas as avaliações, com resposta pelo painel)."}
            {fonte === "places" && "Fonte: API de Lugares (as 5 mais relevantes por vez; o site guarda as novas)."}
            {!fonte && "Ligação com o Google ainda não configurada."}
            {r.atualizado && ` Última busca: ${new Date(r.atualizado).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}.`}
          </p>
        </div>
      </section>

      {error && (
        <p className="text-sm text-warn bg-warn/10 border border-warn/30 rounded-xl p-4">
          Não consegui ler as avaliações ({error.message}). A tabela avaliacoes_google precisa existir no banco.
        </p>
      )}

      {lista.length === 0 && !error ? (
        <p className="text-sm text-steel-line">Nenhuma avaliação trazida ainda. Clique em Buscar agora.</p>
      ) : (
        <ul className="grid gap-3">
          {lista.map((a) => (
            <li key={a.chave} className={`bg-card border rounded-2xl p-5 grid gap-3 ${a.visivel ? "border-card-line" : "border-card-line opacity-70"}`}>
              <div className="flex items-start gap-3">
                {a.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.foto_url} alt="" className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-carbon grid place-items-center font-bold text-steel-line">{a.autor[0]}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-steel">{a.autor}</p>
                  <div className="flex items-center gap-2 text-xs text-steel-line">
                    <Estrelas n={a.nota} />
                    {new Date(a.publicado_em).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <form action={alternarVisivel}>
                  <input type="hidden" name="chave" value={a.chave} />
                  <input type="hidden" name="visivel" value={a.visivel ? "0" : "1"} />
                  <button
                    type="submit"
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border ${a.visivel ? "border-ok/40 text-ok" : "border-card-line text-steel-line"}`}
                    title={a.visivel ? "Esconder do site" : "Mostrar no site"}
                  >
                    {a.visivel ? <Eye size={14} /> : <EyeOff size={14} />} {a.visivel ? "No site" : "Escondida"}
                  </button>
                </form>
              </div>
              {a.texto && <p className="text-sm text-steel-line leading-relaxed whitespace-pre-line">{a.texto}</p>}
              {a.resposta ? (
                <p className="text-sm text-steel border-l-2 border-verniz pl-3">
                  <span className="text-xs font-bold text-verniz-shine block">Sua resposta</span>
                  {a.resposta}
                </p>
              ) : fonte === "perfil" && a.fonte === "perfil" && a.id_externo ? (
                <form action={responder} className="grid gap-2">
                  <input type="hidden" name="chave" value={a.chave} />
                  <input type="hidden" name="id_externo" value={a.id_externo} />
                  <label htmlFor={`resp-${a.chave}`} className="sr-only">Responder</label>
                  <textarea id={`resp-${a.chave}`} name="resposta" rows={2} placeholder="Responder no Google…" className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
                  <button type="submit" className="justify-self-start inline-flex items-center gap-1.5 rounded-full border border-verniz/60 text-verniz-shine text-xs font-bold px-3 py-1.5 hover:bg-verniz hover:text-carbon">
                    <MessageSquareReply size={14} /> Publicar resposta
                  </button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-steel-line">
        Depoimentos escritos à mão (de WhatsApp, por exemplo) continuam em <Link href="/admin/depoimentos" className="underline">Depoimentos manuais</Link>.
      </p>
    </div>
  );
}
