/**
 * supabase-auth-server.ts
 * Client Supabase Auth yang terikat ke cookie Next.js (Server Components,
 * Route Handlers) — dipakai untuk sesi login publik User & Verifikator
 * (BUKAN login admin/owner yang di lib/auth.ts, itu sistem terpisah).
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import type { Profile } from "@/lib/ginza-db";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(rawUrl || "", rawAnonKey || "", {
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
          // dipanggil dari Server Component (read-only) — aman diabaikan,
          // refresh token akan di-set ulang lewat middleware/route handler.
        }
      },
    },
  });
}

/**
 * Ambil user Supabase Auth yang sedang login (server-side) + profile row-nya.
 * Return null kalau belum login.
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  if (!supabaseAdmin) return null;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return null;
  return { ...profile, email: user.email ?? undefined } as Profile;
}

/**
 * Wajibkan role tertentu — lempar Response 401/403 kalau tidak sesuai.
 * Dipakai di awal Route Handler API.
 */
export async function requireProfile(allowedRoles?: Array<"user" | "verificator" | "admin">) {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    return { profile: null, error: new Response(JSON.stringify({ error: "Belum login" }), { status: 401 }) };
  }
  if (profile.is_banned) {
    return { profile: null, error: new Response(JSON.stringify({ error: "Akun diblokir" }), { status: 403 }) };
  }
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return { profile: null, error: new Response(JSON.stringify({ error: "Tidak punya akses" }), { status: 403 }) };
  }
  return { profile, error: null };
}
