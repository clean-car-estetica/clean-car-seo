export const dynamic = "force-dynamic";

import { getServicosPublicos, getCidadesPublicas } from "@/lib/site-data";
import Editor from "./Editor";

export const metadata = { title: "Editor do site | Clean Car" };

export default async function EditorPage() {
  const [servicos, cidades] = await Promise.all([getServicosPublicos(), getCidadesPublicas()]);
  return (
    <Editor
      servicos={servicos.map((s) => ({ slug: s.slug, nome: s.nome }))}
      cidades={cidades.map((c) => ({ slug: c.slug, nome: c.nome }))}
    />
  );
}
