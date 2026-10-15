import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsappFloat from "@/components/WhatsappFloat";
import PerguntaForm from "@/components/PerguntaForm";
import { SITE_URL } from "@/lib/config";
import { getPerguntasPublicadas, tituloPergunta } from "@/lib/perguntas";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const perguntas = await getPerguntasPublicadas();
  return {
    title: { absolute: "Pergunte para a Clean Car: dúvidas sobre o seu carro | Mogi das Cruzes" },
    description:
      "Mande a sua dúvida sobre limpeza, manchas, cheiro, faróis ou estofados e a equipe da Clean Car responde. Veja também as perguntas já respondidas.",
    alternates: { canonical: `${SITE_URL}/perguntas` },
    ...(perguntas.length ? {} : { robots: { index: false, follow: true } }),
  };
}

export default async function PerguntasPage() {
  const perguntas = await getPerguntasPublicadas();
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        <section className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <p className="font-display text-verniz-shine tracking-[0.3em] uppercase text-sm mb-4">Pergunte</p>
          <h1 className="font-display font-extrabold text-4xl md:text-5xl text-steel text-balance">Tem uma dúvida sobre o seu carro?</h1>
          <p className="mt-4 text-lg text-steel-line">
            Mancha que não sai, cheiro estranho, farol amarelado, sofá encardido… Conte o que está acontecendo e a equipe da Clean
            Car responde. Não precisa saber o nome do serviço.
          </p>
          <div className="mt-8">
            <PerguntaForm />
          </div>
          <p className="mt-4 text-sm text-steel-line">
            Prefere ver antes? Veja <Link href="/problemas" className="text-verniz-shine underline underline-offset-2">problemas e soluções</Link> ou as{" "}
            <Link href="/faq" className="text-verniz-shine underline underline-offset-2">perguntas frequentes</Link>.
          </p>
        </section>

        {perguntas.length > 0 && (
          <section className="border-t border-card-line">
            <div className="mx-auto max-w-3xl px-6 py-16">
              <h2 className="font-display font-bold text-3xl text-steel mb-8">Perguntas respondidas</h2>
              <ul className="grid gap-4">
                {perguntas.map((p) => (
                  <li key={p.id}>
                    <Link href={`/perguntas/${p.slug}`} className="block rounded-2xl bg-card border border-card-line p-5 hover:border-verniz transition-colors">
                      <span className="block font-display font-bold text-lg text-steel">{tituloPergunta(p)}</span>
                      <span className="block mt-2 text-sm text-steel-line line-clamp-2">{p.resposta}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
      <WhatsappFloat />
    </>
  );
}
