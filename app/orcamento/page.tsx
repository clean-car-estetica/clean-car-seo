"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { servicos } from "@/lib/data";
import { useTextos } from "@/components/TextosProvider";

export default function OrcamentoPage() {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [servico, setServico] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const textos = useTextos();

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    await supabaseBrowser().from("leads").insert({
      tipo: "orcamento",
      nome,
      whatsapp,
      servico_slug: servico || null,
      mensagem: mensagem || null,
    });
    setEnviando(false);
    setEnviado(true);
  }

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-xl px-6 py-24">
          {enviado ? (
            <div className="text-center">
              <h1 className="font-display font-extrabold text-3xl text-steel mb-4">Recebemos seu pedido! 🚗</h1>
              <p className="text-steel-line">Em breve alguém da Clean Car entra em contato pelo WhatsApp que você informou.</p>
            </div>
          ) : (
            <>
              <h1 className="font-display font-extrabold text-3xl text-steel mb-2">{textos.orcamentoTitulo}</h1>
              <p className="text-steel-line mb-8">{textos.orcamentoSubtitulo}</p>
              <form onSubmit={enviar} className="grid gap-4">
                <input
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="px-4 py-3 rounded-lg bg-card border border-card-line text-steel text-sm"
                />
                <input
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="WhatsApp com DDD"
                  className="px-4 py-3 rounded-lg bg-card border border-card-line text-steel text-sm"
                />
                <select
                  value={servico}
                  onChange={(e) => setServico(e.target.value)}
                  className="px-4 py-3 rounded-lg bg-card border border-card-line text-steel text-sm"
                >
                  <option value="">Qual serviço? (opcional)</option>
                  {servicos.map((s) => (
                    <option key={s.slug} value={s.slug}>{s.nome}</option>
                  ))}
                </select>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Conta um pouco sobre o carro / o que precisa (opcional)"
                  rows={3}
                  className="px-4 py-3 rounded-lg bg-card border border-card-line text-steel text-sm"
                />
                <button
                  type="submit"
                  disabled={enviando}
                  className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 hover:bg-verniz-shine transition-colors disabled:opacity-40"
                >
                  {enviando ? "Enviando..." : "Pedir orçamento"}
                </button>
              </form>
            </>
          )}
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
