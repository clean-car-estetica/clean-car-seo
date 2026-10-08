// Marca um pedaço da página como "editável" no editor visual do console.
// Fora do editor não muda nada: é só uma <div> com dois atributos.
export default function Bloco({
  id,
  ancora,
  className,
  children,
}: {
  /** Chave do bloco (ver lib/editor-blocos.ts). */
  id: string;
  /** Item específico dentro da tela de edição (ex.: o slug do serviço). */
  ancora?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-editar={id} data-ancora={ancora} className={className}>
      {children}
    </div>
  );
}
