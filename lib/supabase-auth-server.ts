/**
 * supabase-auth-server.ts
 * Client Supabase Auth yang terikat ke cookie Next.js (Server Components,
 * Route Handlers) — mendukung dwisesi (Supabase Auth PKCE/OAuth & JWT Cookie myai_session).
 */
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { getServerSession } from "@/lib/auth";
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
          // dipanggil dari Server Component (read-only) — aman diabaikan
        }
      },
    },
  });
}

/**
 * Ambil user yang sedang login (server-side) + profile row-nya.
 * Mendukung dwisesi: Supabase Auth (PKCE/OAuth) & Internal JWT Session (myai_session).
 * Return null jika belum login.
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  if (!supabaseAdmin) return null;

  // 1. Coba periksa Supabase Auth Server Session (Cookies PKCE / OAuth / Magic Link)
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.email) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        return { ...profile, email: user.email } as Profile;
      }

      // Fallback profile jika record profiles belum terbuat
      return {
        id: user.id,
        role: "user",
        display_name: user.user_metadata?.full_name || user.email.split("@")[0] || "User",
        avatar_url: user.user_metadata?.avatar_url || null,
        bio: null,
        mongondow_score: 0,
        is_banned: false,
        banned_reason: null,
        banned_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: user.email,
      } as Profile;
    }
  } catch (e) {
    console.warn("[getCurrentUserProfile] Supabase auth check warning:", e);
  }

  // 2. Coba periksa JWT Session Internal (myai_session cookie dari /api/auth/login)
  try {
    const session = await getServerSession();
    if (session && session.email) {
      let role = session.role || "user";
      let displayName = session.email.split("@")[0];

      // Format nama tampilan yang lebih rapi untuk akun test
      if (session.email.includes("test.user")) displayName = "Test User";
      if (session.email.includes("test.verifikator")) displayName = "Test Verifikator";
      if (session.email.includes("developer")) displayName = "Developer MongondowPedia";
      if (session.email.includes("damnbayu")) displayName = "Boss Bayu";

      // Query database gw_users atau profiles jika tersedia
      const { data: gwUser } = await supabaseAdmin
        .from("gw_users")
        .select("id, role")
        .eq("email", session.email)
        .maybeSingle();

      if (gwUser?.role) {
        // Map role owner/developer ke admin jika diperlukan
        role = gwUser.role;
      }

      return {
        id: gwUser?.id || session.email,
        role: role === "owner" || role === "developer" ? "admin" : role,
        display_name: displayName,
        avatar_url: null,
        bio: null,
        mongondow_score: 100,
        is_banned: false,
        banned_reason: null,
        banned_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email: session.email,
      } as Profile;
    }
  } catch (e) {
    console.warn("[getCurrentUserProfile] JWT session check warning:", e);
  }

  return null;
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
  if (allowedRoles && !allowedRoles.includes(profile.role as any)) {
    return { profile: null, error: new Response(JSON.stringify({ error: "Tidak punya akses" }), { status: 403 }) };
  }
  return { profile, error: null };
}
