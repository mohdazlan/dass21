import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-component Supabase client (reads the auth session from cookies).
 * Cookie writes are a no-op here — token refresh is handled by middleware.ts.
 * Returns null when env vars are absent so pages can render a setup notice
 * instead of crashing.
 */
export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server Components cannot write cookies; middleware refreshes the
        // session before requests reach this client.
      },
    },
  });
}
