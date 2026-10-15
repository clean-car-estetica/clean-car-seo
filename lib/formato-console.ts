// Formatos de texto simples usados no console para editar listas sem
// formulário complicado (15/10/2026).

/** Seções: "## Título" seguido do texto, uma após a outra. */
export function secoesParaTexto(secoes: { titulo: string; texto: string }[]): string {
  return secoes.map((s) => `## ${s.titulo}\n${s.texto}`).join("\n\n");
}

export function textoParaSecoes(texto: string): { titulo: string; texto: string }[] {
  return texto
    .replace(/\r\n/g, "\n")
    .split(/\n(?=##\s)/)
    .map((parte) => {
      const m = parte.match(/^##\s+(.+)\n?([\s\S]*)$/);
      return m ? { titulo: m[1].trim(), texto: m[2].trim() } : null;
    })
    .filter((s): s is { titulo: string; texto: string } => Boolean(s && s.titulo && s.texto));
}

/** Perguntas: "P: ..." e "R: ..." em linhas seguidas; um par por bloco. */
export function perguntasParaTexto(perguntas: { pergunta: string; resposta: string }[]): string {
  return perguntas.map((p) => `P: ${p.pergunta}\nR: ${p.resposta}`).join("\n\n");
}

export function textoParaPerguntas(texto: string): { pergunta: string; resposta: string }[] {
  return texto
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((bloco) => {
      const m = bloco.trim().match(/^P:\s*([\s\S]+?)\nR:\s*([\s\S]+)$/i);
      return m ? { pergunta: m[1].trim(), resposta: m[2].trim().replace(/\n/g, " ") } : null;
    })
    .filter((p): p is { pergunta: string; resposta: string } => Boolean(p));
}
