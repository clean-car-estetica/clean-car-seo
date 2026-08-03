import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import AgendarButton from "@/components/AgendarButton";
import AgendamentoForm from "@/components/AgendamentoForm";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { buscarServicosGbr } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Agendar Online",
  description: "Agende seu horário na Clean Car Estética Automotiva direto pelo site, sem precisar ligar.",
};

export default async function AgendarOnlinePage() {
  const { data: integracao } = await supabaseAdmin.from("gbr_integracao").select("ativo").eq("id", 1).maybeSingle();
  const integracaoAtiva = Boolean(integracao?.ativo);

  const servicosResp = integracaoAtiva ? await buscarServicosGbr() : null;

  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-xl px-6 py-20">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-steel mb-2">Agendar horário</h1>
          <p className="text-steel-line mb-8">Escolha o serviço, o dia e o horário — sem precisar ligar ou sair do site.</p>

          {integracaoAtiva && servicosResp?.ok ? (
            <AgendamentoForm servicosIniciais={servicosResp.dados} />
          ) : (
            <div className="bg-card border border-card-line rounded-2xl p-6 text-center">
              <p className="text-steel-line text-sm mb-4">
                {integracaoAtiva
                  ? `Não consegui carregar os horários agora (${servicosResp?.erro}). Agende pelo link abaixo:`
                  : "Agende pelo nosso sistema de reservas:"}
              </p>
              <AgendarButton className="inline-block rounded-full bg-verniz text-carbon font-display font-bold px-8 py-3 hover:bg-verniz-shine transition-colors">
                Agendar horário
              </AgendarButton>
            </div>
          )}
        </section>
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
