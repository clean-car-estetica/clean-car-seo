export const dynamic = "force-dynamic";

import AvisoCampanha from "@/components/admin/AvisoCampanha";
import { getCampanhasComOrigem } from "@/lib/campanhas-servidor";
import { situacaoCampanha, campanhaProxima, type SituacaoCampanha } from "@/lib/site-content";
import { mensagemCampanha, dataCurta, reais } from "@/lib/campanha";

const SITUACAO: Record<SituacaoCampanha, { nome: string; cor: string }> = {
  no_ar: { nome: "No ar", cor: "bg-ok/15 text-ok" },
  agendada: { nome: "Agendada", cor: "bg-verniz/15 text-verniz-shine" },
  pausada: { nome: "Pausada", cor: "bg-steel-line/15 text-steel-line" },
  encerrada: { nome: "Encerrada", cor: "bg-card-line text-steel-line/70" },
};

// 15/10/2026: as campanhas são cadastradas no SAS (Serviços e estoque >
// Campanhas). Aqui só se confere o que o site está mostrando e a mensagem
// que vai para o WhatsApp.
export default async function CampanhaAdminPage() {
  const { lista, origem, mostrarVemAi } = await getCampanhasComOrigem();
  const proxima = campanhaProxima(lista);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Campanhas</h1>
      <p className="text-steel-line text-sm mb-6 max-w-2xl">
        As campanhas agora são cadastradas <strong className="text-steel">no SAS</strong>, em{" "}
        <strong className="text-steel">Serviços e estoque → Campanhas</strong>. De lá elas aparecem aqui no site (faixa da
        página inicial e pop-up) e a IA do WhatsApp já confirma o preço da campanha. Esta tela só mostra o que está valendo.
      </p>

      <a
        href="https://www.gbr-sistemas.tec.br"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mb-6 rounded-full bg-verniz text-carbon font-display font-bold px-5 py-2 text-sm hover:bg-verniz-shine"
      >
        Abrir o SAS para cadastrar ↗
      </a>

      {origem === "reserva" && (
        <p className="mb-6 max-w-4xl rounded-lg border border-cera/50 bg-cera/10 px-4 py-2 text-sm text-cera">
          O SAS não respondeu agora (ou a integração ainda não está configurada). O site está usando a lista reserva antiga até
          o SAS voltar.
        </p>
      )}

      {origem === "sas-vazio" && (
        <p className="mb-6 max-w-4xl rounded-lg border border-cera/50 bg-cera/10 px-4 py-2 text-sm text-cera">
          O SAS está conectado, mas ainda não tem nenhuma campanha cadastrada. Até você cadastrar a primeira, o site usa a lista
          reserva antiga.
        </p>
      )}

      <AvisoCampanha lista={lista} />

      {/* 22/10/2026: a chave do "Vem aí" fica no SAS, junto do cadastro das campanhas */}
      <div className="mb-6 max-w-4xl bg-card border border-card-line rounded-xl p-4">
        <h2 className="font-display font-bold text-lg text-steel">Próxima campanha (“Vem aí”)</h2>
        <p className={`text-sm mt-1 font-bold ${mostrarVemAi ? "text-ok" : "text-steel-line"}`}>
          {mostrarVemAi
            ? proxima ? `Ligado no SAS — a página inicial anuncia “${proxima.titulo}” (começa ${dataCurta(proxima.inicia_em)}).` : "Ligado no SAS, mas não há campanha agendada para os próximos 60 dias."
            : "Desligado no SAS — o site mostra só a campanha de hoje; as agendadas aparecem no dia em que começam."}
        </p>
        <p className="text-xs text-steel-line mt-1">Para mudar: SAS → Serviços e estoque → Campanhas → “Mostrar a próxima campanha antes de começar”.</p>
      </div>

      <div className="grid gap-3 max-w-4xl">
        {lista.map((c) => {
          const sit = SITUACAO[situacaoCampanha(c)];
          return (
            <div key={c.id} className="bg-card border border-card-line rounded-xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${sit.cor}`}>{sit.nome}</span>
                <span className="font-display font-bold text-steel">{c.titulo}</span>
                {c.selo && <span className="text-sm text-verniz-shine font-bold">{c.selo}</span>}
              </div>
              <div className="text-xs text-steel-line mt-1">
                {c.inicia_em ? dataCurta(c.inicia_em) : "já"} → {c.termina_em ? dataCurta(c.termina_em) : "sem fim"}
                {c.servico && ` · ${c.servico}`}
                {c.preco_por != null && ` · ${c.preco_de != null ? `${reais(c.preco_de)} → ` : ""}${reais(c.preco_por)}`}
                {!c.imagem_url && " · sem foto"}
              </div>
              <details className="mt-2 text-xs text-steel-line">
                <summary className="cursor-pointer font-bold">Mensagem que vai para o WhatsApp</summary>
                <p className="mt-2 whitespace-pre-line text-steel">{mensagemCampanha(c)}</p>
              </details>
            </div>
          );
        })}
        {lista.length === 0 && <p className="text-sm text-steel-line">Nenhuma campanha no ar nem agendada no SAS.</p>}
      </div>
    </div>
  );
}
