import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // Serviço "Ducha" virou a Lavagem Bronze (mesmo serviço, outro nome).
      // Todas as variações vão direto ao destino final, sem cadeia de redirect.
      { source: "/servicos/ducha", destination: "/servicos/lavagem-bronze", permanent: true },
      { source: "/servicos/ducha/:path*", destination: "/servicos/lavagem-bronze", permanent: true },
      // 15/10/2026: lavagem de chassi, polimento e vitrificação NÃO são feitos.
      // Não redirecionam mais para outro serviço — respondem 410 (ver proxy.ts).
    ];
  },
  // A arte de compartilhamento (opengraph-image) lê fontes e fotos do disco
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/og/**", "./public/midia/*.jpg"],
    "/servicos/[servico]/opengraph-image": ["./assets/og/**", "./public/midia/*.jpg"],
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
