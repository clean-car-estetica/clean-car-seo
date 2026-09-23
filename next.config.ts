import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serviços que saíram do catálogo: preserva o endereço antigo (e o Google) apontando para o mais próximo
  async redirects() {
    return [
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
