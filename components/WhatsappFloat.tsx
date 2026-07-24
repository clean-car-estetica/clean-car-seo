"use client";

import { whatsappLink } from "@/lib/config";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { usePathname } from "next/navigation";

export default function WhatsappFloat() {
  const pathname = usePathname();

  function registrarClique() {
    supabaseBrowser()
      .from("events")
      .insert({ event_type: "click_whatsapp", page_path: pathname })
      .then(() => {});
  }

  return (
    <a
      href={whatsappLink()}
      onClick={registrarClique}
      target="_blank"
      rel="noopener noreferrer"
      className="pulse-wa fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Falar no WhatsApp"
    >
      <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.9C21.96 6.45 17.5 2 12.04 2zm5.8 14.13c-.24.68-1.42 1.3-1.96 1.38-.5.08-1.13.11-1.83-.11-.42-.13-.96-.31-1.65-.6-2.9-1.25-4.8-4.16-4.94-4.35-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36.19 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.15.12.32.02.51-.1.19-.15.31-.29.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12.99 2.06 1.31 2.35 1.45.29.15.46.13.63-.08.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.14.27.1 1.68.79 1.97.94.29.14.48.21.55.33.08.12.08.68-.16 1.36z"/>
      </svg>
    </a>
  );
}
