import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

/**
 * Kontrol pemakaian AI: batas harian utk tamu (belum login) & User biasa,
 * tanpa batas utk verifikator & admin. Dipakai bersama oleh
 * app/api/homepage/chat/route.ts (chat Bogani AI) dan
 * app/api/kamus/ai-define/route.ts (tombol AI definisi Kamus).
 *
 * Kebal Refresh, Kebal Incognito, & Kebal Hapus Storage:
 * Identitas tamu diikat pada kombinasi Cookie HttpOnly (mp_guest_id) + SHA256 Hash IP Address
 * -- tidak bisa disiasati dgn Incognito/hapus cookie. TAPI kuotanya reset tiap 24 jam
 * (window_started_at di tabel guest_usage), bukan seumur hidup.
 */

export const GUEST_QUESTION_LIMIT = 15;
export const USER_DAILY_QUESTION_LIMIT = 45;
export const GUEST_COOKIE_NAME = "mp_guest_id";
const GUEST_WINDOW_MS = 24 * 60 * 60 * 1000;
const UNLIMITED_ROLES = new Set(["admin", "verificator", "developer", "vip", "owner"]);

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  message?: string;
}

/** Hash IP address dengan SHA256 untuk privasi & konsistensi pengikatan server-side */
export function hashIpAddress(ip: string): string {
  const cleanIp = ip.split(",")[0].trim() || "127.0.0.1";
  return crypto.createHash("sha256").update(`mongondow_salt_${cleanIp}`).digest("hex").slice(0, 32);
}

/** Ambil atau generate guest_id dari cookie. */
export function getOrCreateGuestId(cookieHeader: string | null): { guestId: string; isNew: boolean } {
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${GUEST_COOKIE_NAME}=([0-9a-fA-F-]{36})`));
    if (match) return { guestId: match[1], isNew: false };
  }
  return { guestId: crypto.randomUUID(), isNew: true };
}

/** Tempel/refresh cookie guest_id (1 tahun) ke response (Response/NextResponse). */
export function setGuestCookieHeader(res: Response, guestId: string): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.headers.append(
    "Set-Cookie",
    `${GUEST_COOKIE_NAME}=${guestId}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax; HttpOnly${secure}`
  );
}

/** true kalau window 24 jam sejak windowStartedAt sudah lewat -- kuota dianggap 0/reset. */
function isGuestWindowExpired(windowStartedAt: string | null | undefined): boolean {
  if (!windowStartedAt) return true;
  return Date.now() - new Date(windowStartedAt).getTime() >= GUEST_WINDOW_MS;
}

/**
 * Cek kuota tamu berdasarkan guest_id DAN IP Hash (server-side).
 * Kebal Incognito & Hapus Cookie karena jika cookie hilang, server tetap mengenali IP Hash-nya!
 * Kuota reset otomatis tiap 24 jam (lihat window_started_at).
 */
export async function checkGuestQuota(guestId: string, rawIp: string = "127.0.0.1"): Promise<QuotaCheckResult> {
  if (!supabaseAdmin) return { allowed: true, remaining: GUEST_QUESTION_LIMIT };
  const ipHash = hashIpAddress(rawIp);

  try {
    // 1. Cek berdasarkan guest_id terlebih dahulu
    const { data: byGuestId } = await supabaseAdmin
      .from("guest_usage")
      .select("question_count, window_started_at")
      .eq("guest_id", guestId)
      .maybeSingle();

    let used = byGuestId && !isGuestWindowExpired(byGuestId.window_started_at) ? byGuestId.question_count ?? 0 : 0;

    // 2. Jika cookie baru/hilang (misal di Incognito), cek fallback berdasarkan ip_address
    if (used === 0) {
      const { data: byIp } = await supabaseAdmin
        .from("guest_usage")
        .select("question_count, window_started_at")
        .eq("ip_address", ipHash)
        .maybeSingle();
      if (byIp && !isGuestWindowExpired(byIp.window_started_at)) {
        used = byIp.question_count ?? 0;
      }
    }

    if (used >= GUEST_QUESTION_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        message: `Anda sudah menggunakan jatah ${GUEST_QUESTION_LIMIT} pertanyaan gratis sebagai tamu untuk 24 jam terakhir. Silakan masuk/buat akun gratis untuk kuota lebih besar, atau coba lagi setelah jatah harian direset.`,
      };
    }
    return { allowed: true, remaining: GUEST_QUESTION_LIMIT - used };
  } catch (err) {
    console.warn("[ai-usage-quota] Gagal memeriksa kuota tamu:", err);
    return { allowed: true, remaining: GUEST_QUESTION_LIMIT };
  }
}

/**
 * Tambah hitungan tamu +1 setelah AI berhasil menjawab.
 * Diikat pada guest_id DAN IP Hash agar tidak bisa disiasati. Reset otomatis
 * ke 1 (bukan +1 dari count lama) kalau window 24 jam sebelumnya sudah lewat.
 */
export async function incrementGuestQuota(guestId: string, rawIp: string): Promise<void> {
  if (!supabaseAdmin) return;
  const ipHash = hashIpAddress(rawIp);
  const now = new Date().toISOString();

  try {
    const { data: existing } = await supabaseAdmin
      .from("guest_usage")
      .select("question_count, guest_id, window_started_at")
      .or(`guest_id.eq.${guestId},ip_address.eq.${ipHash}`)
      .maybeSingle();

    if (!existing) {
      await supabaseAdmin.from("guest_usage").insert({
        guest_id: guestId,
        ip_address: ipHash,
        question_count: 1,
        window_started_at: now,
      });
    } else if (isGuestWindowExpired(existing.window_started_at)) {
      // Window 24 jam sebelumnya sudah habis -- mulai window baru dari 1,
      // bukan menumpuk dari count lama.
      await supabaseAdmin
        .from("guest_usage")
        .update({
          question_count: 1,
          window_started_at: now,
          ip_address: ipHash,
          last_seen_at: now,
        })
        .eq("guest_id", existing.guest_id);
    } else {
      await supabaseAdmin
        .from("guest_usage")
        .update({
          question_count: existing.question_count + 1,
          ip_address: ipHash,
          last_seen_at: now,
        })
        .eq("guest_id", existing.guest_id);
    }
  } catch (e) {
    console.warn("[ai-usage-quota] Gagal mencatat pemakaian tamu:", e);
  }
}

/**
 * Cek kuota User (sudah login) berdasarkan 24 jam rolling window.
 */
export async function checkUserQuota(userId: string, role: string, userEmail?: string): Promise<QuotaCheckResult> {
  if (UNLIMITED_ROLES.has(role) || userEmail === "developer@mongondowpedia.com" || userId === "developer@mongondowpedia.com") {
    return { allowed: true, remaining: Infinity };
  }
  if (!supabaseAdmin) return { allowed: true, remaining: USER_DAILY_QUESTION_LIMIT };

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("token_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since);

  const used = count ?? 0;
  if (used >= USER_DAILY_QUESTION_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      message: `Anda sudah memakai jatah ${USER_DAILY_QUESTION_LIMIT} pertanyaan AI untuk 24 jam terakhir. Jatah akan kembali bertahap seiring waktu.`,
    };
  }
  return { allowed: true, remaining: USER_DAILY_QUESTION_LIMIT - used };
}
