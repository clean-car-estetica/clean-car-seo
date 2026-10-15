// Seletor de duas posições (Rascunho | Publicado) para as listas do console.
// Cada lado é um botão de envio: um clique já salva, sem abrir o item.
export default function SeletorStatus({
  acao,
  chave,
  publicado,
}: {
  acao: (formData: FormData) => void | Promise<void>;
  chave: string;
  publicado: boolean;
}) {
  const base = "px-3 py-1 text-xs font-bold transition-colors";
  return (
    <form action={acao} className="inline-flex rounded-full border border-card-line overflow-hidden" role="group" aria-label="Status">
      <input type="hidden" name="slug" value={chave} />
      <button
        type="submit"
        name="status"
        value="rascunho"
        aria-pressed={!publicado}
        disabled={!publicado}
        className={`${base} ${!publicado ? "bg-steel-line/20 text-steel cursor-default" : "text-steel-line hover:bg-card"}`}
      >
        Rascunho
      </button>
      <button
        type="submit"
        name="status"
        value="publicado"
        aria-pressed={publicado}
        disabled={publicado}
        className={`${base} ${publicado ? "bg-ok/20 text-ok cursor-default" : "text-steel-line hover:bg-ok/10 hover:text-ok"}`}
      >
        Publicado
      </button>
    </form>
  );
}
