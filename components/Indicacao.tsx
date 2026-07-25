"use client";

import { Share2, Gift } from "lucide-react";
import { usePromocoes } from "@/components/PromoProvider";
import { useContato } from "@/components/ContatoProvider";
import AgendarButton from "@/components/AgendarButton";

export default function Indicacao() {
  const { indicacao } = usePromocoes();
  const contato = useContato();

  return (
    <section id="indicacao" className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center mb-10">
        <h2 className="font-display font-bold text-3xl text-steel mb-2">{indicacao.titulo}</h2>
        <p className="text-steel-line max-w-xl mx-auto">
          Seu código de indicação já está disponível no seu cadastro Clean Car — é só compartilhar.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-card border border-card-line rounded-2xl p-6">
          <Share2 className="text-verniz-shine mb-3" size={24} />
          <h3 className="font-display font-bold text-lg text-steel mb-2">Já sou cliente</h3>
          <p className="text-sm text-steel-line leading-relaxed mb-5">{indicacao.texto}</p>
          <AgendarButton href={contato.codigoIndicacaoUrl} className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2.5 text-sm hover:bg-verniz-shine transition-colors">
            Ver meu código
          </AgendarButton>
        </div>

        <div className="bg-card border border-card-line rounded-2xl p-6">
          <Gift className="text-cera mb-3" size={24} />
          <h3 className="font-display font-bold text-lg text-steel mb-2">Recebi um código</h3>
          <p className="text-sm text-steel-line leading-relaxed mb-5">{indicacao.regras}</p>
          <AgendarButton className="inline-block rounded-full bg-cera text-carbon font-display font-bold px-6 py-2.5 text-sm hover:brightness-95 transition-all">
            Agendar meu 1º serviço
          </AgendarButton>
        </div>
      </div>
    </section>
  );
}
