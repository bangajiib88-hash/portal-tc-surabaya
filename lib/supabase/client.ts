// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
// Supabase client untuk dipakai di Client Components ("use client").
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
