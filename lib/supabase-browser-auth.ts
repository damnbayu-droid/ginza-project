"use client";

/**
 * supabase-browser-auth.ts
 * Client Supabase Auth untuk komponen 'use client' (form login/daftar,
 * upload foto profil/KTP, dsb). Pakai anon key — aman di browser.
 */
import { createBrowserClient } from "@supabase/ssr";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export function getSupabaseBrowserClient() {
  return createBrowserClient(rawUrl, rawAnonKey);
}
