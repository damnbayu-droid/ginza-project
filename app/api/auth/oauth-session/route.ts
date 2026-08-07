import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createSession } from "@/lib/auth";

/**
 * app/api/auth/oauth-session/route.ts
 * Endpoint untuk mencetak HTTP-only cookie `myai_session` setelah pengguna
 * berhasil diautentikasi lewat Supabase Auth Client (Implicit Flow / Google OAuth hash).
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name, avatarUrl } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    let userRole = "user";

    if (supabaseAdmin) {
      // 1. Cek role di gw_users
      const { data: gwUser } = await supabaseAdmin
        .from("gw_users")
        .select("role")
        .eq("email", email)
        .maybeSingle();

      if (gwUser?.role) {
        userRole = gwUser.role;
      } else {
        const adminEmail = process.env.ADMIN_EMAIL || "damnbayu@gmail.com";
        if (email.toLowerCase() === adminEmail.toLowerCase()) {
          userRole = "owner";
        }
      }
    }

    const redirectUrl =
      userRole === "admin" || userRole === "owner" || userRole === "developer"
        ? "/dashboard"
        : userRole === "verificator"
        ? "/verifikator"
        : "/u";

    const res = NextResponse.json({
      success: true,
      role: userRole,
      redirectUrl,
    });

    // MINT COOKIE `myai_session` HTTP-ONLY
    await createSession(res, { email, role: userRole });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal memproses sesi OAuth" },
      { status: 500 }
    );
  }
}
