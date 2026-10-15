export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { MINIMO_RESPOSTA_INDEXAVEL } from "@/lib/perguntas";
import { salvarResposta, excluirPergunta } from "./actions";

type Linha = {
  id: number;
  pergunta: string;
  titulo: string | null;
  resposta: string | null;
  slug: string | null;
  servico_slug: string | null;
  status: "nova" | "respondida" | "publicada" | "arquivada";
  criado_em: string;
};

const ABAS = [
  ["nova", "Novas"],
  ["respondida", "Respondidas (fora do site)"],
  ["publicada", "No site"],
  ["arquivada", "Arquivadas"],
] as const;

const campo = "w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm";
const rotulo = "block text-xs font-bold uppercase tracking-wide text-steel-line mb-1";

export default async function PerguntasAdminPage({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const sp = await searchParams;
  const aba = (ABAS.find(([v]) => v === sp.ver)?.[0] ?? "nova") as Linha["status"];
  const [{ data: todas }, { data: contatos }, { data: servicos }] = await Promise.all([
    supabaseAdmin.from("perguntas_clientes").select("*").order("criado_em", { ascending: false }),
    supabaseAdmin.from("perguntas_contatos").select("*"),
    supabaseAdmin.from("services").select("slug, nome, ativo").eq("ativo", true).order("ordem"),
  ]);
  const linhas = (todas ?? []) as Linha[];
  const contato = new Map((contatos ?? []).map((c) => [c.pergunta_id as number, c as { nome: string | null; whatsapp: string | null }]));
  const lista = linhas.filter((l) => l.status === aba);
  const conta = (st: string) => linhas.filter((l) => l.status === st).length;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Perguntas de clientes</h1>
      <p className="text-steel-line text-sm mb-6 max-w-2xl">
        Perguntas enviadas pelo site em <a href="/perguntas" target="_blank" className="text-verniz-shine underline">/perguntas</a>.
        Responda aqui e, se quiser, publique: cada pergunta publicada vira uma página que ajuda outras pessoas e aparece no Google.
        O nome e o WhatsApp de quem perguntou nunca vão para o site.
      </p>

      <div className="rounded-xl border border-verniz/30 bg-verniz/5 p-4 mb-6 max-w-3xl text-sm text-steel-line">
        <strong className="text-steel">Como responder:</strong> explique o que causa o problema e o que resolve (qual serviço, o
        resultado, se tem garantia, valor “a partir de”). Não descreva o passo a passo do serviço nem como usar os produtos.
        Respostas com mais de {MINIMO_RESPOSTA_INDEXAVEL} letras entram no Google; as curtas ficam no site, mas fora da busca.
      </div>

      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        {ABAS.map(([v, l]) => (
          <Link
            key={v}
            href={`/admin/perguntas?ver=${v}`}
            className={`rounded-full px-4 py-1.5 border ${aba === v ? "border-verniz text-verniz-shine bg-verniz/10" : "border-card-line text-steel-line"}`}
          >
            {l} <span className="tabular-nums">({conta(v)})</span>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 max-w-3xl">
        {lista.map((l) => {
          const c = contato.get(l.id);
          const wa = c?.whatsapp
            ? `https://wa.me/${c.whatsapp.length <= 11 ? "55" + c.whatsapp : c.whatsapp}?text=${encodeURIComponent(
                `Olá${c.nome ? " " + c.nome : ""}! Aqui é da Clean Car. Sobre a sua pergunta no site: "${l.pergunta}"`
              )}`
            : null;
          return (
            <div key={l.id} className="bg-card border border-card-line rounded-2xl p-5">
              <div className="flex flex-wrap justify-between gap-2 text-xs text-steel-line mb-2">
                <span>{new Date(l.criado_em).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
                <span>
                  {c?.nome || "Sem nome"}
                  {wa && (
                    <>
                      {" · "}
                      <a href={wa} target="_blank" rel="noopener noreferrer" className="font-bold text-ok hover:underline">
                        Responder no WhatsApp ↗
                      </a>
                    </>
                  )}
                </span>
              </div>
              <p className="font-display font-bold text-lg text-steel">“{l.pergunta}”</p>

              <form action={salvarResposta} className="mt-4 grid gap-3">
                <input type="hidden" name="id" value={l.id} />
                <div>
                  <label className={rotulo}>Pergunta revisada para o site (opcional)</label>
                  <input name="titulo" defaultValue={l.titulo ?? ""} placeholder="Ex.: Mancha de café no banco do carro sai?" className={campo} />
                </div>
                <div>
                  <label className={rotulo}>Resposta</label>
                  <textarea name="resposta" rows={6} defaultValue={l.resposta ?? ""} className={campo} />
                </div>
                <div>
                  <label className={rotulo}>Serviço indicado (aparece como cartão na página)</label>
                  <select name="servico_slug" defaultValue={l.servico_slug ?? ""} className={campo}>
                    <option value="">— nenhum —</option>
                    {(servicos ?? []).map((s) => (
                      <option key={s.slug} value={s.slug}>{s.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {l.status !== "publicada" ? (
                    <>
                      <button name="acao" value="publicar" className="rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm hover:bg-verniz-shine">
                        Responder e publicar
                      </button>
                      <button name="acao" value="salvar" className="rounded-full border border-card-line text-steel font-display font-bold px-5 py-2 text-sm hover:border-verniz">
                        Só salvar
                      </button>
                    </>
                  ) : (
                    <>
                      <button name="acao" value="publicar" className="rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm hover:bg-verniz-shine">
                        Salvar alterações
                      </button>
                      <button name="acao" value="despublicar" className="rounded-full border border-card-line text-steel font-display font-bold px-5 py-2 text-sm hover:border-verniz">
                        Tirar do site
                      </button>
                      <a href={`/perguntas/${l.slug}`} target="_blank" className="self-center text-sm font-bold text-verniz-shine hover:underline">Ver no site ↗</a>
                    </>
                  )}
                  {l.status !== "arquivada" && (
                    <button name="acao" value="arquivar" className="rounded-full px-4 py-2 text-sm font-bold text-steel-line hover:underline">
                      Arquivar
                    </button>
                  )}
                </div>
              </form>
              <form action={excluirPergunta} className="mt-2">
                <input type="hidden" name="id" value={l.id} />
                <button className="text-xs font-bold text-warn hover:underline">Excluir de vez</button>
              </form>
            </div>
          );
        })}
        {lista.length === 0 && <p className="text-steel-line text-sm">Nenhuma pergunta aqui.</p>}
      </div>
    </div>
  );
}
