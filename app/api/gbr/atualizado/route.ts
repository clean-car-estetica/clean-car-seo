import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TAG_GBR } from "@/lib/gbr-sync";

/**
 * Aviso do GBR SAS: "algo que o site mostra mudou" (22/10/2026).
 *
 * O banco do SAS chama esta rota na hora em que um serviço, o horário, o
 * leva e traz, uma campanha, um pacote ou a fidelidade é salvo (gatilho do
 * PATCH-63). Antes o site só via a mudança depois que o cache de 5 minutos
 * vencia — e ainda servia a versão velha na primeira visita.
 *
 * Senha: o SAS guarda só o SHA-256 da chave da API (api_addon.api_key_hash)
 * e o site guarda a chave. O aviso traz o hash; aqui calculamos o hash da
 * nossa chave e comparamos. Ninguém de fora conhece esse hash.
 *
 * Pior caso de abuso: forçar o site a buscar de novo no SAS — nada é
 * alterado nem exposto.
 */
export const dynamic = "force-dynamic";

const TAGS = [TAG_GBR, "campanhas", "pacotes"];

function iguais(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function POST(request: NextRequest) {
  const recebido = (request.headers.get("x-gbr-assinatura") || "").trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(recebido)) return Response.json({ ok: false }, { status: 401 });

  const { data } = await supabaseAdmin.from("gbr_integracao").select("api_key, ativo").eq("id", 1).maybeSingle();
  if (!data?.ativo || !data.api_key) return Response.json({ ok: false, motivo: "integração desligada" }, { status: 409 });

  const esperado = createHash("sha256").update(String(data.api_key)).digest("hex");
  if (!iguais(recebido, esperado)) return Response.json({ ok: false }, { status: 401 });

  // expire: 0 → a próxima visita já busca no SAS (sem servir o valor antigo)
  for (const tag of TAGS) revalidateTag(tag, { expire: 0 });
  revalidatePath("/", "layout");

  let origem = "";
  try { origem = String((await request.json())?.tabela || ""); } catch { /* corpo opcional */ }
  console.log(`[gbr/atualizado] cache do SAS renovado${origem ? ` (${origem})` : ""}`);
  return Response.json({ ok: true, renovado: TAGS, quando: new Date().toISOString() });
}
