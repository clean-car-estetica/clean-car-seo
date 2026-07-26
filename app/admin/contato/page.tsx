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
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Salvar
        </button>
      </form>
    </div>
  );
}
