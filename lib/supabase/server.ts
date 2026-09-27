// Portal TC Surabaya — dibuat oleh Bang Ajiib (2026)
// Supabase client untuk dipakai di Server Components & Route Handlers.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Diabaikan dengan sengaja: dipanggil dari Server Component,
            // sesi tetap di-refresh lewat middleware.
          }
        },
      },
    }
  );
}

// Client dengan service role — HANYA dipakai di Route Handler tepercaya
// (mis. sync-sheet, admin bulk import). Jangan pernah diekspos ke client.
import { createClient as createServiceClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
