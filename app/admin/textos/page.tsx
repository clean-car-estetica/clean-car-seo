export const dynamic = "force-dynamic";

import { getTextosGerais } from "@/lib/site-content";
import { salvarTextos } from "./actions";

function Campo({ nome, defaultValue, label, area }: { nome: string; defaultValue: string; label: string; area?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">{label}</label>
      {area ? (
        <textarea name={nome} defaultValue={defaultValue} rows={2} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
      ) : (
        <input name={nome} defaultValue={defaultValue} className="w-full px-3 py-2 rounded-lg bg-carbon border border-card-line text-steel text-sm" />
      )}
    </div>
  );
}

export default async function TextosAdminPage() {
  const t = await getTextosGerais();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Textos do site</h1>
      <p className="text-steel-line text-sm mb-6">
        Rótulos do menu, rodapé e títulos de seção — literalmente qualquer palavra aqui, sem precisar mexer em código.
      </p>

      <form action={salvarTextos} className="grid gap-8 max-w-2xl">
        <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
          <h2 className="font-display font-bold text-steel mb-1">Menu (cabeçalho)</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Campo nome="navServicos" defaultValue={t.navServicos} label="Link: Serviços" />
            <Campo nome="navPlanos" defaultValue={t.navPlanos} label="Link: Planos" />
            <Campo nome="navFaq" defaultValue={t.navFaq} label="Link: FAQ" />
            <Campo nome="navIndicacao" defaultValue={t.navIndicacao} label="Link: Indique e ganhe" />
            <Campo nome="navBeneficios" defaultValue={t.navBeneficios} label="Link: Benefícios" />
            <Campo nome="navContato" defaultValue={t.navContato} label="Link: Contato" />
            <Campo nome="navBlog" defaultValue={t.navBlog} label="Link: Blog" />
            <Campo nome="navBotaoAgendar" defaultValue={t.navBotaoAgendar} label="Botão principal" />
            <Campo nome="navMogi" defaultValue={t.navMogi} label="Link: Mogi das Cruzes (hub)" />
            <Campo nome="navSobre" defaultValue={t.navSobre} label="Link: Sobre Nós" />
          </div>
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
          <h2 className="font-display font-bold text-steel mb-1">Rodapé</h2>
          <Campo nome="footerTagline" defaultValue={t.footerTagline} label="Frase de apresentação" area />
          <Campo nome="footerLojaLabel" defaultValue={t.footerLojaLabel} label="Rótulo do bloco de endereço (ex: Loja, Unidade...)" />
          <Campo nome="footerRecebemos" defaultValue={t.footerRecebemos} label="Frase 'recebemos clientes de...'" />
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
          <h2 className="font-display font-bold text-steel mb-1">Seção "Onde estamos" (home)</h2>
          <Campo nome="homeCidadesTitulo" defaultValue={t.homeCidadesTitulo} label="Título" />
          <Campo nome="homeCidadesSubtitulo" defaultValue={t.homeCidadesSubtitulo} label="Subtítulo" area />
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
          <h2 className="font-display font-bold text-steel mb-1">Seção "Catálogo de serviços" (home)</h2>
          <Campo nome="homeServicosTitulo" defaultValue={t.homeServicosTitulo} label="Título" />
          <Campo nome="homeServicosSubtitulo" defaultValue={t.homeServicosSubtitulo} label="Subtítulo" area />
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
          <h2 className="font-display font-bold text-steel mb-1">Página de FAQ</h2>
          <Campo nome="faqSubtitulo" defaultValue={t.faqSubtitulo} label="Selo pequeno (acima do título)" />
          <Campo nome="faqTitulo" defaultValue={t.faqTitulo} label="Título" />
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
          <h2 className="font-display font-bold text-steel mb-1">Página de Benefícios</h2>
          <Campo nome="beneficiosTitulo" defaultValue={t.beneficiosTitulo} label="Título" />
          <Campo nome="beneficiosSubtitulo" defaultValue={t.beneficiosSubtitulo} label="Subtítulo" area />
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
          <h2 className="font-display font-bold text-steel mb-1">Página de Orçamento</h2>
          <Campo nome="orcamentoTitulo" defaultValue={t.orcamentoTitulo} label="Título" />
          <Campo nome="orcamentoSubtitulo" defaultValue={t.orcamentoSubtitulo} label="Subtítulo" area />
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
          <h2 className="font-display font-bold text-steel mb-1">Página de Avaliação (NPS)</h2>
          <Campo nome="avaliarTitulo" defaultValue={t.avaliarTitulo} label="Título" />
          <Campo nome="avaliarSubtitulo" defaultValue={t.avaliarSubtitulo} label="Subtítulo" area />
          <Campo nome="avaliarSucessoTitulo" defaultValue={t.avaliarSucessoTitulo} label="Título após enviar" />
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6 grid gap-3">
          <h2 className="font-display font-bold text-steel mb-1">Labels de formulário (usados em vários lugares)</h2>
          <Campo nome="labelNome" defaultValue={t.labelNome} label="Campo de nome" />
          <Campo nome="labelWhatsapp" defaultValue={t.labelWhatsapp} label="Campo de WhatsApp" />
        </div>

        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine">
          Salvar textos
        </button>
      </form>
    </div>
  );
}
