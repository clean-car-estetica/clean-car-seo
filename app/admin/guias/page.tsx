export const dynamic = "force-dynamic";

import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import ImageUploader from "@/components/ImageUploader";
import { perguntasParaTexto, secoesParaTexto } from "@/lib/formato-console";
import { caminhoGuia, NOME_TIPO, type Guia, type TipoGuia } from "@/lib/guias";
import { salvarGuia, definirStatusGuia, excluirGuia } from "./actions";
import SeletorStatus from "@/components/admin/SeletorStatus";

const campo = "w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm";
const rotulo = "block text-xs font-bold uppercase tracking-wide text-steel-line mb-1";
const dica = "text-xs text-steel-line/80 mt-1";

export default async function GuiasAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string; nova?: string; ver?: string; salvo?: string }>;
}) {
  const sp = await searchParams;
  const [{ data: guiasData }, { data: servicosData }] = await Promise.all([
    supabaseAdmin.from("guias").select("*").order("tipo").order("ordem").order("titulo"),
    supabaseAdmin.from("services").select("slug, nome, ativo").order("ordem"),
  ]);
  const guias = (guiasData ?? []) as Guia[];
  const servicos = (servicosData ?? []).filter((s) => s.ativo);
  const editando = sp.editar ? guias.find((g) => g.slug === sp.editar) ?? null : null;
  const novaTipo = (sp.nova === "problema" || sp.nova === "publico" ? sp.nova : null) as TipoGuia | null;
  const mostrarForm = Boolean(editando || novaTipo);
  const tipoForm: TipoGuia = editando?.tipo ?? novaTipo ?? "problema";

  const filtro = sp.ver ?? "todos";
  const lista = guias.filter((g) =>
    filtro === "problema" || filtro === "publico" ? g.tipo === filtro : filtro === "rascunho" ? g.status === "rascunho" : true
  );
  const conta = (tipo: TipoGuia, status: Guia["status"]) => guias.filter((g) => g.tipo === tipo && g.status === status).length;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Guias</h1>
      <p className="text-steel-line text-sm mb-6 max-w-2xl">
        Páginas escritas do jeito que as pessoas buscam no Google: o <strong className="text-steel">problema</strong> (“cheiro de
        cigarro no carro”) ou o <strong className="text-steel">público</strong> (“motorista de aplicativo”). Cada uma leva aos
        serviços que resolvem. Tudo nasce como <strong className="text-steel">rascunho</strong>: revise na prévia e publique
        quando estiver bom. Dica: publique aos poucos, uns 5 a 10 por semana.
      </p>

      {/* Placar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 max-w-4xl">
        {(["problema", "publico"] as TipoGuia[]).flatMap((tipo) =>
          (["publicado", "rascunho"] as const).map((st) => (
            <div key={`${tipo}-${st}`} className="rounded-xl bg-card border border-card-line p-4">
              <div className="text-xs text-steel-line">{NOME_TIPO[tipo]}</div>
              <div className="font-display font-extrabold text-3xl text-steel tabular-nums">{conta(tipo, st)}</div>
              <div className={`text-xs font-bold ${st === "publicado" ? "text-ok" : "text-steel-line"}`}>
                {st === "publicado" ? "no ar" : "rascunhos"}
              </div>
            </div>
          ))
        )}
      </div>

      {sp.salvo && (
        <p className="mb-6 max-w-3xl rounded-lg border border-ok/40 bg-ok/10 px-4 py-2 text-sm text-ok">Salvo.</p>
      )}

      {mostrarForm ? (
        <form action={salvarGuia} className="bg-card border border-card-line rounded-2xl p-6 grid gap-5 max-w-3xl mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display font-bold text-xl text-steel">
              {editando ? `Editando: ${editando.titulo}` : `Nova guia — ${NOME_TIPO[tipoForm]}`}
            </h2>
            <div className="flex gap-3 text-sm">
              {editando && (
                <a href={`/admin/guias/previa/${editando.slug}`} target="_blank" className="font-bold text-verniz-shine hover:underline">
                  Abrir prévia ↗
                </a>
              )}
              <Link href="/admin/guias" className="font-bold text-steel-line hover:underline">Fechar</Link>
            </div>
          </div>

          <input type="hidden" name="slug_existente" value={editando?.slug ?? ""} />
          <input type="hidden" name="tipo" value={tipoForm} />

          <div>
            <label className={rotulo}>Título da página (o que a pessoa lê no topo)</label>
            <input name="titulo" required defaultValue={editando?.titulo ?? ""} className={campo} />
          </div>
          {!editando && (
            <div>
              <label className={rotulo}>Endereço (opcional)</label>
              <input name="slug" placeholder="gerado do título se ficar vazio" className={campo} />
              <p className={dica}>Fica em cleancarestetica.com.br{tipoForm === "problema" ? "/problemas/" : "/para/"}…</p>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={rotulo}>Rótulo curto</label>
              <input name="chamada" defaultValue={editando?.chamada ?? ""} placeholder="Ex.: Cheiro de cigarro" className={campo} />
              <p className={dica}>Aparece acima do título e nos botões “Veja também”.</p>
            </div>
            <div>
              <label className={rotulo}>Ordem na lista</label>
              <input name="ordem" type="number" defaultValue={editando?.ordem ?? 0} className={campo} />
            </div>
          </div>
          <div>
            <label className={rotulo}>Título no Google</label>
            <input name="titulo_seo" defaultValue={editando?.titulo_seo ?? ""} className={campo} />
            <p className={dica}>Até ~60 letras. Vazio = usa o título da página.</p>
          </div>
          <div>
            <label className={rotulo}>Descrição no Google</label>
            <textarea name="meta_descricao" rows={2} defaultValue={editando?.meta_descricao ?? ""} className={campo} />
            <p className={dica}>Até ~155 letras. É o texto que aparece embaixo do título no resultado da busca.</p>
          </div>
          <div>
            <label className={rotulo}>Abertura</label>
            <textarea name="intro" rows={3} defaultValue={editando?.intro ?? ""} className={campo} />
            <p className={dica}>2 ou 3 frases que já respondem o que a pessoa buscou.</p>
          </div>
          <div>
            <label className={rotulo}>Seções</label>
            <textarea name="secoes" rows={14} defaultValue={editando ? secoesParaTexto(editando.secoes) : "## O que causa\n\n## Como a Clean Car resolve\n"} className={`${campo} font-mono`} />
            <p className={dica}>
              Cada seção começa com <code>## Título</code>. Parágrafos separados por linha em branco; lista com “- ” no começo da linha.
              Descreva o problema e o resultado — sem passo a passo do serviço nem como usar os produtos.
            </p>
          </div>
          <div>
            <label className={rotulo}>Perguntas frequentes</label>
            <textarea name="perguntas" rows={8} defaultValue={editando ? perguntasParaTexto(editando.perguntas) : "P: \nR: "} className={`${campo} font-mono`} />
            <p className={dica}>Uma pergunta por bloco: linha “P: …”, linha “R: …”, linha em branco entre elas.</p>
          </div>
          <fieldset>
            <legend className={rotulo}>Serviços que resolvem (aparecem como cartões)</legend>
            <div className="grid sm:grid-cols-2 gap-2 mt-1">
              {servicos.map((s) => (
                <label key={s.slug} className="flex items-center gap-2 text-sm text-steel-line">
                  <input type="checkbox" name="servicos" value={s.slug} defaultChecked={editando?.servicos.includes(s.slug)} className="accent-verniz" />
                  {s.nome}
                </label>
              ))}
            </div>
          </fieldset>
          <ImageUploader
            name="imagem_url"
            initialUrl={editando?.imagem_url ?? ""}
            label="Foto do topo (opcional — sem foto, usa a do 1º serviço)"
            aspect={4 / 3}
            specTexto="1200x900px (4:3)"
            nomeArquivo={editando?.titulo ?? "guia"}
          />
          <div>
            <label className={rotulo}>Status</label>
            <select name="status" defaultValue={editando?.status ?? "rascunho"} className="px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm">
              <option value="rascunho">Rascunho (fora do site)</option>
              <option value="publicado">Publicado (no site e no Google)</option>
            </select>
          </div>
          <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
            Salvar
          </button>
        </form>
      ) : (
        <div className="flex flex-wrap gap-3 mb-8">
          <Link href="/admin/guias?nova=problema" className="rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm hover:bg-verniz-shine">
            + Problema → solução
          </Link>
          <Link href="/admin/guias?nova=publico" className="rounded-full border border-verniz text-verniz-shine font-display font-bold px-5 py-2 text-sm hover:bg-verniz hover:text-carbon">
            + Página por público
          </Link>
        </div>
      )}

      {/* Filtro */}
      <div className="flex flex-wrap gap-2 mb-4 text-sm">
        {[
          ["todos", "Todas"],
          ["rascunho", "Só rascunhos"],
          ["problema", "Problemas"],
          ["publico", "Públicos"],
        ].map(([v, l]) => (
          <Link
            key={v}
            href={`/admin/guias?ver=${v}`}
            className={`rounded-full px-4 py-1.5 border ${filtro === v ? "border-verniz text-verniz-shine bg-verniz/10" : "border-card-line text-steel-line"}`}
          >
            {l}
          </Link>
        ))}
      </div>

      <div className="grid gap-3 max-w-4xl">
        {lista.map((g) => (
          <div key={g.slug} className="bg-card border border-card-line rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-display font-bold text-steel">
                {g.titulo}
              </div>
              <div className="text-xs text-steel-line">
                {NOME_TIPO[g.tipo]} · {caminhoGuia(g)} · {g.servicos.length} serviço(s)
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <a href={`/admin/guias/previa/${g.slug}`} target="_blank" className="text-steel-line hover:underline">Prévia ↗</a>
              <Link href={`/admin/guias?editar=${g.slug}`} className="text-verniz-shine hover:underline">Editar</Link>
              <SeletorStatus acao={definirStatusGuia} chave={g.slug} publicado={g.status === "publicado"} />
              <form action={excluirGuia}>
                <input type="hidden" name="slug" value={g.slug} />
                <button type="submit" className="text-warn hover:underline">Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {lista.length === 0 && <p className="text-steel-line text-sm">Nada por aqui ainda.</p>}
      </div>
    </div>
  );
}
