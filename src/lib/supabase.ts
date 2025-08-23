import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Client-side Supabase instance (RLS-enforced)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Convenience helpers
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error("AUTH_REQUIRED");
  return session;
}
