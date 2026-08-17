import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Text-to-Speech Bogani AI Voice Mode via Google Cloud TTS (Chirp3-HD,
 * suara neural terbaru Google -- jauh lebih baik & konsisten lintas
 * device/browser drpd Web Speech API bawaan browser yang dipakai
 * sebelumnya, lihat components/homepage/VoiceModeOverlay.tsx).
 */

const DEFAULT_VOICE = process.env.GOOGLE_TTS_VOICE_NAME || "id-ID-Chirp3-HD-Aoede";

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_SPEECH_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Google Cloud Speech API key belum dikonfigurasi" }, { status: 503 });
  }

  // Endpoint ini manggil API berbayar (Google Cloud TTS) tanpa kuota AI
  // chat yg sudah ada (lib/ai-usage-quota.ts) -- rate limit per-IP wajib
  // ada spy tidak bisa dipukul langsung tanpa lewat UI/kuota sama sekali.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.VOICE_TTS);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan suara, coba lagi sebentar lagi." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const text: string = typeof body.text === "string" ? body.text.trim() : "";
  const languageCode: string = body.languageCode === "en" ? "en-US" : "id-ID";
  const voiceName: string = body.voiceName || (languageCode === "en-US" ? "en-US-Chirp3-HD-Aoede" : DEFAULT_VOICE);

  if (!text) {
    return NextResponse.json({ error: "text wajib diisi" }, { status: 400 });
  }
  // Google TTS punya batas 5000 byte per request -- teks Voice Mode sudah
  // dipangkas di sisi client (VoiceModeOverlay.tsx, MAX_SPEAKABLE_CHARS),
  // ini cuma jaring pengaman terakhir.
  const clipped = text.length > 4500 ? text.slice(0, 4500) : text;

  try {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: clipped },
        voice: { languageCode, name: voiceName },
        audioConfig: { audioEncoding: "MP3", speakingRate: 1.0 },
      }),
      // 15s sebelumnya kepotong utk teks panjang (VoiceModeOverlay.tsx
      // sekarang izinkan sampai 1600 karakter) -- ironisnya pola bug yg
      // sama persis dgn timeout Gateway chat yg diperbaiki di awal sesi.
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.warn("[voice-tts] Google TTS gagal:", res.status, errBody?.error?.message);
      return NextResponse.json({ error: errBody?.error?.message || "Gagal sintesis suara" }, { status: res.status });
    }

    const data = await res.json();
    if (!data.audioContent) {
      return NextResponse.json({ error: "Google TTS tidak mengembalikan audio" }, { status: 502 });
    }

    const audioBytes = Buffer.from(data.audioContent, "base64");
    return new NextResponse(audioBytes, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBytes.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.warn("[voice-tts] Error:", err);
    return NextResponse.json({ error: err.message || "Gagal menghubungi layanan TTS" }, { status: 500 });
  }
}
