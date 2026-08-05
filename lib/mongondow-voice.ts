import { toSpeakableMongondow } from "@/lib/mongondow-pronunciation";

/**
 * Jalur suara terpusat: rekaman ASLI verifikator (kalau ada & disetujui)
 * DULUAN, baru jatuh ke TTS sintetis (Web Speech API + respelling
 * toSpeakableMongondow) sbg cadangan. Dipakai bersama di semua tempat yg
 * membacakan teks Mongondow: app/kamus/page.tsx, components/AksaraMongondow.tsx,
 * components/homepage/MyAIChat.tsx, components/homepage/VoiceModeOverlay.tsx.
 *
 * Kenapa perlu jalur rekaman: TTS sintetis (id-ID) tak pernah benar-benar paham
 * fonem Mongondow (L glotal, hentian glotal, dst) -- respelling cuma tambal
 * tekstual. Rekaman suara penutur asli (tabel voice_training_samples, diisi
 * lewat tab Verifikator) adalah satu-satunya sumber 100% otentik. Lookup hanya
 * dicoba utk teks pendek (<= kata/frasa, bukan paragraf) krn rekaman disimpan
 * per-kata/frasa, bukan per-kalimat bebas -- mencocokkan teks panjang ke
 * rekaman kata tunggal nyaris tak pernah berhasil & cuma buang waktu.
 */

const LOOKUP_MAX_LENGTH = 60;
const LOOKUP_TIMEOUT_MS = 3000;

// Referensi audio yg sedang diputar, supaya pemanggilan baru bisa menghentikan
// yg lama dulu (baik itu <audio> rekaman maupun speechSynthesis).
let currentAudio: HTMLAudioElement | null = null;

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
}

/** Hentikan paksa suara apa pun yg sedang berbunyi lewat modul ini. */
export function stopSpeakingMongondow() {
  stopCurrentAudio();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

async function lookupRecordedSample(text: string): Promise<string | null> {
  if (typeof window === "undefined" || typeof fetch === "undefined") return null;
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > LOOKUP_MAX_LENGTH) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
    const res = await fetch(`/api/public/voice-lookup?word=${encodeURIComponent(trimmed)}`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as { found?: boolean; url?: string };
    return data.found && data.url ? data.url : null;
  } catch {
    // Gagal-aman: masalah jaringan/timeout jangan sampai memblokir TTS cadangan.
    return null;
  }
}

export interface SpeakMongondowOptions {
  lang?: string;
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

function speakWithTts(text: string, opts: Required<Pick<SpeakMongondowOptions, "lang" | "rate">> & SpeakMongondowOptions) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts.onError?.();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(toSpeakableMongondow(text));
  utterance.lang = opts.lang;
  utterance.rate = opts.rate;
  utterance.onstart = () => opts.onStart?.();
  utterance.onend = () => opts.onEnd?.();
  utterance.onerror = () => opts.onError?.();
  window.speechSynthesis.speak(utterance);
}

/**
 * Bacakan teks Mongondow: coba rekaman asli dulu, baru TTS sintetis kalau
 * tak ada. Selalu menghentikan pemutaran sebelumnya dulu (audio maupun TTS)
 * supaya klik cepat berpindah kata/kalimat tidak bertumpuk.
 */
export async function speakMongondow(text: string, options: SpeakMongondowOptions = {}) {
  const { lang = "id-ID", rate = 0.9, onStart, onEnd, onError } = options;
  if (typeof window === "undefined" || !text.trim()) return;

  stopCurrentAudio();
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();

  const recordedUrl = await lookupRecordedSample(text);

  if (recordedUrl) {
    const audio = new Audio(recordedUrl);
    currentAudio = audio;
    audio.onplay = () => onStart?.();
    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      onEnd?.();
    };
    audio.onerror = () => {
      // Link rekaman gagal diputar (rusak/kedaluwarsa) -- jatuh ke TTS.
      if (currentAudio === audio) currentAudio = null;
      speakWithTts(text, { lang, rate, onStart, onEnd, onError });
    };
    try {
      await audio.play();
      return;
    } catch {
      if (currentAudio === audio) currentAudio = null;
      // lanjut ke TTS di bawah
    }
  }

  speakWithTts(text, { lang, rate, onStart, onEnd, onError });
}
