"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client de navegador (chave anon) — usado só para registrar eventos de KPI
// (pageview, cliques). Respeita RLS: só consegue inserir em `events`.
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
