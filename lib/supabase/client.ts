import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";

/**
 * Creates a browser-side Supabase client.
 * Safe to use in client components.
 */
export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return null;
  }

  try {
    return createBrowserClient(supabaseUrl, anonKey);
  } catch {
    return createSupabaseJsClient(supabaseUrl, anonKey);
  }
}
