"use client";

import { createContext, useContext } from "react";
import { PROMOCOES_PADRAO, type Promocao } from "@/lib/site-content";

type Promocoes = Record<"cupom" | "indicacao", Promocao>;

const PromoContext = createContext<Promocoes>(PROMOCOES_PADRAO);

export function PromoProvider({ promocoes, children }: { promocoes: Promocoes; children: React.ReactNode }) {
  return <PromoContext.Provider value={promocoes}>{children}</PromoContext.Provider>;
}

export function usePromocoes() {
  return useContext(PromoContext);
}
