import { NextRequest, NextResponse } from "next/server";
import { logMetricEvent } from "@/lib/ginza-db";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";

const ALLOWED_BUTTONS = new Set([
  "Kamus", "Knowledge", "Transliterasi", "Aksara", "Latihan", "Game",
  "Ecosystem", "Dashboard", "Pengaturan", "CTA Login", "CTA Feedback",
  "CTA Info", "Bogani AI Voice Mode",
]);

/**
 * Endpoint publik ringan utk mencatat klik tombol navigasi/CTA (Panel
 * Metrics admin, 2026-08-24) -- sengaja TANPA auth wajib (guest juga boleh
 * tercatat, supaya datanya benar2 real usage semua pengunjung, bukan cuma
 * user login) tapi tetap divalidasi ke whitelist nama tombol supaya kolom
 * target_text tidak bisa diisi sembarang teks bebas.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.HOMEPAGE_CHAT);
  if (!rateCheck.allowed) {
    return NextResponse.json({ success: false }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const button = typeof body?.button === "string" ? body.button : "";
  if (!ALLOWED_BUTTONS.has(button)) {
    return NextResponse.json({ error: "Tombol tidak dikenali" }, { status: 400 });
  }

  const profile = await getCurrentUserProfile().catch(() => null);
  await logMetricEvent({ type: "button_click", targetText: button, userId: profile?.id }).catch(() => {});

  return NextResponse.json({ success: true });
}
