import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serviços que saíram do catálogo: preserva o endereço antigo (e o Google) apontando para o mais próximo
  async redirects() {
    return [
      // Domínio próprio (07/10/2026): o endereço antigo da Vercel manda tudo
      // para cleancarestetica.com.br com 301, para o Google transferir o que
      // já conhece. /admin, /api e /auth ficam de fora (login do painel).
      {
        source: "/:path((?!admin|api|auth).*)",
        has: [{ type: "host", value: "clean-car-seo.vercel.app" }],
        destination: "https://cleancarestetica.com.br/:path",
        permanent: true,
      },
      // 08/10/2026: agenda online saiu do site — o agendamento é pelo WhatsApp (bot).
      { source: "/agendar-online", destination: "/contato", permanent: true },
      // Serviços com outro nome no passado → o equivalente de hoje
      { source: "/servicos/polimento", destination: "/servicos/enceramento-tecnico", permanent: true },
      { source: "/servicos/polimento/:cidade", destination: "/servicos/enceramento-tecnico/:cidade", permanent: true },
      { source: "/servicos/polimento/:cidade/:bairro", destination: "/servicos/enceramento-tecnico/:cidade/:bairro", permanent: true },
      { source: "/servicos/lavagem-chassi", destination: "/servicos/lavagem-ouro", permanent: true },
      { source: "/servicos/lavagem-chassi/:cidade", destination: "/servicos/lavagem-ouro/:cidade", permanent: true },
      { source: "/servicos/lavagem-chassi/:cidade/:bairro", destination: "/servicos/lavagem-ouro/:cidade/:bairro", permanent: true },
      { source: "/servicos/ducha", destination: "/servicos/lavagem-bronze", permanent: true },
      { source: "/servicos/ducha/:cidade", destination: "/servicos/lavagem-bronze/:cidade", permanent: true },
      { source: "/servicos/ducha/:cidade/:bairro", destination: "/servicos/lavagem-bronze/:cidade/:bairro", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [480, 768, 1080, 1440, 1920],
    minimumCacheTTL: 2678400,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lvxunawzyvdaqduyrqem.supabase.co" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
