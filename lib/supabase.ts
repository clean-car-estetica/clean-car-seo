import { createClient } from "@supabase/supabase-js";

// Client público — usa a chave anon, respeita RLS (só lê o que é público).
// Nunca importe SUPABASE_SERVICE_ROLE_KEY neste arquivo nem em código de cliente.
export const supabasePublico = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
