import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

/**
 * Kontrol pemakaian AI: batas kecil utk tamu (belum login), batas harian utk
 * User biasa, tanpa batas utk verifikator & admin. Dipakai bersama oleh
 * app/api/homepage/chat/route.ts (chat Bogani AI) dan
 * app/api/kamus/ai-define/route.ts (tombol AI definisi Kamus).
 *
 * Kebal Refresh, Kebal Incognito, & Kebal Hapus Storage:
 * Identitas tamu diikat pada kombinasi Cookie HttpOnly (mp_guest_id) + SHA256 Hash IP Address.
 * Sekali jatah 5 pertanyaan habis, user TIDAK BISA mereset walau buka Incognito / hapus cookie.
 */

export const GUEST_QUESTION_LIMIT = 5;
export const USER_DAILY_QUESTION_LIMIT = 15;
export const GUEST_COOKIE_NAME = "mp_guest_id";
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

/**
 * Cek kuota tamu berdasarkan guest_id DAN IP Hash (server-side).
 * Kebal Incognito & Hapus Cookie karena jika cookie hilang, server tetap mengenali IP Hash-nya!
 */
export async function checkGuestQuota(guestId: string, rawIp: string = "127.0.0.1"): Promise<QuotaCheckResult> {
  if (!supabaseAdmin) return { allowed: true, remaining: GUEST_QUESTION_LIMIT };
  const ipHash = hashIpAddress(rawIp);

  try {
    // 1. Cek berdasarkan guest_id terlebih dahulu
    const { data: byGuestId } = await supabaseAdmin
      .from("guest_usage")
      .select("question_count")
      .eq("guest_id", guestId)
      .maybeSingle();

    let used = byGuestId?.question_count ?? 0;

    // 2. Jika cookie baru/hilang (misal di Incognito), cek fallback berdasarkan ip_address
    if (used === 0) {
      const { data: byIp } = await supabaseAdmin
        .from("guest_usage")
        .select("question_count")
        .eq("ip_address", ipHash)
        .maybeSingle();
      if (byIp) {
        used = byIp.question_count ?? 0;
      }
    }

    if (used >= GUEST_QUESTION_LIMIT) {
      return {
        allowed: false,
        remaining: 0,
        message: `Anda sudah menggunakan jatah ${GUEST_QUESTION_LIMIT} pertanyaan gratis sebagai tamu. Silakan masuk atau buat akun gratis untuk terus menggunakan Bogani AI.`,
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
 * Diikat pada guest_id DAN IP Hash agar tidak bisa disiasati.
 */
export async function incrementGuestQuota(guestId: string, rawIp: string): Promise<void> {
  if (!supabaseAdmin) return;
  const ipHash = hashIpAddress(rawIp);

  try {
    const { data: existing } = await supabaseAdmin
      .from("guest_usage")
      .select("question_count, guest_id")
      .or(`guest_id.eq.${guestId},ip_address.eq.${ipHash}`)
      .maybeSingle();

    if (!existing) {
      await supabaseAdmin.from("guest_usage").insert({
        guest_id: guestId,
        ip_address: ipHash,
        question_count: 1
      });
    } else {
      await supabaseAdmin
        .from("guest_usage")
        .update({
          question_count: existing.question_count + 1,
          ip_address: ipHash,
          last_seen_at: new Date().toISOString()
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
