"use client";

import { createContext, useContext } from "react";
import { TEXTOS_PADRAO, type TextosGerais } from "@/lib/site-content";

const TextosContext = createContext<TextosGerais>(TEXTOS_PADRAO);

export function TextosProvider({ textos, children }: { textos: TextosGerais; children: React.ReactNode }) {
  return <TextosContext.Provider value={textos}>{children}</TextosContext.Provider>;
}

export function useTextos() {
  return useContext(TextosContext);
}
