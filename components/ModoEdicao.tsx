"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Ativo só dentro da prévia do editor visual (iframe com ?editar=1).
// Destaca os blocos editáveis e, ao clicar num deles, avisa o editor (janela
// de cima) qual bloco abrir no painel lateral. Fora dos blocos, os links
// continuam navegando normalmente, sempre dentro da prévia.
export default function ModoEdicao() {
  const pathname = usePathname();

  useEffect(() => {
    const raiz = document.documentElement;
    if (!raiz.classList.contains("cc-editar")) return;

    const enviar = (msg: Record<string, unknown>) => window.parent.postMessage({ origem: "cc-previa", ...msg }, window.location.origin);

    const listar = () => {
      const vistos = new Set<string>();
      const blocos: { id: string; ancora?: string }[] = [];
      document.querySelectorAll<HTMLElement>("[data-editar]").forEach((el) => {
        const id = el.dataset.editar!;
        const chave = id + (el.dataset.ancora ?? "");
        if (vistos.has(chave)) return;
        vistos.add(chave);
        blocos.push({ id, ancora: el.dataset.ancora });
      });
      enviar({ tipo: "pagina", caminho: window.location.pathname, titulo: document.title, blocos });
    };
    listar();

    const aoClicar = (e: MouseEvent) => {
      const alvo = (e.target as HTMLElement).closest<HTMLElement>("[data-editar]");
      if (alvo) {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll(".cc-bloco-ativo").forEach((el) => el.classList.remove("cc-bloco-ativo"));
        alvo.classList.add("cc-bloco-ativo");
        enviar({ tipo: "editar", id: alvo.dataset.editar, ancora: alvo.dataset.ancora });
        return;
      }
      // Links externos (WhatsApp, Instagram) não saem da prévia
      const link = (e.target as HTMLElement).closest("a");
      if (link && link.host !== window.location.host) e.preventDefault();
    };
    document.addEventListener("click", aoClicar, true);

    const aoReceber = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.origem !== "cc-editor") return;
      if (e.data.tipo === "destacar") {
        const el = document.querySelector<HTMLElement>(
          `[data-editar="${e.data.id}"]${e.data.ancora ? `[data-ancora="${e.data.ancora}"]` : ""}`
        );
        if (el) {
          document.querySelectorAll(".cc-bloco-ativo").forEach((x) => x.classList.remove("cc-bloco-ativo"));
          el.classList.add("cc-bloco-ativo");
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };
    window.addEventListener("message", aoReceber);

    return () => {
      document.removeEventListener("click", aoClicar, true);
      window.removeEventListener("message", aoReceber);
    };
  }, [pathname]);

  return null;
}
