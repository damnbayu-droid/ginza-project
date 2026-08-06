import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * app/auth/callback/route.ts
 * Callback standar Supabase Auth (PKCE) — dituju oleh `redirectTo` dari
 * `signInWithOAuth({ provider: 'google' })` di /akun/masuk & /login.
 * Tanpa route ini, tombol "Login with Google" akan redirect balik ke sini
 * tapi codenya tidak pernah ditukar jadi sesi (session tetap kosong).
 *
 * Setelah sesi terbentuk, arahkan user sesuai role profile-nya:
 * admin -> /dashboard (sistem admin lama tetap terpisah, lihat lib/auth.ts),
 * verificator -> /verifikator, user biasa -> /u.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/u";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      let redirectTo = next;

      if (user && supabaseAdmin) {
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";
        const avatarUrl = user.user_metadata?.avatar_url || null;

        // Otomatis simpan & sinkronkan profil user OAuth ke tabel profiles / User Management Dashboard
        try {
          await supabaseAdmin.from("profiles").upsert(
            {
              id: user.id,
              display_name: displayName,
              avatar_url: avatarUrl,
              role: "user",
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id", ignoreDuplicates: false }
          );
        } catch (e) {
          console.warn("[auth/callback] Gagal autosync profiles:", e);
        }

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role === "admin") redirectTo = "/dashboard";
        else if (profile?.role === "verificator") redirectTo = "/verifikator";
      }

      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_gagal`);
}
