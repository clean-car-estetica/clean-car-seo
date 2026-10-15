export const dynamic = "force-dynamic";

import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";
import AvisoCampanha from "@/components/admin/AvisoCampanha";
import { getCampanhas, situacaoCampanha, CAMPANHA_VAZIA, type CampanhaItem, type SituacaoCampanha } from "@/lib/site-content";
import { mensagemCampanha, dataCurta, reais } from "@/lib/campanha";
import { salvarCampanha, alternarCampanha, excluirCampanha } from "./actions";

const campo = "w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm";
const rotulo = "block text-xs font-bold uppercase tracking-wide text-steel-line mb-1";
const dica = "text-xs text-steel-line/80 mt-1";

const SITUACAO: Record<SituacaoCampanha, { nome: string; cor: string }> = {
  no_ar: { nome: "No ar", cor: "bg-ok/15 text-ok" },
  agendada: { nome: "Agendada", cor: "bg-verniz/15 text-verniz-shine" },
  pausada: { nome: "Pausada", cor: "bg-steel-line/15 text-steel-line" },
  encerrada: { nome: "Encerrada", cor: "bg-card-line text-steel-line/70" },
};
const ORDEM: SituacaoCampanha[] = ["no_ar", "agendada", "pausada", "encerrada"];

export default async function CampanhaAdminPage({ searchParams }: { searchParams: Promise<{ editar?: string; nova?: string; salvo?: string; copiar?: string }> }) {
  const sp = await searchParams;
  const lista = await getCampanhas();
  const base = sp.editar ? lista.find((c) => c.id === sp.editar) : sp.copiar ? lista.find((c) => c.id === sp.copiar) : undefined;
  const editando: CampanhaItem | null = sp.editar && base ? base : sp.copiar && base ? { ...base, id: "", titulo: base.titulo + " (cópia)", inicia_em: null, termina_em: null } : sp.nova ? { ...CAMPANHA_VAZIA, ativo: true } : null;
  const ordenada = [...lista].sort((a, b) => ORDEM.indexOf(situacaoCampanha(a)) - ORDEM.indexOf(situacaoCampanha(b)) || (a.inicia_em ?? "").localeCompare(b.inicia_em ?? ""));

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Campanhas</h1>
      <p className="text-steel-line text-sm mb-6 max-w-2xl">
        Programe as promoções com <strong className="text-steel">data de início e de fim</strong>: cada uma entra no site
        sozinha no primeiro dia e sai sozinha depois do último. A campanha do dia aparece em destaque abaixo do topo da página
        inicial e como pop-up nas outras páginas.
      </p>

      <AvisoCampanha lista={lista} />
      {sp.salvo && <p className="mb-6 max-w-4xl rounded-lg border border-ok/40 bg-ok/10 px-4 py-2 text-sm text-ok">Salvo.</p>}

      {!editando && (
        <Link href="/admin/campanha?nova=1" className="inline-block mb-6 rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm hover:bg-verniz-shine">
          + Programar nova campanha
        </Link>
      )}

      {editando && (
        <form action={salvarCampanha} className="bg-card border border-card-line rounded-2xl p-6 grid gap-5 max-w-3xl mb-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display font-bold text-xl text-steel">{editando.id ? `Editando: ${editando.titulo}` : "Nova campanha"}</h2>
            <Link href="/admin/campanha" className="text-sm font-bold text-steel-line hover:underline">Fechar</Link>
          </div>
          <input type="hidden" name="id" value={editando.id} />
          <label className="flex items-center gap-2 text-sm font-bold text-steel">
            <input type="checkbox" name="ativo" defaultChecked={editando.ativo} className="accent-verniz" /> Ligada (desmarque para pausar sem apagar)
          </label>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={rotulo}>Primeiro dia</label>
              <input name="inicia_em" type="date" defaultValue={editando.inicia_em ?? ""} className={campo} />
              <p className={dica}>Vazio = começa já.</p>
            </div>
            <div>
              <label className={rotulo}>Último dia</label>
              <input name="termina_em" type="date" defaultValue={editando.termina_em ?? ""} className={campo} />
              <p className={dica}>No dia seguinte sai do site sozinha.</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-[2fr_1fr] gap-4">
            <div>
              <label className={rotulo}>Nome da campanha</label>
              <input name="titulo" required defaultValue={editando.titulo} placeholder="Ex.: Campanha de Primavera" className={campo} />
            </div>
            <div>
              <label className={rotulo}>Selo grande</label>
              <input name="selo" defaultValue={editando.selo} placeholder="Ex.: 20% OFF" className={campo} />
            </div>
          </div>
          <div>
            <label className={rotulo}>Serviço da campanha</label>
            <input name="servico" defaultValue={editando.servico} placeholder="Ex.: Higienização Interna VIP" className={campo} />
            <p className={dica}>Vai escrito na mensagem do WhatsApp, para o bot saber do que se trata.</p>
          </div>
          <div>
            <label className={rotulo}>Texto</label>
            <textarea name="texto" defaultValue={editando.texto} rows={3} placeholder="O que está em promoção e o que a pessoa ganha" className={campo} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={rotulo}>Preço normal (R$)</label>
              <input name="preco_de" inputMode="decimal" defaultValue={editando.preco_de ?? ""} placeholder="420" className={campo} />
            </div>
            <div>
              <label className={rotulo}>Preço na campanha (R$)</label>
              <input name="preco_por" inputMode="decimal" defaultValue={editando.preco_por ?? ""} placeholder="336" className={campo} />
              <p className={dica}>Vazio = não mostra preço.</p>
            </div>
          </div>
          <div>
            <label className={rotulo}>Observação (letra miúda)</label>
            <input name="observacao" defaultValue={editando.observacao} placeholder="Ex.: Valor referente apenas à Higienização Interna VIP. A lavagem externa não está inclusa." className={campo} />
            <p className={dica}>No site aparece com * ao lado do preço. No WhatsApp vai em negrito.</p>
          </div>
          <ImageUploader name="imagem_url" initialUrl={editando.imagem_url ?? ""} label="Foto (de preferência antes e depois, sem texto escrito)" aspect={4 / 3} specTexto="1200x900px (4:3)" nomeArquivo={editando.titulo || "campanha"} />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={rotulo}>Texto do botão</label>
              <input name="texto_botao" defaultValue={editando.texto_botao} className={campo} />
            </div>
            <div>
              <label className={rotulo}>Link do botão (opcional)</label>
              <input name="link_botao" defaultValue={editando.link_botao} placeholder="vazio = WhatsApp com a mensagem abaixo" className={campo} />
            </div>
          </div>
          <div>
            <label className={rotulo}>Mensagem do WhatsApp (opcional)</label>
            <textarea name="mensagem_whatsapp" defaultValue={editando.mensagem_whatsapp} rows={3} placeholder="Vazio = montada sozinha com nome, serviço, preço, validade e a observação em negrito" className={campo} />
            {editando.id && (
              <p className={dica}>
                Hoje vai assim: <span className="whitespace-pre-line text-steel">{mensagemCampanha(editando)}</span>
              </p>
            )}
          </div>
          <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">Salvar</button>
        </form>
      )}

      <div className="grid gap-3 max-w-4xl">
        {ordenada.map((c) => {
          const sit = SITUACAO[situacaoCampanha(c)];
          return (
            <div key={c.id} className="bg-card border border-card-line rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${sit.cor}`}>{sit.nome}</span>
                  <span className="font-display font-bold text-steel">{c.titulo}</span>
                  {c.selo && <span className="text-sm text-verniz-shine font-bold">{c.selo}</span>}
                </div>
                <div className="text-xs text-steel-line mt-1">
                  {c.inicia_em ? dataCurta(c.inicia_em) : "já"} → {c.termina_em ? dataCurta(c.termina_em) : "sem fim"}
                  {c.servico && ` · ${c.servico}`}
                  {c.preco_por != null && ` · ${reais(c.preco_por)}`}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                <Link href={`/admin/campanha?editar=${c.id}`} className="text-verniz-shine hover:underline">Editar</Link>
                <Link href={`/admin/campanha?copiar=${c.id}`} className="text-steel-line hover:underline">Duplicar</Link>
                <form action={alternarCampanha}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-steel-line hover:underline">{c.ativo ? "Pausar" : "Ligar"}</button>
                </form>
                <form action={excluirCampanha}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-warn hover:underline">Excluir</button>
                </form>
              </div>
            </div>
          );
        })}
        {lista.length === 0 && <p className="text-sm text-steel-line">Nenhuma campanha programada ainda.</p>}
      </div>
    </div>
  );
}
