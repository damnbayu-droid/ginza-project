import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSession } from "@/lib/auth";

/**
 * app/auth/callback/route.ts
 * Callback standar Supabase Auth (PKCE) — dituju oleh `redirectTo` dari
 * `signInWithOAuth({ provider: 'google' })` di /akun/masuk & /login.
 *
 * Setelah sesi Supabase terbentuk, sinkronkan profil user dan buat HTTP-only
 * cookie `myai_session` via `createSession()`, lalu arahkan user ke portal yang sesuai:
 * owner / developer / admin -> /dashboard
 * verificator -> /verifikator
 * user -> /u
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

      if (user && user.email) {
        const displayName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email.split("@")[0] ||
          "User";
        const avatarUrl = user.user_metadata?.avatar_url || null;

        // Auto-provision user in gw_users if needed
        let userRole = "user";
        if (supabaseAdmin) {
          try {
            const { data: existingGwUser } = await supabaseAdmin
              .from("gw_users")
              .select("role")
              .eq("email", user.email)
              .maybeSingle();

            if (existingGwUser?.role) {
              userRole = existingGwUser.role;
            } else {
              // Cek role admin/owner dari env
              const adminEmail = process.env.ADMIN_EMAIL || "damnbayu@gmail.com";
              if (user.email.toLowerCase() === adminEmail.toLowerCase()) {
                userRole = "owner";
              }
            }

            // Cek dulu apakah profil sudah ada -- KALAU SUDAH, jangan timpa
            // display_name/avatar_url dgn data Google setiap login. Sebelumnya
            // upsert tanpa cek ini bikin foto & nama custom yg user simpan di
            // tab Profil hilang lagi tiap kali mereka login ulang (laporan Boss
            // Bayu: "tidak pernah ada foto yang bisa tampil dengan baik").
            const { data: existingProfile } = await supabaseAdmin
              .from("profiles")
              .select("id")
              .eq("id", user.id)
              .maybeSingle();

            if (existingProfile) {
              await supabaseAdmin
                .from("profiles")
                .update({ role: userRole, updated_at: new Date().toISOString() })
                .eq("id", user.id);
            } else {
              await supabaseAdmin.from("profiles").insert({
                id: user.id,
                display_name: displayName,
                avatar_url: avatarUrl,
                role: userRole,
              });
            }
          } catch (e) {
            console.warn("[auth/callback] Gagal sync profiles:", e);
          }
        }

        // Tentukan rute redirect berdasarkan role
        let targetRoute = next;
        if (userRole === "admin" || userRole === "owner" || userRole === "developer") {
          targetRoute = "/dashboard";
        } else if (userRole === "verificator") {
          targetRoute = "/verifikator";
        } else {
          targetRoute = "/u";
        }

        // BUAT SAKTI: Set HTTP-Only Cookie myai_session!
        const res = NextResponse.redirect(`${origin}${targetRoute}`);
        await createSession(res, { email: user.email, role: userRole });
        return res;
      }
    }
  }

  // Jika gagal, kembalikan ke /login dengan pesan ramah
  return NextResponse.redirect(`${origin}/login?error=oauth_gagal`);
}
