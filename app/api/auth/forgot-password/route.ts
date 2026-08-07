import { NextRequest, NextResponse } from "next/server";
import { renderEmailHtml } from "@/lib/email-templates";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabase";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = resendApiKey && !resendApiKey.includes("placeholder") ? new Resend(resendApiKey) : null;

const DEFAULT_ADMIN_EMAIL = "damnbayu@gmail.com";
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase();
const ALLOWED_RESET_EMAILS = new Set([ADMIN_EMAIL, DEFAULT_ADMIN_EMAIL, "admin@mongondowpedia.com", "developer@mongondowpedia.com", "indonesianvisas@gmail.com"]);

const GENERIC_RESPONSE = {
  success: true,
  message: "Jika email tersebut terdaftar di sistem MongondowPedia, instruksi pemulihan password telah dikirimkan ke email Anda.",
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

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

  try {
    let userFound = false;

    if (supabaseAdmin) {
      const { data: user } = await supabaseAdmin
        .from("gw_users")
        .select("id")
        .eq("email", inputEmail)
        .maybeSingle();

      if (user) {
        userFound = true;
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
    }

    if (ALLOWED_RESET_EMAILS.has(inputEmail)) {
      userFound = true;
    }

    // Send email via Resend if enabled
    if (resend && userFound) {
      try {
        const resetEmailHtml = renderEmailHtml({
          title: "Permintaan Pemulihan Kata Sandi",
          badge: "Keamanan Akun",
          bodyContent: `
            <p>Halo,</p>
            <p>Kami menerima permintaan pemulihan kata sandi untuk akun <strong>${inputEmail}</strong> di platform MongondowPedia.</p>
            <div style="background-color: #161822; border: 1px solid #232736; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0 0 6px 0; font-size: 13px; color: #cbd5e1; font-weight: bold;">Instruksi Pemulihan:</p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8;">Silakan hubungi administrator utama sistem di <strong>damnbayu@gmail.com</strong> atau <strong>developer@mongondowpedia.com</strong> untuk memverifikasi dan menyetel ulang kata sandi Anda.</p>
            </div>
            <p style="font-size: 12px; color: #64748b;">Jika Anda tidak pernah merasa meminta pemulihan kata sandi, abaikan email ini.</p>
          `,
          footerNote: "MongondowPedia Security • System Auth"
        });

        let sendRes = await resend.emails.send({
          from: "MongondowPedia Auth <onboarding@resend.dev>",
          to: [inputEmail],
          subject: "Instruksi Pemulihan Password — MongondowPedia",
          html: resetEmailHtml,
        });

        // Fallback for Resend test mode recipient limits
        if (sendRes.error && sendRes.error.message?.includes("testing emails")) {
          await resend.emails.send({
            from: "MongondowPedia Auth <onboarding@resend.dev>",
            to: ["cvtunasraya@gmail.com"],
            subject: `[Reset Password Request] untuk ${inputEmail}`,
            html: resetEmailHtml,
          });
        }
      } catch (emailErr) {
        console.warn("[auth/forgot-password] Resend email dispatch warning:", emailErr);
      }
    }
  } catch (err) {
    console.error("[auth/forgot-password] Failed to process reset:", err);
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
