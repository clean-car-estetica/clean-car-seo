// 18/10/2026: o mesmo "por onde veio" para as três fontes do painel.
// O site anota a origem pelo referrer ("Google (orgânico)", "Instagram"...)
// e o Analytics pela sessionSource ("google", "l.instagram.com"...). As duas
// caem nos mesmos canais aqui, para dar para comparar lado a lado.

export type Canal = "google" | "bing" | "instagram" | "facebook" | "whatsapp" | "ia" | "direto" | "outros";

export const CANAIS_ORDEM: Canal[] = ["google", "instagram", "facebook", "whatsapp", "bing", "ia", "direto", "outros"];

export const NOME_CANAL: Record<Canal, string> = {
  google: "Google",
  bing: "Bing",
  instagram: "Instagram",
  facebook: "Facebook",
  whatsapp: "WhatsApp (link compartilhado)",
  ia: "ChatGPT e outras IAs",
  direto: "Direto (link salvo ou digitado)",
  outros: "Outros sites",
};

function porTexto(t: string): Canal | null {
  if (/google/.test(t)) return "google";
  if (/bing/.test(t)) return "bing";
  if (/instagram/.test(t)) return "instagram";
  if (/facebook|fb\.com|\bfb\b/.test(t)) return "facebook";
  if (/whatsapp|wa\.me/.test(t)) return "whatsapp";
  if (/chatgpt|openai|perplexity|gemini|copilot|claude/.test(t)) return "ia";
  return null;
}

/** Origem anotada pelo próprio site → canal. */
export function canalDoSite(origem: string | null | undefined): Canal {
  const t = String(origem || "").toLowerCase().trim();
  if (!t || t === "direto" || t === "navegação interna" || t === "desconhecida") return "direto";
  return porTexto(t) ?? "outros";
}

/** sessionSource do Google Analytics → canal. */
export function canalDoAnalytics(source: string | null | undefined): Canal {
  const t = String(source || "").toLowerCase().trim();
  if (!t || t === "(direct)" || t === "(not set)") return "direto";
  return porTexto(t) ?? "outros";
}
