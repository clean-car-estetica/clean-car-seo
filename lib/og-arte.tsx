import { ImageResponse } from "next/og";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";

// Arte que aparece quando alguém compartilha um link do site (WhatsApp,
// Instagram, Facebook). 08/10/2026: foto real à direita, marca e chamada à
// esquerda, nas cores e fontes do site.

export const TAMANHO_ARTE = { width: 1200, height: 630 };
export const FOTO_ARTE_PADRAO = "/midia/lavagem-volvo-espaco.jpg";

const COR = { fundo: "#05070c", cartao: "#0f131c", linha: "#1d2433", azul: "#2bb3cf", azulClaro: "#6fd0e3", dourado: "#d9a441" };

const lerFonte = (arquivo: string) => readFile(join(process.cwd(), "assets", "og", arquivo));
const lerMidia = (arquivo: string) => readFile(join(process.cwd(), "public", "midia", basename(arquivo)));

async function fontes() {
  const [b700, b800, i500, i600] = await Promise.all([
    lerFonte("barlow-condensed-latin-700-normal.woff"),
    lerFonte("barlow-condensed-latin-800-normal.woff"),
    lerFonte("inter-latin-500-normal.woff"),
    lerFonte("inter-latin-600-normal.woff"),
  ]);
  return [
    { name: "Barlow", data: b700, weight: 700 as const, style: "normal" as const },
    { name: "Barlow", data: b800, weight: 800 as const, style: "normal" as const },
    { name: "Inter", data: i500, weight: 500 as const, style: "normal" as const },
    { name: "Inter", data: i600, weight: 600 as const, style: "normal" as const },
  ];
}

/** Foto local (/midia/...) vira data URL; foto externa é baixada aqui para falhar com elegância. */
async function carregarFoto(src: string): Promise<string> {
  try {
    if (src.startsWith("/midia/")) {
      const b64 = (await lerMidia(src)).toString("base64");
      return `data:image/jpeg;base64,${b64}`;
    }
    const r = await fetch(src, { cache: "force-cache" });
    if (!r.ok) throw new Error(String(r.status));
    const tipo = r.headers.get("content-type") || "image/jpeg";
    return `data:${tipo};base64,${Buffer.from(await r.arrayBuffer()).toString("base64")}`;
  } catch {
    if (src === FOTO_ARTE_PADRAO) throw new Error("foto padrão da arte não encontrada");
    return carregarFoto(FOTO_ARTE_PADRAO);
  }
}

type Arte = {
  /** Linha pequena em azul no topo */
  chamada: string;
  /** Título grande; na página inicial é a marca */
  titulo: string;
  /** Segunda linha do título (branca) e destaque em dourado */
  subtitulo?: string;
  destaque?: string;
  selos: string[];
  foto?: string | null;
  marca?: boolean;
};

/** "Tratamento Anti-Odor / Purificação" → "Tratamento Anti-Odor" (cabe melhor na arte). */
export function nomeCurto(nome: string) {
  return nome.split(/\s+[\/—–-]\s+/)[0].trim();
}

// JPEG porque o PNG sai com ~750 KB e o WhatsApp às vezes ignora imagem pesada.
export async function gerarArte(a: Arte): Promise<Response> {
  const png = await (await desenharArte(a)).arrayBuffer();
  const jpg = await sharp(Buffer.from(png)).jpeg({ quality: 84, progressive: true, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}

async function desenharArte(a: Arte) {
  const [foto, fonts] = await Promise.all([carregarFoto(a.foto || FOTO_ARTE_PADRAO), fontes()]);
  const tamTitulo = a.marca ? 136 : a.titulo.length > 22 ? 70 : a.titulo.length > 15 ? 84 : 100;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: COR.fundo, fontFamily: "Inter", color: "#eef0f3" }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={foto} width={700} height={630} style={{ position: "absolute", right: 0, top: 0, width: 700, height: 630, objectFit: "cover", objectPosition: "30% 70%" }} />
        <div
          style={{
            position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex",
            backgroundImage: `linear-gradient(90deg, ${COR.fundo} 0%, ${COR.fundo} 47%, rgba(5,7,12,0.9) 55%, rgba(5,7,12,0.45) 66%, rgba(5,7,12,0.08) 80%, rgba(5,7,12,0) 90%)`,
          }}
        />
        <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex", backgroundImage: "linear-gradient(0deg, rgba(5,7,12,0.55) 0%, rgba(5,7,12,0) 30%)" }} />
        <div style={{ position: "absolute", left: -180, top: -220, width: 640, height: 640, borderRadius: 999, display: "flex", backgroundImage: "radial-gradient(circle, rgba(43,179,207,0.2), rgba(43,179,207,0) 65%)" }} />

        <div style={{ position: "absolute", left: 72, top: 64, width: 660, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", fontWeight: 600, fontSize: 20, letterSpacing: 3.6, textTransform: "uppercase", color: COR.azulClaro }}>
            <div style={{ display: "flex", width: 44, height: 2, background: COR.azul, marginRight: 14 }} />
            {a.chamada}
          </div>
          {a.marca ? (
            <div style={{ display: "flex", fontFamily: "Barlow", fontWeight: 800, fontSize: tamTitulo, lineHeight: 0.86, marginTop: 22 }}>
              <span>CLEAN</span>
              <span style={{ color: COR.azul, marginLeft: 30 }}>CAR</span>
            </div>
          ) : (
            <div style={{ display: "flex", fontFamily: "Barlow", fontWeight: 800, fontSize: tamTitulo, lineHeight: 0.92, marginTop: 22, textTransform: "uppercase" }}>
              {a.titulo}
            </div>
          )}
          {(a.subtitulo || a.destaque) && (
            <div style={{ display: "flex", flexDirection: "column", fontFamily: "Barlow", fontWeight: 700, fontSize: 50, lineHeight: 1.02, marginTop: 22, color: "#fff" }}>
              {a.subtitulo && <span>{a.subtitulo}</span>}
              {a.destaque && <span style={{ color: COR.dourado }}>{a.destaque}</span>}
            </div>
          )}
          <div style={{ display: "flex", marginTop: 30 }}>
            {a.selos.map((s) => (
              <div key={s} style={{ display: "flex", fontSize: 19, fontWeight: 600, padding: "10px 18px", borderRadius: 999, border: `1.5px solid ${COR.linha}`, background: "rgba(15,19,28,0.9)", color: "#dfe5ee", marginRight: 12 }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", left: 72, bottom: 52, display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", fontFamily: "Barlow", fontWeight: 700, fontSize: 28, letterSpacing: 0.6, textTransform: "uppercase", padding: "13px 30px", borderRadius: 999, background: COR.dourado, color: COR.fundo }}>
            Agende pelo WhatsApp
          </div>
          <div style={{ display: "flex", fontSize: 21, fontWeight: 500, color: "#9aa6b8", marginLeft: 22 }}>cleancarestetica.com.br</div>
        </div>
      </div>
    ),
    { ...TAMANHO_ARTE, fonts }
  );
}
