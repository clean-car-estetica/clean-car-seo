import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sincronizarAvaliacoes } from "@/lib/avaliacoes-google";

export const dynamic = "force-dynamic";

// Rodado todo dia pela Vercel (vercel.json → crons). A Vercel manda
// "Authorization: Bearer <CRON_SECRET>".
export async function GET(req: Request) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo || req.headers.get("authorization") !== `Bearer ${segredo}`) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const r = await sincronizarAvaliacoes();
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: (e as Error).message }, { status: 500 });
  }
}
