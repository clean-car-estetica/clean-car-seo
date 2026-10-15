import Link from "next/link";
import { diasAte, situacaoCampanha, campanhaDeHoje, hojeSP, type CampanhaItem } from "@/lib/site-content";
import { dataCurta } from "@/lib/campanha";

// Lembrete das campanhas no topo do console: o que está no ar, quando acaba
// e qual é a próxima. Não deixa o site ficar sem campanha sem você saber.
export default function AvisoCampanha({ lista, compacto = false }: { lista: CampanhaItem[]; compacto?: boolean }) {
  const hoje = hojeSP();
  const atual = campanhaDeHoje(lista);
  const proxima = lista
    .filter((c) => situacaoCampanha(c, hoje) === "agendada")
    .sort((a, b) => (a.inicia_em ?? "").localeCompare(b.inicia_em ?? ""))[0];

  let cor = "border-card-line bg-card text-steel-line";
  let texto: string;
  if (atual.ativo) {
    const dias = diasAte(atual.termina_em);
    if (dias === null) {
      cor = "border-cera/50 bg-cera/10 text-cera";
      texto = `“${atual.titulo}” está no ar sem data de fim. Coloque o último dia para ela sair sozinha.`;
    } else if (dias <= 3 && !proxima) {
      cor = "border-cera/50 bg-cera/10 text-cera";
      texto = `“${atual.titulo}” termina ${dias === 0 ? "hoje" : dias === 1 ? "amanhã" : `em ${dias} dias`} e não há outra agendada. Programe a próxima.`;
    } else {
      cor = "border-ok/40 bg-ok/10 text-ok";
      texto = `No ar: “${atual.titulo}” até ${dataCurta(atual.termina_em)} (faltam ${dias} dia${dias === 1 ? "" : "s"}).`;
      if (proxima) texto += ` Próxima: “${proxima.titulo}” a partir de ${dataCurta(proxima.inicia_em)}.`;
    }
  } else if (proxima) {
    cor = "border-cera/50 bg-cera/10 text-cera";
    texto = `Nenhuma campanha no ar hoje. A próxima, “${proxima.titulo}”, entra em ${dataCurta(proxima.inicia_em)}.`;
  } else {
    cor = "border-warn/50 bg-warn/10 text-warn";
    texto = "Nenhuma campanha no ar nem agendada. Programe a próxima no SAS para o site não ficar sem promoção.";
  }

  return (
    <div className={`mb-6 max-w-4xl rounded-xl border px-4 py-3 text-sm flex flex-wrap items-center justify-between gap-3 ${cor}`}>
      <span>{texto}</span>
      {compacto && <Link href="/admin/campanha" className="font-bold underline underline-offset-2">Abrir campanhas</Link>}
    </div>
  );
}
