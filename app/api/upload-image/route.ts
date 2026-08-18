import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB

// "avatars" pakai bucket & ukuran resize TERPISAH dari "articles"/"knowledge"
// -- bucket "avatars" sudah ada sejak migrasi skema awal (20260803) tapi
// TIDAK PERNAH benar-benar dipakai kode manapun (foto profil sebelumnya
// selalu base64 langsung di kolom profiles.avatar_url, bukan Storage sungguhan).
const SCOPE_CONFIG: Record<string, { bucket: string; maxWidth: number }> = {
  articles: { bucket: "content-images", maxWidth: 1600 },
  knowledge: { bucket: "content-images", maxWidth: 1600 },
  avatars: { bucket: "avatars", maxWidth: 512 },
};

/**
 * Endpoint upload gambar bersama utk konten Artikel (kontributor login
 * biasa, Supabase Auth), Knowledge Base (admin, sesi owner terpisah lib/auth.ts),
 * & foto profil/avatar (kontributor ATAU admin) -- lihat lib/admin-guard.ts
 * utk kenapa dua sistem identitas ini terpisah. Selalu convert ke WebP &
 * upload ke bucket Storage PUBLIK sesuai scope (beda dari "data-center-files"
 * yg private/signed-URL -- gambar di sini tertanam permanen di konten/profil
 * terpublikasi, URL-nya tidak boleh kedaluwarsa).
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.UPLOAD_IMAGE);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak permintaan. Coba lagi setelah ${rateCheck.resetAt.toISOString()}.` },
      { status: 429, headers: { "Retry-After": rateCheck.resetAt.toISOString() } }
    );
  }

  const session = await getSession(req);
  const isAdmin = session?.role === "owner";
  const profile = isAdmin ? null : await getCurrentUserProfile();
  if (!isAdmin && !profile) {
    return NextResponse.json({ error: "Belum login" }, { status: 401 });
  }
  if (profile?.is_banned) {
    return NextResponse.json({ error: "Akun diblokir" }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Storage belum dikonfigurasi" }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const imageBase64: string | undefined = body?.imageBase64;
  const scope: string = SCOPE_CONFIG[body?.scope] ? body.scope : "articles";
  const { bucket, maxWidth } = SCOPE_CONFIG[scope];
  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json({ error: "imageBase64 wajib diisi" }, { status: 400 });
  }

  const match = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
  const rawBase64 = match ? match[2] : imageBase64;

  let buffer: Buffer;
  try {
    buffer = Buffer.from(rawBase64, "base64");
  } catch {
    return NextResponse.json({ error: "Format gambar tidak valid" }, { status: 400 });
  }

  // Validasi ukuran SERVER-SIDE -- validasi klien bisa dilewati.
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "Ukuran gambar maksimal 2MB" }, { status: 413 });
  }

  let webpBuffer: Buffer;
  try {
    webpBuffer = await sharp(buffer)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Gagal memproses gambar" }, { status: 400 });
  }

  const fileUuid = crypto.randomUUID();
  const ownerFolder = scope === "avatars" ? (profile?.id || "admin-owner") : scope;
  const filePath = `${ownerFolder}/${fileUuid}.webp`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filePath, webpBuffer, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    console.error("[upload-image] Storage upload error:", uploadError.message);
    return NextResponse.json({ error: "Gagal mengunggah gambar" }, { status: 500 });
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);

  return NextResponse.json({ url: publicUrlData.publicUrl, path: filePath });
}
