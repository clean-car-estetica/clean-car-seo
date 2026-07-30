import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/"], // Garante o bloqueio de todo o painel admin
      },
      {
        userAgent: ["Google-Extended", "GPTBot"],
        allow: "/",
      },
    ],
    sitemap: "https://clean-car-seo.vercel.app/sitemap.xml",
  };
}
