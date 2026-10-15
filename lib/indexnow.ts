import { SITE_URL } from "@/lib/config";

// IndexNow (15/10/2026): avisa Bing, Yandex e outros buscadores na hora em
// que uma página é publicada ou tirada do ar. O Bing também alimenta a busca
// do ChatGPT e do Copilot. O Google não usa IndexNow: para ele, o sitemap e o
// "Solicitar indexação" do Search Console.
// A chave fica pública em /8726295e42190f7dcfe1b26e1e76b6c8.txt (exigência do protocolo).
const CHAVE = "8726295e42190f7dcfe1b26e1e76b6c8";

export async function avisarIndexNow(caminhos: string[]) {
  const urlList = caminhos.map((c) => (c.startsWith("http") ? c : `${SITE_URL}${c}`));
  if (urlList.length === 0) return;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4000);
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: CHAVE,
        keyLocation: `${SITE_URL}/${CHAVE}.txt`,
        urlList,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(t);
  } catch {
    // Aviso é só um atalho: se falhar, o sitemap cobre.
  }
}
