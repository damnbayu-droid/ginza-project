import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.GATEWAY_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawServiceKey = process.env.GATEWAY_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

function isValidUrl(urlStr?: string): boolean {
  if (!urlStr) return false;
  if (urlStr.includes("<") || urlStr.includes(">")) return false;
  try {
    const parsed = new URL(urlStr);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidKey(keyStr?: string): boolean {
  if (!keyStr) return false;
  if (keyStr.includes("<") || keyStr.includes(">")) return false;
  return keyStr.trim().length > 0;
}

const supabaseUrl = isValidUrl(rawUrl) ? rawUrl! : "";
const supabaseServiceRoleKey = isValidKey(rawServiceKey) ? rawServiceKey! : "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "[supabase-admin] Missing or invalid GATEWAY_SUPABASE_URL or GATEWAY_SUPABASE_SERVICE_ROLE_KEY. " +
    "Server will operate in degraded mode without persistent storage."
  );
}

/**
 * Server-side Supabase admin client.
 * Uses SERVICE_ROLE_KEY — bypasses RLS. NEVER expose to client.
 * All server API routes use this client.
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : null;

export const isSupabaseReady = !!supabaseAdmin;

