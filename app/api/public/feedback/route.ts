import { NextRequest, NextResponse } from "next/server";
import { createFeedbackSubmission } from "@/lib/ginza-db";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

// Sengaja TIDAK memakai requireProfile() di sini -- ini dibuat agar tamu
// (belum login) juga bisa kirim feedback/kuisioner selama masa percobaan,
// per permintaan eksplisit. Kalau kebetulan sedang login, user_id ikut
// dicatat (opsional) supaya bisa dihubungkan ke akun di panel Admin.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.HOMEPAGE_CHAT);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Terlalu banyak percobaan. Coba lagi sebentar lagi." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const message: string = (body.message || "").trim();
  if (!message) {
    return NextResponse.json({ error: "Pesan feedback wajib diisi." }, { status: 400 });
  }

  const profile = await getCurrentUserProfile().catch(() => null);

  try {
    const feedback = await createFeedbackSubmission({
      userId: profile?.id ?? null,
      name: body.name || profile?.display_name || null,
      email: body.email || profile?.email || null,
      category: body.category || "lainnya",
      rating: typeof body.rating === "number" ? body.rating : null,
      message,
      pageUrl: body.pageUrl || null,
    });
    return NextResponse.json({ ok: true, id: feedback.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengirim feedback." }, { status: 500 });
  }
}
