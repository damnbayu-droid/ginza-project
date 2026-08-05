/**
 * Sanity-check "apakah foto ini wajah manusia asli?" utk pendaftaran
 * Verifikator — arahan Boss Bayu 2026-08-05: pakai "MyAI API yang sudah
 * terkoneksi dengan sistem", bukan vendor KYC baru. Ini reuse PENUH provider
 * vision yang SUDAH ada di lib/provider-adapters (dipakai jalur chat Bogani
 * AI di app/api/homepage/chat/route.ts) — hanya env-key fallback (Claude /
 * Gemini / GPT, siapa saja yang punya key aktif & supportsVision), TIDAK
 * menyentuh jalur gw_provider_keys (skema myai-os-gateway, DB berbeda).
 *
 * PENTING (harus jujur ke admin/pengguna): ini adalah saringan awal
 * berbasis satu foto diam (sanity check "tampak wajah manusia atau bukan"),
 * BUKAN liveness detection anti-spoof bersertifikat (yang butuh capture
 * gerak/tantangan real-time). Hasilnya SINYAL BANTU utk admin — admin tetap
 * WAJIB review manual sebelum approve verifikator (sesuai arahan: tak ada
 * verifikator yang otomatis "Verified" tanpa konfirmasi admin).
 */

import { PROVIDER_REGISTRY } from "@/lib/provider-adapters";

export interface FaceCheckResult {
  status: "passed" | "flagged" | "skipped" | "error";
  notes: string;
  provider?: string;
}

const CHECK_PROMPT = `Anda adalah pemeriksa mutu foto pendaftaran identitas (BUKAN sistem keamanan/biometrik final — hanya saringan awal).
Lihat gambar terlampir. Jawab HANYA dalam format JSON satu baris, tanpa teks lain:
{"is_human_photo": true|false, "reason": "alasan singkat 1 kalimat bahasa Indonesia"}

Kriteria "is_human_photo": true HANYA jika gambar adalah foto asli (bukan gambar kartun/ilustrasi/AI-generated yang jelas, bukan layar kosong/hitam, bukan objek non-wajah, bukan screenshot dokumen) yang menampakkan wajah manusia dengan jelas.`;

function parseVerdict(text: string): { isHuman: boolean | null; reason: string } {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { isHuman: null, reason: "Respons AI tidak berformat JSON." };
    const parsed = JSON.parse(match[0]);
    return { isHuman: typeof parsed.is_human_photo === "boolean" ? parsed.is_human_photo : null, reason: String(parsed.reason ?? "") };
  } catch {
    return { isHuman: null, reason: "Gagal mem-parse respons AI." };
  }
}

/**
 * Cek satu foto (base64 data URL, mis. "data:image/jpeg;base64,....").
 * Mengembalikan status per-foto — dipanggil 3x (depan/kiri/kanan) oleh caller.
 */
export async function checkHumanFacePhoto(dataUrl: string): Promise<FaceCheckResult> {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return { status: "error", notes: "Format foto tidak valid (bukan data URL base64)." };
  const [, mimeType, base64Data] = match;

  // Urutan provider vision-capable, sama semangat dgn PREFERRED_ORDER di
  // callProviderDirect (homepage/chat/route.ts) — pakai env key langsung,
  // tidak melalui gw_provider_keys (skema DB myai-os-gateway yang berbeda).
  const candidates: { provider: string; apiKey: string | undefined }[] = [
    { provider: "claude", apiKey: process.env.CLAUDE_API_KEY1 || process.env.CLAUDE_API_KEY },
    { provider: "gemini", apiKey: process.env.GEMINI_API_KEY1 || process.env.GEMINI_API_KEY },
    { provider: "gpt", apiKey: process.env.OPENAI_API_KEY1 || process.env.OPENAI_API_KEY },
  ];

  for (const { provider, apiKey } of candidates) {
    const key = apiKey?.trim();
    if (!key || key.includes("<") || key.includes("placeholder")) continue;
    const adapter = PROVIDER_REGISTRY[provider];
    if (!adapter || !adapter.supportsVision) continue;

    try {
      const result = await adapter.call(
        key,
        CHECK_PROMPT,
        "Anda menjawab HANYA dengan JSON satu baris sesuai instruksi, tidak ada teks tambahan.",
        { temperature: 0, max_tokens: 200 },
        { mimeType, base64Data },
        null,
        `${provider} face-check`
      );

      if (!result.success || !result.aiResponseText) continue;

      const { isHuman, reason } = parseVerdict(result.aiResponseText);
      if (isHuman === null) return { status: "flagged", notes: `Perlu ditinjau manual — ${reason}`, provider };
      return { status: isHuman ? "passed" : "flagged", notes: reason, provider };
    } catch (err: any) {
      console.warn(`[ai-vision-check] Provider ${provider} error:`, err?.message || err);
      continue;
    }
  }

  // Tidak ada provider vision dengan key aktif — jangan blokir pendaftaran,
  // biarkan admin review manual sepenuhnya.
  return { status: "skipped", notes: "Tidak ada provider AI vision aktif (env key belum diset) — perlu review manual admin." };
}

/**
 * Jalankan cek utk 3 foto (depan/kiri/kanan) sekaligus, gabungkan jadi satu
 * status agregat + catatan gabungan utk disimpan di
 * verificator_applications.ai_face_check_status / ai_face_check_notes.
 */
export async function checkFaceCaptureSet(photos: { front: string; left: string; right: string }): Promise<FaceCheckResult> {
  const [front, left, right] = await Promise.all([
    checkHumanFacePhoto(photos.front),
    checkHumanFacePhoto(photos.left),
    checkHumanFacePhoto(photos.right),
  ]);

  const results = [front, left, right];
  if (results.some((r) => r.status === "flagged")) {
    return {
      status: "flagged",
      notes: [`Depan: ${front.notes}`, `Kiri: ${left.notes}`, `Kanan: ${right.notes}`].join(" | "),
      provider: front.provider,
    };
  }
  if (results.every((r) => r.status === "passed")) {
    return { status: "passed", notes: "Ketiga foto lolos saringan awal AI (tampak wajah manusia asli).", provider: front.provider };
  }
  if (results.some((r) => r.status === "error")) {
    return { status: "error", notes: [front.notes, left.notes, right.notes].join(" | ") };
  }
  return { status: "skipped", notes: "Saringan AI tidak aktif/tidak lengkap — perlu review manual admin." };
}
