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
      { source: "/servicos/vitrificacao", destination: "/servicos/enceramento-tecnico", permanent: true },
      { source: "/servicos/vitrificacao/:cidade", destination: "/servicos/enceramento-tecnico/:cidade", permanent: true },
      { source: "/servicos/vitrificacao/:cidade/:bairro", destination: "/servicos/enceramento-tecnico/:cidade/:bairro", permanent: true },
      { source: "/servicos/ducha", destination: "/servicos/lavagem-bronze", permanent: true },
      { source: "/servicos/ducha/:cidade", destination: "/servicos/lavagem-bronze/:cidade", permanent: true },
      { source: "/servicos/ducha/:cidade/:bairro", destination: "/servicos/lavagem-bronze/:cidade/:bairro", permanent: true },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
