import Link from "next/link";
import { diasParaFim, type Campanha } from "@/lib/site-content";
import { validadeCampanha } from "@/lib/campanha";

// Lembrete da campanha no topo do console: não deixa esquecer de trocar.
export default function AvisoCampanha({ campanha: c, compacto = false }: { campanha: Campanha; compacto?: boolean }) {
  const dias = diasParaFim(c.termina_em);
  let cor = "border-card-line bg-card text-steel-line";
  let texto: string;
  if (c.vencida && c.ligada) {
    cor = "border-warn/50 bg-warn/10 text-warn";
    texto = `A campanha “${c.titulo}” terminou e já saiu do site sozinha. Que tal cadastrar a próxima?`;
  } else if (!c.ligada) {
    texto = "Nenhuma campanha no ar. Cadastre uma para aparecer no topo da página inicial e no pop-up.";
  } else if (dias === null) {
    cor = "border-cera/50 bg-cera/10 text-cera";
    texto = `“${c.titulo}” está no ar sem data de fim. Coloque o último dia para ela sair sozinha.`;
  } else if (dias <= 3) {
    cor = "border-cera/50 bg-cera/10 text-cera";
    texto = `“${c.titulo}” termina ${dias === 0 ? "hoje" : dias === 1 ? "amanhã" : `em ${dias} dias`} (${validadeCampanha(c.termina_em).replace("Válido até ", "")}). Já pense na próxima.`;
  } else {
    cor = "border-ok/40 bg-ok/10 text-ok";
    texto = `“${c.titulo}” está no ar. ${validadeCampanha(c.termina_em)} (faltam ${dias} dias).`;
  }
  return (
    <div className={`mb-6 max-w-4xl rounded-xl border px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-3 ${cor}`}>
      <span>{texto}</span>
      {compacto && <Link href="/admin/campanha" className="font-bold underline underline-offset-2">Abrir campanha</Link>}
    </div>
  );
}
