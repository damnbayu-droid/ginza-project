import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Speech-to-Text Bogani AI Voice Mode via Google Cloud STT -- menggantikan
 * Web Speech API (SpeechRecognition) bawaan browser yang sebelumnya dipakai
 * (kualitas & ketersediaan tidak konsisten lintas browser/device, hampir
 * tidak ada di Firefox). Client merekam audio via MediaRecorder lalu kirim
 * satu clip utuh ke sini (bukan streaming real-time -- lihat catatan di
 * VoiceModeOverlay.tsx soal batasan ini).
 */

// Peta MIME type MediaRecorder browser -> enum encoding Google STT.
const ENCODING_BY_MIME: Record<string, string> = {
  "audio/webm": "WEBM_OPUS",
  "audio/webm;codecs=opus": "WEBM_OPUS",
  "audio/ogg": "OGG_OPUS",
  "audio/ogg;codecs=opus": "OGG_OPUS",
  "audio/mp4": "MP3", // fallback kasar; browser yg hanya bisa mp4 (Safari lama) sering tetap AAC, STT mungkin gagal -- lihat penjelasan di VoiceModeOverlay.tsx
  "audio/mpeg": "MP3",
};

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_CLOUD_SPEECH_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Google Cloud Speech API key belum dikonfigurasi" }, { status: 503 });
  }

  // Sama spt TTS -- endpoint ini manggil API berbayar tanpa kuota AI chat
  // yg sudah ada, jadi wajib rate limit per-IP sendiri.
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.VOICE_STT);
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: "Terlalu banyak permintaan suara, coba lagi sebentar lagi." }, { status: 429 });
  }

  const body = await req.json().catch(() => ({}));
  const audioBase64: string = body.audio || "";
  const mimeType: string = body.mimeType || "audio/webm";
  const languageCode: string = body.languageCode === "en" ? "en-US" : "id-ID";

  if (!audioBase64) {
    return NextResponse.json({ error: "audio wajib diisi" }, { status: 400 });
  }

  const encoding = ENCODING_BY_MIME[mimeType] || ENCODING_BY_MIME[mimeType.split(";")[0]] || "WEBM_OPUS";

  try {
    const res = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: {
          encoding,
          languageCode,
          model: "latest_long",
          enableAutomaticPunctuation: true,
          // Bogani AI persona/kamus penuh kosakata Mongondow -- bukan cuma
          // Bahasa Indonesia baku, jadi tanpa hint ini STT cenderung
          // "koreksi" kata daerah jadi kata Indonesia terdekat yg mirip.
          speechContexts: [{ phrases: ["Bogani", "Mongondow", "Bolaang", "Totabuan", "Kotamobagu", "Niondon"], boost: 10 }],
        },
        audio: { content: audioBase64 },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.warn("[voice-stt] Google STT gagal:", res.status, errBody?.error?.message);
      return NextResponse.json({ error: errBody?.error?.message || "Gagal transkripsi suara" }, { status: res.status });
    }

    const data = await res.json();
    const transcript = data.results?.map((r: any) => r.alternatives?.[0]?.transcript).filter(Boolean).join(" ") || "";
    const confidence = data.results?.[0]?.alternatives?.[0]?.confidence ?? null;

    return NextResponse.json({ transcript, confidence });
  } catch (err: any) {
    console.warn("[voice-stt] Error:", err);
    return NextResponse.json({ error: err.message || "Gagal menghubungi layanan STT" }, { status: 500 });
  }
}
