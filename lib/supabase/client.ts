import { createBrowserClient } from "@supabase/ssr";

// Browser client (anon key). Used by client components, e.g. admin image uploads.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
