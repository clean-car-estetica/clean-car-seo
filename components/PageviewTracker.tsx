"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { parseRota, obterOrigem, registrarEvento } from "@/lib/track";

export default function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const { service_slug, city_slug } = parseRota(pathname);
    const origem = obterOrigem();
    registrarEvento("pageview", pathname, { service_slug, city_slug, origem });
  }, [pathname]);

  return null;
}
