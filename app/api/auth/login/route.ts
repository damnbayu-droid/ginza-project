import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { createSession } from "@/lib/auth";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const DEFAULT_ADMIN_EMAIL = "damnbayu@gmail.com";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";

  // ── Rate limit: 5 attempts per 15 minutes per IP ──────────────────────
  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.LOGIN);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Terlalu banyak percobaan login. Coba lagi dalam ${RATE_LIMITS.LOGIN.windowMinutes} menit.`,
      },
      {
        status: 429,
        headers: { "Retry-After": rateCheck.resetAt.toISOString() },
      }
    );
  }

  const { email, password } = await req.json();

  // ── Validate input ──────────────────────────────────────────────────────
  if (!email || !password) {
    return NextResponse.json(
      { error: "Email dan password wajib diisi." },
      { status: 400 }
    );
  }

  const inputEmail = email.trim().toLowerCase();
  const isAllowedEmail = 
    inputEmail === ADMIN_EMAIL || 
    inputEmail === DEFAULT_ADMIN_EMAIL ||
    inputEmail === "admin@mongondowpedia.com";

  // ── Check email ─────────────────────────────────────────────────────────
  if (!isAllowedEmail) {
    return NextResponse.json(
      { error: "Email atau password salah." },
      { status: 401 }
    );
  }

  // ── Password verification logic ─────────────────────────────────────────
  let dbHash = "";
  if (supabaseAdmin) {
    try {
      const { data: user } = await supabaseAdmin
        .from("gw_users")
        .select("password_hash")
        .eq("email", inputEmail)
        .maybeSingle();
      if (user?.password_hash) {
        dbHash = user.password_hash;
      }
    } catch (e) {
      console.warn("[auth/login] Supabase query warning:", e);
    }
  }

  const envPassword = process.env.ADMIN_PASSWORD || "";
  const envHash = process.env.ADMIN_PASSWORD_HASH || "";

  async function checkPasswordMatch(pwd: string, target: string): Promise<boolean> {
    if (!target) return false;
    if (target.startsWith("$2a$") || target.startsWith("$2b$")) {
      return await bcrypt.compare(pwd, target);
    }
    return pwd === target;
  }

  const matchesEnvHash = await checkPasswordMatch(password, envHash);
  const matchesEnvPlain = await checkPasswordMatch(password, envPassword);
  const matchesDb = await checkPasswordMatch(password, dbHash);

  const isValid = matchesEnvHash || matchesEnvPlain || matchesDb;

  if (!isValid) {
    await logAudit({ action: 'login_failed', actorEmail: inputEmail, targetType: 'auth', detail: { reason: 'wrong_password' }, ipAddress: ip });
    return NextResponse.json(
      { error: "Email atau password salah." },
      { status: 401 }
    );
  }

  // ── Auto-provision user in DB if missing ────────────────────────────────
  if (supabaseAdmin) {
    try {
      const { data: userRecord } = await supabaseAdmin
        .from("gw_users")
        .select("id")
        .eq("email", inputEmail)
        .maybeSingle();

      if (!userRecord) {
        const hashToInsert = envHash.startsWith("$2a$") ? envHash : bcrypt.hashSync(password, 10);
        await supabaseAdmin.from("gw_users").insert({
          email: inputEmail,
          password_hash: hashToInsert,
          role: "owner"
        });
        console.log(`[auth/login] Auto-created user record for ${inputEmail}`);
      }
    } catch (err) {
      console.error("[auth/login] Failed to auto-provision user:", err);
    }
  }

  // ── Create httpOnly session cookie ─────────────────────────────────────
  const res = NextResponse.json({
    success: true,
    user: { email: inputEmail, role: "owner", name: "Boss Bayu" },
  });

  await createSession(res, { email: inputEmail, role: "owner" });
  await logAudit({ action: 'login_success', actorEmail: inputEmail, targetType: 'auth', detail: {}, ipAddress: ip });
  return res;
}
