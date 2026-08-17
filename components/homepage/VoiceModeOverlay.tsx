'use client';

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, X, Volume2, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import MyAILogo from "./MyAILogo";
import { toSpeakableMongondow } from "@/lib/mongondow-pronunciation";

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceMessage: (text: string, isVoiceInput?: boolean) => Promise<string>;
  lang: 'id' | 'en';
}

// Batas aman lama rekaman kalau tombol ditahan kelewat lama (bukan trigger
// normal -- alur normalnya user lepas tombol sendiri). Dinaikkan dari versi
// auto-detect sebelumnya (25s) krn sekarang tahan = sengaja, giliran bicara
// yg lebih panjang jadi wajar.
const MAX_RECORDING_MS = 60_000;

// WAV hening 1 sample -- dipakai murni utk "membuka kunci" elemen <audio>
// di dalam gesture pengguna asli (lihat unlockAudioPlayback()). HARUS blob:
// (bukan data:) krn CSP situs ini (next.config.ts) cuma izinkan
// `media-src 'self' blob: mediastream:` -- data: URI diam2 diblokir CSP,
// bikin unlock-nya gagal terus tanpa ketahuan.
const SILENT_WAV_BASE64 = "UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==";
let silentAudioBlobUrl: string | null = null;
function getSilentAudioBlobUrl(): string {
  if (silentAudioBlobUrl) return silentAudioBlobUrl;
  const binary = atob(SILENT_WAV_BASE64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  silentAudioBlobUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
  return silentAudioBlobUrl;
}

// Nama suara nyata, dikonfirmasi lewat Google Cloud TTS voices:list API
// (bukan tebakan) -- semua id-ID-Chirp3-HD. Key localStorage sengaja beda
// dari `setting_voice_type` di SettingsModal.tsx (itu enum lama yg tidak
// terhubung ke pipeline Google TTS ini sama sekali).
const DEFAULT_ID_VOICE = "id-ID-Chirp3-HD-Aoede";
const VOICE_OPTIONS: { id: string; label: string }[] = [
  { id: "id-ID-Chirp3-HD-Aoede", label: "Aoede (Wanita, Hangat)" },
  { id: "id-ID-Chirp3-HD-Puck", label: "Puck (Pria, Ceria)" },
  { id: "id-ID-Chirp3-HD-Kore", label: "Kore (Wanita, Tegas)" },
];
const VOICE_STORAGE_KEY = "bogani_voice_name";

export default function VoiceModeOverlay({
  isOpen,
  onClose,
  onSendVoiceMessage,
  lang
}: VoiceModeOverlayProps) {
  const [status, setStatus] = useState<'listening' | 'processing' | 'speaking' | 'idle'>('idle');
  const [transcript, setTranscript] = useState("");
  const [aiSpeechText, setAiSpeechText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [permissionState, setPermissionState] = useState<'granted' | 'prompt' | 'denied' | 'unknown'>('unknown');
  const [audioLevel, setAudioLevel] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<string>(DEFAULT_ID_VOICE);

  // Perekaman suara pengguna (Google Cloud STT, lihat app/api/voice/stt).
  // CATATAN JUJUR soal batasan: ini BUKAN transkripsi live kata-per-kata --
  // audio direkam utuh SELAMA TOMBOL DITAHAN, baru dikirim sekali ke STT
  // setelah dilepas. Streaming STT sungguhan (spt Claude/GPT voice mode)
  // butuh koneksi persisten terpisah, di luar scope perbaikan ini.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number>(0);
  const maxDurationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pemutaran balasan AI (Google Cloud TTS). Satu elemen <audio> PERSISTEN
  // dipakai ulang terus-menerus (bukan `new Audio()` tiap giliran) --
  // penting utk lolos kebijakan autoplay browser: begitu elemen ini berhasil
  // di-play() sekali di dalam gesture pengguna asli (lihat unlockAudioPlayback,
  // dipanggil saat tombol pertama kali ditekan), browser mengizinkan elemen
  // YANG SAMA diputar lagi nanti dari callback async (setelah STT+chat
  // selesai, tanpa gesture baru) -- izinnya terikat ke elemen, bukan ke
  // baris kode play()-nya. Sebelum perbaikan ini, `new Audio(url)` tiap
  // giliran = elemen baru tiap kali = selalu butuh gesture baru = diam-diam
  // diblokir begitu round-trip (rekam->STT->chat, bisa >15 detik) membuat
  // pemutaran terjadi terlalu lama setelah klik terakhir pengguna.
  const persistentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);
  const audioObjectUrlRef = useRef<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(VOICE_STORAGE_KEY);
    if (saved && VOICE_OPTIONS.some((v) => v.id === saved)) setSelectedVoice(saved);
  }, []);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setPermissionState(permissionStatus.state);
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state);
          };
        })
        .catch(() => setPermissionState('unknown'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      stopVoiceSession();
      return;
    }
    setErrorMessage("");
    setStatus('idle');
    // Siapkan izin mic + meter level visual di awal -- TAPI jangan mulai
    // merekam apa pun sampai tombol benar2 ditahan (push-to-talk).
    ensureMicAnalyser();

    return () => {
      stopVoiceSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const requestPermission = async () => {
    setErrorMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(
        lang === 'id'
          ? "Browser Anda tidak mendukung akses perangkat mikrofon."
          : "Your browser does not support microphone device access."
      );
      return;
    }
    const ok = await ensureMicAnalyser();
    if (!ok) return;
    setErrorMessage("");
  };

  function ensurePersistentAudio(): HTMLAudioElement {
    if (!persistentAudioRef.current) {
      const audio = new Audio();
      audio.setAttribute("playsinline", "true"); // pemutaran inline di iOS Safari, bukan fullscreen
      persistentAudioRef.current = audio;
    }
    return persistentAudioRef.current;
  }

  // Dipanggil di DALAM event handler pointerdown tombol bicara (gesture
  // pengguna asli) -- lihat komentar panjang di persistentAudioRef di atas.
  function unlockAudioPlayback() {
    if (audioUnlockedRef.current) return;
    const audio = ensurePersistentAudio();
    audio.src = getSilentAudioBlobUrl();
    audio.play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioUnlockedRef.current = true;
      })
      .catch(() => {
        // Belum berhasil unlock -- akan dicoba lagi di penekanan berikutnya,
        // tidak fatal (giliran ini mungkin masih kena blokir autoplay).
      });
  }

  const cleanupAudioResources = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const stopAiAudio = () => {
    if (persistentAudioRef.current) {
      persistentAudioRef.current.pause();
    }
    if (audioObjectUrlRef.current) {
      URL.revokeObjectURL(audioObjectUrlRef.current);
      audioObjectUrlRef.current = null;
    }
  };

  // Mute HANYA pause (beda dari stopAiAudio yg juga revoke blob URL) --
  // supaya unmute bisa lanjutkan dari posisi yg sama, bukan suara hilang
  // permanen. stopAiAudio tetap dipakai apa adanya utk kasus interupsi
  // giliran baru (startRecording/stopVoiceSession), itu memang niatnya buang.
  const pauseAiAudio = () => {
    persistentAudioRef.current?.pause();
  };

  const resumeAiAudio = () => {
    const audio = persistentAudioRef.current;
    if (audio && audioObjectUrlRef.current && audio.paused && !audio.ended) {
      audio.play().catch((err) => console.warn("Resume AI audio failed:", err));
    }
  };

  const stopVoiceSession = () => {
    cleanupAudioResources();
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    stopAiAudio();
    setStatus('idle');
    setAudioLevel(0);
  };

  // Mic stream + analyser dipakai utk meter level visual selama tombol
  // ditahan. TIDAK dipakai MediaRecorder-nya sendiri (instance terpisah,
  // dibuat per-giliran di startRecording()) -- stream ini aman dipakai
  // ulang lintas giliran, tidak perlu getUserMedia() baru tiap kali.
  const ensureMicAnalyser = async (): Promise<boolean> => {
    if (micStreamRef.current && micStreamRef.current.getTracks().some((t) => t.readyState === "live")) {
      return true;
    }
    if (!navigator.mediaDevices?.getUserMedia) return false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micStreamRef.current = stream;
      setPermissionState('granted');
      setupAudioAnalyser(stream);
      return true;
    } catch (err) {
      console.warn("Microphone permission denied:", err);
      setPermissionState('denied');
      setErrorMessage(
        lang === 'id'
          ? "Izin Mikrofon diblokir. Klik ikon gembok di URL bar browser Anda untuk mengizinkan akses mikrofon."
          : "Microphone access blocked. Click the lock icon in your browser URL bar to allow microphone."
      );
      return false;
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      // Cuma meter visual sekarang -- TIDAK ada lagi barge-in otomatis
      // berdasar volume (dulu di sini) krn itu penyebab bug nyata: suara AI
      // sendiri yg bocor balik ke mic (gema, apalagi tanpa headset) bisa
      // salah terdeteksi sbg "user menyela", memutus balasan AI sendiri
      // tepat saat baru mulai bicara. Interupsi sekarang cuma lewat aksi
      // eksplisit (tekan tombol lagi), bukan tebak-tebakan dari volume mic.
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn("Audio analyser setup warning:", e);
    }
  };

  function pickSupportedMimeType(): string {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
    for (const type of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(type)) return type;
    }
    return "";
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1] || "");
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // --- Push-to-talk: mulai rekam saat tombol DITEKAN ---
  const startRecording = async () => {
    if (status === 'processing') return; // giliran sebelumnya masih diproses, jangan tumpang tindih
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(
        lang === 'id'
          ? "Browser Anda tidak mendukung perekaman audio (gunakan browser modern spt Chrome, Edge, Firefox, atau Safari terbaru)."
          : "Your browser does not support audio recording (use a modern browser: Chrome, Edge, Firefox, or recent Safari)."
      );
      return;
    }

    // Interupsi eksplisit: kalau AI masih bicara & user menekan tombol,
    // hentikan suara AI dulu, baru mulai rekam.
    stopAiAudio();

    const micOk = await ensureMicAnalyser();
    if (!micOk) return;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }

    const mimeType = pickSupportedMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = mimeType ? new MediaRecorder(micStreamRef.current!, { mimeType }) : new MediaRecorder(micStreamRef.current!);
    } catch (e) {
      console.warn("Gagal membuat MediaRecorder:", e);
      setErrorMessage(lang === 'id' ? "Gagal memulai perekaman audio." : "Failed to start audio recording.");
      return;
    }

    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    recordingStartedAtRef.current = Date.now();

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      if (maxDurationTimeoutRef.current) {
        clearTimeout(maxDurationTimeoutRef.current);
        maxDurationTimeoutRef.current = null;
      }
      const chunks = audioChunksRef.current;
      audioChunksRef.current = [];
      const totalSize = chunks.reduce((s, c) => s + c.size, 0);
      const heldMs = Date.now() - recordingStartedAtRef.current;

      // Ditahan sebentar sekali (kurang dari ~300ms, mis. kepencet tak
      // sengaja) atau audio kosong -- jangan kirim ke STT sama sekali.
      if (heldMs < 300 || totalSize < 800) {
        setStatus('idle');
        return;
      }

      setStatus('processing');
      try {
        const blob = new Blob(chunks, { type: recorder.mimeType || mimeType || "audio/webm" });
        const base64 = await blobToBase64(blob);
        const res = await fetch("/api/voice/stt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: base64, mimeType: blob.type, languageCode: lang }),
        });
        const data = await res.json().catch(() => ({}));

        if (res.status === 403 && data.quotaExceeded) {
          setErrorMessage(data.error || (lang === 'id' ? "Jatah pertanyaan AI harian sudah habis." : "Daily AI question quota reached."));
          setStatus('idle');
          return;
        }

        const captured = (data.transcript || "").trim();
        if (captured.length > 0) {
          setTranscript(captured);
          handleProcessVoiceInput(captured);
        } else {
          setErrorMessage(lang === 'id' ? "Tidak menangkap ucapan, silakan coba lagi." : "No speech detected, please try again.");
          setStatus('idle');
        }
      } catch (err: any) {
        console.warn("STT request error:", err);
        setErrorMessage(lang === 'id' ? "Gagal memproses suara, silakan coba lagi." : "Failed to process speech, please try again.");
        setStatus('idle');
      }
    };

    setErrorMessage("");
    setTranscript("");
    setStatus('listening');

    try {
      recorder.start(250);
      // Jaring pengaman kalau tombol ketahan kelewat lama (mis. jari
      // tersangkut) -- bukan alur normal, alur normal user lepas sendiri.
      maxDurationTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, MAX_RECORDING_MS);
    } catch (e) {
      console.warn("Failed starting media recorder:", e);
      setStatus('idle');
    }
  };

  // --- Push-to-talk: berhenti & kirim saat tombol DILEPAS ---
  const stopRecordingAndSend = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop(); // memicu onstop -> kirim ke STT
    }
  };

  const handleProcessVoiceInput = async (spokenText: string) => {
    setStatus('processing');
    try {
      const response = await onSendVoiceMessage(spokenText, true);
      setAiSpeechText(response || "");
      speakResponse(response);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses pesan suara");
      setStatus('idle');
    }
  };

  // Dulu dipotong keras di 450 karakter -- jawaban AI yg lebih panjang
  // kepotong di tengah kalimat saat diucapkan. Batas dinaikkan & sekarang
  // dipotong di akhir kalimat terdekat kalau memang masih melebihi batas.
  const MAX_SPEAKABLE_CHARS = 1600;

  const cleanTextForPhonetics = (text: string): string => {
    const stripped = text.replace(/[*_#`~]/g, '').replace(/\[.*?\]\(.*?\)/g, '');
    let limited = stripped;
    if (stripped.length > MAX_SPEAKABLE_CHARS) {
      const window = stripped.slice(0, MAX_SPEAKABLE_CHARS);
      const lastBoundary = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '), window.lastIndexOf('? '), window.lastIndexOf('.\n'));
      limited = lastBoundary > MAX_SPEAKABLE_CHARS * 0.5 ? window.slice(0, lastBoundary + 1) : window;
    }
    return toSpeakableMongondow(limited);
  };

  const speakResponse = async (text: string) => {
    if (isMuted) {
      setStatus('idle');
      return;
    }
    const cleanText = cleanTextForPhonetics(text);
    if (!cleanText.trim()) {
      setStatus('idle');
      return;
    }

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, languageCode: lang, voiceName: selectedVoice }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "TTS request failed");
      }
      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      if (audioObjectUrlRef.current) URL.revokeObjectURL(audioObjectUrlRef.current);
      audioObjectUrlRef.current = url;

      // Elemen PERSISTEN yg sama dipakai ulang (bukan `new Audio(url)`) --
      // lihat komentar panjang di persistentAudioRef di atas soal kenapa
      // ini penting utk lolos kebijakan autoplay.
      const audio = ensurePersistentAudio();
      audio.src = url;

      audio.onplay = () => setStatus('speaking');
      audio.onended = () => {
        if (audioObjectUrlRef.current === url) {
          URL.revokeObjectURL(url);
          audioObjectUrlRef.current = null;
        }
        setStatus('idle');
      };
      audio.onerror = () => {
        if (audioObjectUrlRef.current === url) {
          URL.revokeObjectURL(url);
          audioObjectUrlRef.current = null;
        }
        setStatus('idle');
      };

      await audio.play();
    } catch (err) {
      // AbortError = audio ini sengaja dihentikan (user menekan tombol utk
      // menyela, stopAiAudio() manggil .pause() sblm promise play() selesai)
      // -- bukan kegagalan sungguhan, jangan timpa status 'listening' yg
      // sudah benar diset oleh startRecording().
      console.warn("TTS playback error:", err);
      if ((err as any)?.name !== "AbortError") {
        setStatus('idle');
      }
    }
  };

  if (!isOpen) return null;

  const isHeld = status === 'listening';
  const talkButtonProps = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      unlockAudioPlayback();
      startRecording();
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      stopRecordingAndSend();
    },
    onPointerLeave: () => {
      if (isHeld) stopRecordingAndSend();
    },
    onPointerCancel: () => {
      if (isHeld) stopRecordingAndSend();
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0B0C0E]/95 backdrop-blur-2xl text-white p-6 md:p-12 animate-fade-in font-sans select-none">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MyAILogo size="sm" />
          <div className="text-left">
            <h2 className="text-sm font-semibold tracking-wide text-white/90">Bogani AI Voice Mode</h2>
            <p className="text-xs text-cyan-400/80 font-mono">MongondowPedia • Tekan &amp; Tahan untuk Bicara</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-200 focus:outline-none"
          title="Tutup Mode Suara"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Push-to-Talk Button & Visualizer */}
      <div className="flex flex-col items-center justify-center space-y-8 my-auto w-full max-w-xl">
        <div className="relative flex items-center justify-center">
          {status === 'listening' && (
            <>
              <div
                className="absolute rounded-full bg-cyan-500/20 transition-all duration-75"
                style={{ width: `${160 + audioLevel * 1.5}px`, height: `${160 + audioLevel * 1.5}px` }}
              />
              <div
                className="absolute rounded-full bg-blue-500/15 transition-all duration-100"
                style={{ width: `${200 + audioLevel * 2.2}px`, height: `${200 + audioLevel * 2.2}px` }}
              />
            </>
          )}

          {status === 'speaking' && (
            <>
              <div className="absolute w-56 h-56 rounded-full bg-cyan-400/30 animate-pulse" />
              <div className="absolute w-72 h-72 rounded-full bg-blue-500/15 animate-ping" />
            </>
          )}

          {/* Tombol Tekan & Tahan -- SATU-SATUNYA kontrol interaktif utk
              bicara (tombol duplikat di bar bawah sengaja dihapus supaya
              tidak ada 2 tombol berbeda yg membingungkan). */}
          <button
            {...talkButtonProps}
            disabled={status === 'processing'}
            className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 focus:outline-none touch-none ${
              status === 'listening'
                ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/50 scale-110'
                : status === 'processing'
                ? 'bg-gradient-to-br from-amber-400 via-purple-500 to-indigo-600 animate-spin shadow-purple-500/50 cursor-wait'
                : status === 'speaking'
                ? 'bg-gradient-to-br from-teal-300 via-cyan-500 to-blue-600 shadow-teal-400/60 cursor-pointer hover:scale-105'
                : 'bg-white/10 hover:bg-white/20 shadow-black/50 border border-white/20 cursor-pointer hover:scale-105 active:scale-95'
            }`}
            title={
              status === 'listening'
                ? (lang === 'id' ? "Lepas untuk mengirim" : "Release to send")
                : status === 'speaking'
                ? (lang === 'id' ? "Tekan untuk menyela" : "Press to interrupt")
                : (lang === 'id' ? "Tekan & tahan untuk bicara" : "Press & hold to talk")
            }
          >
            {status === 'processing' ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : status === 'speaking' ? (
              <Volume2 className="w-12 h-12 text-white animate-bounce" />
            ) : (
              <Mic className={`w-12 h-12 text-white ${status === 'listening' ? 'animate-pulse' : ''}`} />
            )}
          </button>
        </div>

        {/* Status Text & Subtitle Transcripts */}
        <div className="text-center space-y-3 max-w-md px-4">
          <p className="text-lg font-medium tracking-wide text-white/95">
            {status === 'listening' && (lang === 'id' ? 'Mendengarkan... (lepas tombol utk kirim)' : 'Listening... (release to send)')}
            {status === 'processing' && (lang === 'id' ? 'Bogani AI sedang berpikir...' : 'Bogani AI is thinking...')}
            {status === 'speaking' && (lang === 'id' ? 'Bogani AI sedang berbicara... (tekan utk menyela)' : 'Bogani AI is speaking... (press to interrupt)')}
            {status === 'idle' && (lang === 'id' ? 'Tekan & Tahan Tombol untuk Bicara' : 'Press & Hold the Button to Talk')}
          </p>

          {transcript && (
            <p className="text-sm text-cyan-300 italic bg-cyan-950/40 px-4 py-2.5 rounded-xl border border-cyan-800/50 max-h-24 overflow-y-auto shadow-inner">
              &ldquo;{transcript}&rdquo;
            </p>
          )}

          {status === 'speaking' && aiSpeechText && (
            <p className="text-xs text-white/80 bg-white/5 px-4 py-2 rounded-xl border border-white/10 max-h-28 overflow-y-auto font-sans leading-relaxed">
              {aiSpeechText}
            </p>
          )}

          {permissionState === 'denied' && (
            <div className="flex flex-col gap-2.5 text-left text-xs text-rose-300 bg-rose-950/70 p-4 rounded-2xl border border-rose-800/60 shadow-xl animate-fade-in">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="font-semibold text-rose-200">Akses Mikrofon &amp; Speaker Diblokir</p>
                  <p className="text-rose-300/90 text-[11px] leading-relaxed">
                    Aplikasi memerlukan izin akses perangkat mikrofon dan audio speaker untuk menjalankan percakapan suara real-time Bogani AI.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={requestPermission}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-1"
              >
                <Mic className="w-4 h-4" />
                <span>{lang === 'id' ? 'Minta Izin Akses (Ask Permission)' : 'Ask Permission'}</span>
              </button>
            </div>
          )}

          {errorMessage && permissionState !== 'denied' && (
            <div className="flex flex-col items-center gap-2 text-xs text-rose-300 bg-rose-950/40 p-3 rounded-xl border border-rose-800/40 w-full">
              <div className="flex items-center gap-1.5 text-rose-400 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bawah: tombol Mute + pemilih karakter suara -- kontrol bicara SUDAH
          di orb utama di atas, sengaja tidak diduplikat di sini supaya tidak
          ada 2 tombol beda yg membingungkan. */}
      <div className="w-full max-w-md flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={() => {
            const nextMuted = !isMuted;
            setIsMuted(nextMuted);
            if (nextMuted) pauseAiAudio(); else resumeAiAudio();
          }}
          className={`p-4 rounded-full transition-all duration-200 border flex items-center gap-2 ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
          }`}
          title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          <span className="text-sm font-medium pr-1">
            {isMuted ? (lang === 'id' ? 'Suara AI Dimatikan' : 'AI Voice Muted') : (lang === 'id' ? 'Suara AI Aktif' : 'AI Voice On')}
          </span>
        </button>

        {/* Cuma ditampilkan saat idle -- ganti suara di tengah AI bicara
            tidak terdengar efeknya sampai giliran berikutnya, jadi
            disembunyikan supaya tidak terkesan "kok gak berubah". */}
        {status === 'idle' && (
          <select
            value={selectedVoice}
            onChange={(e) => {
              setSelectedVoice(e.target.value);
              localStorage.setItem(VOICE_STORAGE_KEY, e.target.value);
            }}
            className="px-3 py-2 rounded-full bg-white/10 text-white border border-white/10 hover:bg-white/20 text-sm font-medium transition-all duration-200 cursor-pointer"
            title={lang === 'id' ? "Pilih Karakter Suara" : "Choose Voice Character"}
          >
            {VOICE_OPTIONS.map((v) => (
              <option key={v.id} value={v.id} className="bg-neutral-900 text-white">
                {v.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
