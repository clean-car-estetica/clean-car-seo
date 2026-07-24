"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function PageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "pageview", page_path: pathname })
      .then(() => {});
  }, [pathname]);

  return null;
}
