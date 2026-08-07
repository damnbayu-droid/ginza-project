import { supabaseAdmin } from "@/lib/supabase";

/**
 * Kontrol pemakaian AI: batas kecil utk tamu (belum login), batas harian utk
 * User biasa, tanpa batas utk verifikator & admin. Dipakai bersama oleh
 * app/api/homepage/chat/route.ts (chat Bogani AI) dan
 * app/api/kamus/ai-define/route.ts (tombol AI definisi Kamus) -- KEDUANYA
 * menarik dari jatah yg SAMA (satu pool per tamu/user, bukan per-fitur),
 * supaya kontrolnya benar-benar mencerminkan total pemakaian AI, bukan
 * cuma satu fitur.
 *
 * Kenapa dua mekanisme count berbeda:
 * - Tamu: belum ada user_id, jadi dilacak lewat cookie anonim (guest_id)
 *   + disimpan di tabel public.guest_usage. TIDAK PERNAH reset otomatis --
 *   sekali GUEST_LIMIT habis, wajib login/daftar (sesuai keputusan Boss
 *   Bayu: bukan jatah harian, tapi jatah "uji coba" sekali per browser).
 * - User biasa: sudah punya user_id & sudah tercatat di public.token_usage
 *   tiap kali AI benar-benar dipanggil (lihat logChatTurn di homepage/chat
 *   & insert token_usage di kamus/ai-define) -- jadi TIDAK perlu tabel
 *   counter terpisah, tinggal hitung baris token_usage user itu dalam 24
 *   jam terakhir (rolling window, bukan reset jam 00:00 supaya tidak bisa
 *   "disiasati" dgn menunggu tengah malam).
 */

export const GUEST_QUESTION_LIMIT = 5;
export const USER_DAILY_QUESTION_LIMIT = 15;
export const GUEST_COOKIE_NAME = "mp_guest_id";
const UNLIMITED_ROLES = new Set(["admin", "verificator", "developer", "vip", "owner"]);

export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  /** Pesan siap-tampil kalau allowed=false. */
  message?: string;
}

/**
 * Ambil guest_id dari cookie request kalau ada, atau buat baru (UUID) kalau
 * belum ada. TIDAK menyentuh database -- murni baca/generate id saja.
 * Pemanggil wajib memasang cookie ini ke response lewat setGuestCookieHeader()
 * supaya id yg sama dipakai lagi di request berikutnya.
 */
export function getOrCreateGuestId(cookieHeader: string | null): { guestId: string; isNew: boolean } {
  if (cookieHeader) {
    const match = cookieHeader.match(new RegExp(`${GUEST_COOKIE_NAME}=([0-9a-fA-F-]{36})`));
    if (match) return { guestId: match[1], isNew: false };
  }
  return { guestId: crypto.randomUUID(), isNew: true };
}

/** Tempel/refresh cookie guest_id (1 tahun) ke response apa pun (Response/NextResponse). */
export function setGuestCookieHeader(res: Response, guestId: string): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.headers.append(
    "Set-Cookie",
    `${GUEST_COOKIE_NAME}=${guestId}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax; HttpOnly${secure}`
  );
}

/**
 * Cek (read-only, TIDAK menambah hitungan) apakah tamu ini masih boleh
 * bertanya ke AI. Panggil SEBELUM memanggil provider AI supaya tamu yg
 * sudah habis jatah tidak membebani biaya provider sama sekali.
 */
export async function checkGuestQuota(guestId: string): Promise<QuotaCheckResult> {
  if (!supabaseAdmin) return { allowed: true, remaining: GUEST_QUESTION_LIMIT };
  const { data } = await supabaseAdmin
    .from("guest_usage")
    .select("question_count")
    .eq("guest_id", guestId)
    .maybeSingle();

  const used = data?.question_count ?? 0;
  if (used >= GUEST_QUESTION_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      message: `Anda sudah memakai ${GUEST_QUESTION_LIMIT} pertanyaan gratis sbg tamu. Silakan masuk atau buat akun gratis utk terus memakai Bogani AI.`,
    };
  }
  return { allowed: true, remaining: GUEST_QUESTION_LIMIT - used };
}

/**
 * Tambah hitungan tamu +1. Panggil HANYA SETELAH AI benar-benar berhasil
 * menjawab (bukan sebelum, & bukan kalau provider error) -- supaya tamu
 * tidak kehilangan jatah gara-gara kegagalan yg bukan salah mereka.
 */
export async function incrementGuestQuota(guestId: string, ip: string): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    const { data: existing } = await supabaseAdmin
      .from("guest_usage")
      .select("question_count")
      .eq("guest_id", guestId)
      .maybeSingle();

    if (!existing) {
      await supabaseAdmin.from("guest_usage").insert({ guest_id: guestId, ip_address: ip, question_count: 1 });
    } else {
      await supabaseAdmin
        .from("guest_usage")
        .update({ question_count: existing.question_count + 1, ip_address: ip, last_seen_at: new Date().toISOString() })
        .eq("guest_id", guestId);
    }
  } catch (e) {
    console.warn("[ai-usage-quota] Gagal mencatat pemakaian tamu:", e);
  }
}

/**
 * Cek (read-only) apakah User (sudah login) masih di bawah batas harian.
 * Verifikator & admin selalu allowed (unlimited). Tidak perlu fungsi
 * "increment" terpisah -- baris token_usage yg sudah dicatat tiap giliran
 * AI (lihat logChatTurn & kamus/ai-define) SUDAH berfungsi sbg hitungannya.
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
      message: `Anda sudah memakai jatah ${USER_DAILY_QUESTION_LIMIT} pertanyaan AI utk 24 jam terakhir. Jatah akan kembali bertahap seiring waktu -- coba lagi nanti.`,
    };
  }
  return { allowed: true, remaining: USER_DAILY_QUESTION_LIMIT - used };
}
