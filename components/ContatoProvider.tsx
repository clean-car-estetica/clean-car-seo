"use client";

import { createContext, useContext } from "react";
import { CONTATO_PADRAO, type Contato } from "@/lib/config";

const ContatoContext = createContext<Contato>(CONTATO_PADRAO);

export function ContatoProvider({ contato, children }: { contato: Contato; children: React.ReactNode }) {
  return <ContatoContext.Provider value={contato}>{children}</ContatoContext.Provider>;
}

export function useContato() {
  return useContext(ContatoContext);
}
