import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const hasSupabase = Boolean(url && anonKey);

let readClient: SupabaseClient | null = null;
let writeClient: SupabaseClient | null = null;

/** Read-only client (anon key; RLS allows reading published rows only). */
export function supabaseRead(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  readClient ??= createClient(url, anonKey, { auth: { persistSession: false } });
  return readClient;
}

/** Server-only write client (service-role key). Never import into client components. */
export function supabaseWrite(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  writeClient ??= createClient(url, serviceKey, { auth: { persistSession: false } });
  return writeClient;
}
