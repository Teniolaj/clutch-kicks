import "server-only";
import { createClient } from "@/lib/supabase/server";

// Returns the signed-in admin and their Supabase client, or throws.
// RLS enforces the same rule; this just fails early with a clear message.
export async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You are signed out. Sign in again.");

  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!data) throw new Error("This account doesn't have admin access.");

  return { supabase, user };
}

// For server actions: returns the admin's Supabase client, or throws.
export async function requireAdmin() {
  return (await getAdmin()).supabase;
}
