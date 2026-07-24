import { createClient } from "@supabase/supabase-js";

/**
 * Cliente com a chave service_role — ignora TODAS as regras de segurança (RLS).
 * NUNCA importar este arquivo em um componente de cliente ("use client") nem
 * expor SUPABASE_SERVICE_ROLE_KEY para o navegador. Só em Server Components,
 * Server Actions e Route Handlers do console /admin.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
