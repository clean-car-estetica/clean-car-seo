/** ID de medição do Google Analytics do site (a tag instalada nas páginas). */
export const GA_MEDICAO = "G-54H7DP2E49";

// Dispara eventos personalizados pro Google Analytics (GA4), além do nosso
// próprio painel (Supabase). São dois sistemas separados de propósito:
// o nosso é rápido e específico do negócio (por cidade/serviço/origem);
// o GA4 é o "canivete suíço" padrão do mercado, útil pra comparar com
// benchmarks e pra rodar campanhas de Google Ads no futuro.
export function gtagEvent(nome: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (typeof gtag === "function") {
    gtag("event", nome, params);
  }
}
