export const dynamic = "force-dynamic";

import { getTema } from "@/lib/site-content";
import { salvarTema } from "./actions";
import CampoCor from "@/components/CampoCor";

const CAMPOS: { nome: keyof Awaited<ReturnType<typeof getTema>>; label: string; ajuda: string }[] = [
  { nome: "carbon", label: "Fundo principal", ajuda: "Cor de fundo do site inteiro" },
  { nome: "carbonSoft", label: "Fundo secundário", ajuda: "Seções alternadas (levemente diferente do fundo principal)" },
  { nome: "card", label: "Fundo dos cartões", ajuda: "Cards de serviço, FAQ, etc." },
  { nome: "cardLine", label: "Bordas", ajuda: "Contorno dos cartões e divisórias" },
  { nome: "verniz", label: "Cor de destaque", ajuda: "Botões, links, títulos em destaque" },
  { nome: "vernizShine", label: "Destaque (hover/brilho)", ajuda: "Tom mais claro da cor de destaque" },
  { nome: "cera", label: "Cor secundária (selo)", ajuda: "Selo Vonixx, avisos" },
];

export default async function TemaAdminPage() {
  const tema = await getTema();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Tema (cores)</h1>
      <p className="text-steel-line text-sm mb-6">
        Muda a paleta de cores do site inteiro. Clica na amostra pra abrir o seletor de cor.
      </p>

      <form action={salvarTema} className="bg-card border border-card-line rounded-2xl p-6 grid gap-4 max-w-xl">
        {CAMPOS.map((c) => (
          <CampoCor key={c.nome} nome={c.nome} valorInicial={tema[c.nome]} label={c.label} ajuda={c.ajuda} />
        ))}
        <button type="submit" className="justify-self-start rounded-full bg-verniz text-carbon font-display font-bold px-6 py-2 text-sm hover:bg-verniz-shine mt-2">
          Salvar tema
        </button>
      </form>
    </div>
  );
}
