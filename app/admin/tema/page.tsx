export const dynamic = "force-dynamic";

import { getTema } from "@/lib/site-content";
import { salvarTema } from "./actions";
import FormTema from "@/components/FormTema";

export default async function TemaAdminPage() {
  const tema = await getTema();

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-steel mb-1">Tema (cores)</h1>
      <p className="text-steel-line text-sm mb-6">
        Muda as cores do site inteiro. Escolha um pronto ou ajuste cada cor, depois clique em Salvar cores.
      </p>
      <FormTema inicial={tema} salvar={salvarTema} />
    </div>
  );
}
