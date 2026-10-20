// 20/10/2026: resposta imediata ao abrir qualquer tela do console, enquanto o
// servidor busca os dados (antes a tela ficava parada até tudo chegar).
export default function Carregando() {
  const bloco = "rounded-2xl border border-card-line bg-card animate-pulse";
  return (
    <div className="grid gap-5 max-w-6xl" aria-busy="true">
      <div className="h-9 w-56 rounded-lg bg-card animate-pulse" />
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className={`${bloco} h-32`} />)}
      </div>
      <div className={`${bloco} h-72`} />
      <p className="sr-only">Carregando…</p>
    </div>
  );
}
