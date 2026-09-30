import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/server/db/types";

function url() {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  );
}

function key() {
  return (
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

let browserClient: ReturnType<typeof createClient<Database>> | undefined;

/** Browser Supabase client (anon key + Auth). Safe for client bundles. */
export function getBrowserSupabase() {
  if (browserClient) return browserClient;
  const u = url();
  const k = key();
  if (!u || !k) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
  }
  browserClient = createClient<Database>(u, k, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: typeof window !== "undefined" ? localStorage : undefined,
    },
  });
  return browserClient;
}
