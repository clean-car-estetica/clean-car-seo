import { Clock } from "lucide-react";
import Midia from "@/components/Midia";
import AgendarButton from "@/components/AgendarButton";
import WhatsappCTA from "@/components/WhatsappCTA";
import ObservacoesServicos from "@/components/ObservacoesServicos";

// Topo das páginas de serviço (e de serviço por cidade): texto à esquerda,
// foto ou vídeo do serviço à direita, preço e duração à vista e os dois
// caminhos — agendar pelo WhatsApp ou tirar dúvida.
export default function ServicoTopo({
  titulo,
  nomeServico,
  contexto,
  descricao,
  duracao,
  preco,
  midia,
  textoAgendar = "Agendar este serviço",
}: {
  titulo: string;
  nomeServico: string;
  contexto?: string;
  descricao: string;
  duracao?: string | null;
  preco?: number | null;
  midia?: string;
  textoAgendar?: string;
}) {
  return (
    <section className="border-b border-card-line">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20 grid lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] gap-10 items-center">
        <div className="order-2 lg:order-1">
          {contexto && <p className="text-verniz-shine font-display font-bold text-lg mb-3">{contexto}</p>}
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-7xl leading-[0.92] text-steel text-balance">{titulo}</h1>
          {titulo !== nomeServico && <p className="mt-3 text-steel-line">Serviço: {nomeServico}</p>}
          <p className="mt-6 text-lg text-steel leading-relaxed max-w-xl">{descricao}</p>

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            {preco ? (
              <div>
                <dt className="text-sm text-steel-line">A partir de</dt>
                <dd className="font-display font-extrabold text-4xl text-verniz-shine">R$ {preco}</dd>
              </div>
            ) : null}
            {duracao && (
              <div>
                <dt className="text-sm text-steel-line">Tempo de serviço</dt>
                <dd className="font-display font-bold text-2xl text-steel flex items-center gap-2 mt-1">
                  <Clock size={20} className="text-steel-line" /> {duracao}
                </dd>
              </div>
            )}
          </dl>
          <ObservacoesServicos className="mt-4 max-w-xl" />

          <div className="mt-8 flex flex-wrap gap-3">
            <AgendarButton
              servico={nomeServico}
              className="inline-block rounded-full bg-verniz text-carbon font-display font-bold text-lg px-8 py-3 hover:bg-verniz-shine transition-colors"
            >
              {textoAgendar}
            </AgendarButton>
            <WhatsappCTA texto="Tirar dúvida no WhatsApp" servico={nomeServico} />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-card-line bg-card">
            {midia ? (
              <Midia src={midia} alt={nomeServico} className="foto-servico absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center p-8 text-center font-display font-bold text-3xl text-steel-line/50">
                {nomeServico}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
