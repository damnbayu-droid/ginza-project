import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const DEFAULT_ADMIN_EMAIL = "damnbayu@gmail.com";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
const ALLOWED_RESET_EMAILS = new Set([ADMIN_EMAIL, DEFAULT_ADMIN_EMAIL, "admin@mongondowpedia.com"]);

// Generic response used for both "not allowed" and "success" cases so the
// endpoint never confirms/denies which emails exist in the system.
const GENERIC_RESPONSE = {
  success: true,
  message:
    "Jika email tersebut terdaftar sebagai admin, password telah direset. Hubungi pemilik sistem untuk kredensial baru.",
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  // ── Strict rate limit: 1 attempt per hour per IP ──────────────────────
  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.FORGOT_PASSWORD);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak permintaan. Coba lagi setelah ${rateCheck.resetAt.toISOString()}.` },
      { status: 429, headers: { "Retry-After": rateCheck.resetAt.toISOString() } }
    );
  }

  const { email } = await req.json().catch(() => ({ email: undefined }));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email wajib diisi." }, { status: 400 });
  }

  const inputEmail = email.trim().toLowerCase();

  // ── Only the admin allowlist can trigger a reset — never an arbitrary
  //    email pulled from gw_users, and never revealed via the response. ──
  if (!ALLOWED_RESET_EMAILS.has(inputEmail) || !supabaseAdmin) {
    return NextResponse.json(GENERIC_RESPONSE);
  }

  try {
    const { data: user } = await supabaseAdmin
      .from("gw_users")
      .select("id")
      .eq("email", inputEmail)
      .maybeSingle();

    if (user) {
      // Invalidate the DB password hash with an unguessable random value.
      // The owner is never locked out: login also accepts ADMIN_PASSWORD /
      // ADMIN_PASSWORD_HASH from env as a fallback credential (see lib auth
      // route), so this only revokes the DB-stored password, it doesn't
      // hand a new one to whoever called this endpoint.
      const randomPassword = randomBytes(24).toString("base64url");
      const hash = bcrypt.hashSync(randomPassword, 10);

      await supabaseAdmin.from("gw_users").update({ password_hash: hash }).eq("id", user.id);
      await logAudit({
        action: "password_reset",
        actorEmail: inputEmail,
        targetType: "auth",
        targetId: user.id,
        detail: { reason: "forgot_password_endpoint" },
        ipAddress: ip,
      });
    }
  } catch (err) {
    console.error("[auth/forgot-password] Failed to process reset:", err);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
