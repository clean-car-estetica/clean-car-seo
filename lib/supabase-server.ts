import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Client de sessão (login/logout do console admin) — roda no servidor,
// usa a chave anon + cookies do usuário logado. Respeita RLS normalmente.
export async function supabaseSessao() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // chamado de um Server Component sem permissão de escrita — ok, o middleware cuida do refresh
          }
        },
      },
    }
  );
}
