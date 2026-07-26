import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.GATEWAY_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.GATEWAY_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
const supabaseAnonKey = isValidKey(rawAnonKey) ? rawAnonKey! : "";

/**
 * Browser-side Supabase client (anon key).
 * Used only for client components that need direct Supabase access.
 * Most data fetching goes through Next.js API routes instead.
 */
export const supabaseClient = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

