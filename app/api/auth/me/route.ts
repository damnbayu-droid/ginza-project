import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  // 1. Coba periksa JWT cookie internal (myai_session)
  const session = await getSession(req);
  if (session && session.email) {
    let name = session.email.split("@")[0];
    let role = session.role || "user";

    if (supabaseAdmin) {
      try {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("display_name, role")
          .eq("id", session.email)
          .maybeSingle();

        if (profile) {
          if (profile.display_name) name = profile.display_name;
          if (profile.role) role = profile.role;
        } else {
          const { data: gwUser } = await supabaseAdmin
            .from("gw_users")
            .select("role")
            .eq("email", session.email)
            .maybeSingle();
          if (gwUser?.role) role = gwUser.role;
        }
      } catch (e) {
        console.warn("[auth/me] Warning querying profile for JWT session:", e);
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.email,
        role,
        name,
        title: role.toUpperCase(),
      },
    });
  }

  // 2. Coba periksa Supabase Auth Server Session (Cookies PKCE / OAuth / Magic Link)
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user: sbUser } } = await supabase.auth.getUser();

    if (sbUser && sbUser.email) {
      let role = "user";
      let name =
        sbUser.user_metadata?.full_name ||
        sbUser.user_metadata?.name ||
        sbUser.email.split("@")[0] ||
        "Pengguna";

      if (supabaseAdmin) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("display_name, role")
          .eq("id", sbUser.id)
          .maybeSingle();

        if (profile?.role) role = profile.role;
        if (profile?.display_name) name = profile.display_name;
      }

      return NextResponse.json({
        authenticated: true,
        user: {
          email: sbUser.email,
          role,
          name,
          title: role.toUpperCase(),
        },
      });
    }
  } catch (e) {
    console.warn("[auth/me] Warning checking Supabase Auth session:", e);
  }

  return NextResponse.json({ authenticated: false, user: null });
}
