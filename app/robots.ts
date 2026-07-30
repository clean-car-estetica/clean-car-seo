import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/"],
      },
      {
        userAgent: [
          "GPTBot",          // Treinamento OpenAI
          "OAI-SearchBot",    // Pesquisa em tempo real do ChatGPT
          "Google-Extended", // Treinamento Gemini / Google
          "PerplexityBot",   // Motor de busca Perplexity AI
          "ClaudeBot",       // IA Claude (Anthropic)
          "CCBot",           // Common Crawl (base de dados para várias IAs)
        ],
        allow: "/",
      },
    ],
    sitemap: "https://clean-car-seo.vercel.app/sitemap.xml",
  };
}
