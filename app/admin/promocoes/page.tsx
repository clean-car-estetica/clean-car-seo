export const dynamic = "force-dynamic";

import { getPromocoes } from "@/lib/site-content";
import { salvarPromocao } from "./actions";

function FormPromo({
  chave,
  titulo,
  promo,
  labelTexto = "Benefício (texto principal)",
  labelRegras = "Regras (letra miúda)",
  mostrarPausa = false,
}: {
  chave: string;
  titulo: string;
  promo: { titulo: string; texto: string; regras: string; ativo: boolean };
  labelTexto?: string;
  labelRegras?: string;
  mostrarPausa?: boolean;
}) {
  return (
    <form action={salvarPromocao} className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
      <input type="hidden" name="chave" value={chave} />
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-steel">{titulo}</h2>
        {mostrarPausa && (
          <label className="flex items-center gap-2 text-xs text-steel-line">
            <input type="checkbox" name="ativo" defaultChecked={promo.ativo} /> Pop-up ativo
          </label>
        )}
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Título mostrado</label>
        <input name="titulo" defaultValue={promo.titulo} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">{labelTexto}</label>
        <textarea name="texto" defaultValue={promo.texto} rows={2} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">{labelRegras}</label>
        <textarea name="regras" defaultValue={promo.regras} rows={3} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
      </div>
      <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
        Salvar
      </button>
    </form>
  );
}

export default async function PromocoesAdminPage() {
  const promocoes = await getPromocoes();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Promoções</h1>
      <p className="text-steel-line text-sm mb-6">
        Edite o benefício e as regras do cupom de primeira visita e do Indique e Ganhe.
        Se a regra do GBR Sistemas mudar, atualize aqui também pra manter tudo igual.
      </p>
      <div className="grid gap-6 max-w-2xl">
        <FormPromo chave="cupom" titulo="Cupom de primeira visita" promo={promocoes.cupom} mostrarPausa />
        <FormPromo
          chave="indicacao"
          titulo="Indique e Ganhe"
          promo={promocoes.indicacao}
          labelTexto="Mensagem pra quem já é cliente (indicador)"
          labelRegras="Mensagem pra quem recebeu um código (indicado)"
        />
      </div>
    </div>
  );
}
