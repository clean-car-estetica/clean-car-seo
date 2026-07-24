"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { parseRota } from "@/lib/track";

export default function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const { service_slug, city_slug } = parseRota(pathname);
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "pageview", page_path: pathname, service_slug, city_slug })
      .then(() => {});
  }, [pathname]);

  return null;
}
