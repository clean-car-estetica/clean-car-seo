export const dynamic = "force-dynamic";

import { getContatoContent } from "@/lib/site-content";
import { salvarContato } from "./actions";

export default async function ContatoAdminPage() {
  const contato = await getContatoContent();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Contato e endereço</h1>
      <p className="text-steel-line text-sm mb-6">
        Esses dados aparecem no rodapé, no botão de WhatsApp, no botão de Agendar e nos dados
        estruturados que o Google e assistentes de IA leem.
      </p>

      <form action={salvarContato} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-2xl">
        <label className="flex items-start gap-3 rounded-xl border border-verniz/40 bg-carbon p-4 cursor-pointer">
          <input
            type="checkbox"
            name="levaETraz"
            defaultChecked={contato.levaETraz}
            className="mt-1 h-5 w-5 accent-verniz"
          />
          <span>
            <span className="block font-display font-bold text-steel">Leva e traz ativo</span>
            <span className="block text-xs text-steel-line mt-1">
              Desmarcado: o site esconde toda menção ao leva e traz (páginas, perguntas, textos das cidades,
              descrição do Google e arte de compartilhamento). Os textos ficam guardados — é só marcar de novo
              e salvar que tudo volta.
            </span>
          </span>
        </label>
        <fieldset className="rounded-xl border border-card-line p-4 grid gap-3">
          <legend className="px-1 text-xs font-bold uppercase tracking-wide text-steel-line">Avaliações do Google (aparece no topo do site)</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="notaGoogle" className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Nota</label>
              <input id="notaGoogle" name="notaGoogle" defaultValue={contato.notaGoogle} placeholder="Ex.: 4,9" className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
            </div>
            <div>
              <label htmlFor="totalAvaliacoes" className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Número de avaliações</label>
              <input id="totalAvaliacoes" name="totalAvaliacoes" inputMode="numeric" defaultValue={contato.totalAvaliacoes} placeholder="Ex.: 37" className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
            </div>
          </div>
          <p className="text-xs text-steel-line">Copie do seu Perfil da Empresa no Google. Deixe em branco para não mostrar. Atualize quando entrarem avaliações novas.</p>
        </fieldset>
        <div>
          <label htmlFor="metaPixelId" className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">ID do Pixel da Meta (opcional)</label>
          <input id="metaPixelId" name="metaPixelId" inputMode="numeric" defaultValue={contato.metaPixelId} placeholder="Só números, ex.: 1234567890123456" className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
          <p className="text-xs text-steel-line mt-1">Fica em Gerenciador de Eventos da Meta → Fontes de dados. Vazio = desligado.</p>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Endereço completo</label>
          <input
            name="endereco"
            defaultValue={contato.endereco}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Horário — semana</label>
            <input
              name="horarioSemana"
              defaultValue={contato.horarioSemana}
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Horário — sábado</label>
            <input
              name="horarioSabado"
              defaultValue={contato.horarioSabado}
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Observação de horário (feriados etc.)</label>
          <input
            name="observacaoHorario"
            defaultValue={contato.observacaoHorario}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Formas de pagamento</label>
          <input
            name="formasPagamento"
            defaultValue={contato.formasPagamento}
            placeholder="Ex: Pix, dinheiro, cartão de crédito/débito"
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">WhatsApp (só números, com DDI)</label>
            <input
              name="whatsapp"
              defaultValue={contato.whatsapp}
              placeholder="5511999999999"
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Instagram (usuário, sem @)</label>
            <input
              name="instagram"
              defaultValue={contato.instagram}
              className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Mensagem padrão do WhatsApp</label>
          <input
            name="whatsappMsg"
            defaultValue={contato.whatsappMsg}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Link do Instagram</label>
          <input
            name="instagramUrl"
            defaultValue={contato.instagramUrl}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Link de agendamento</label>
          <input
            name="agendamentoUrl"
            defaultValue={contato.agendamentoUrl}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Link "ver meu código" (Indique e Ganhe)</label>
          <input
            name="codigoIndicacaoUrl"
            defaultValue={contato.codigoIndicacaoUrl}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Link do Google (Maps/avaliações)</label>
          <input
            name="googleUrl"
            defaultValue={contato.googleUrl}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Link direto pra deixar avaliação no Google</label>
          <input
            name="googleReviewUrl"
            defaultValue={contato.googleReviewUrl}
            className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm"
          />
        </div>
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Salvar
        </button>
      </form>
    </div>
  );
}
