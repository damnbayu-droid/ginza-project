'use client';

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Volume2, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import MyAILogo from "./MyAILogo";
import { toSpeakableMongondow } from "@/lib/mongondow-pronunciation";

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceMessage: (text: string, isVoiceInput?: boolean) => Promise<string>;
  lang: 'id' | 'en';
}

// Ambang volume (skala 0-100 dari analyser) & waktu diam sebelum rekaman
// dianggap selesai bicara -- dipakai loop VAD di updateVolume(). Beda dari
// ambang barge-in (35) yg sengaja lebih tinggi (harus "cukup keras utk
// menyela", bukan cuma "mulai bicara").
const SPEECH_LEVEL_THRESHOLD = 12;
const SILENCE_STOP_MS = 1400;
const MAX_RECORDING_MS = 25000;

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

  // Perekaman suara pengguna (Google Cloud STT, lihat app/api/voice/stt) --
  // menggantikan SpeechRecognition bawaan browser yg sebelumnya dipakai di
  // sini (kualitas/dukungan tidak konsisten lintas browser, nyaris tak ada
  // di Firefox). CATATAN JUJUR soal batasan: ini BUKAN transkripsi live
  // kata-per-kata seperti SpeechRecognition lama -- audio direkam utuh dulu
  // (VAD kasar mendeteksi kapan pengguna selesai bicara), baru dikirim
  // sekali ke STT dan dapat transkrip penuh. Transkrip "hidup" saat masih
  // bicara jadi tidak ada lagi; trade-off yg diambil demi akurasi &
  // konsistensi suara yg jauh lebih baik. Streaming STT sungguhan (spt
  // Claude/GPT voice mode) butuh koneksi persisten terpisah, di luar scope
  // perbaikan ini.
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number>(0);
  const hasDetectedSpeechRef = useRef(false);
  const silenceStartRef = useRef<number | null>(null);

  // Pemutaran balasan AI (Google Cloud TTS, lihat app/api/voice/tts) --
  // menggantikan SpeechSynthesisUtterance bawaan browser (suara bawaan
  // seringkali tidak ada/kasar utk id-ID tergantung OS pengguna).
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioPlayerUrlRef = useRef<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  // statusRef: updateVolume() hidup lintas render di dalam requestAnimationFrame
  // loop, jadi butuh ref (bukan langsung baca state `status`) supaya nilainya
  // selalu yang terbaru, tidak stale-closure ke status saat loop dibuat.
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  // Check microphone permission state on mount & when open
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
    startListening();

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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      micStreamRef.current = stream;
      setPermissionState('granted');
      setErrorMessage("");
      setupAudioAnalyser(stream);
      startListening();
    } catch (err: any) {
      console.warn("Microphone permission request error:", err);
      setPermissionState('denied');
      setErrorMessage(
        lang === 'id'
          ? "Izin Mikrofon & Speaker ditolak/diblokir. Mohon izinkan akses mikrofon di setelan browser."
          : "Microphone & Speaker access denied. Please allow mic in browser settings."
      );
    }
  };

  // Melepas mic stream + audio context + loop VAD. Dipanggil saat sesi suara
  // benar-benar ditutup (bukan antar-giliran bicara) supaya tidak menumpuk
  // stream/AudioContext baru di setiap giliran percakapan.
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
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  };

  const stopAiAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (audioPlayerUrlRef.current) {
      URL.revokeObjectURL(audioPlayerUrlRef.current);
      audioPlayerUrlRef.current = null;
    }
  };

  const stopVoiceSession = () => {
    cleanupAudioResources();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
    stopAiAudio();
    setStatus('idle');
    setAudioLevel(0);
  };

  // Mic stream + analyser dipakai untuk visualisasi level suara, deteksi
  // barge-in, DAN sekarang deteksi diam (VAD) utk tahu kapan pengguna
  // selesai bicara. TIDAK dipakai MediaRecorder-nya sendiri (itu instance
  // terpisah di startListening()) -- aman dipakai ulang lintas giliran
  // bicara, tidak perlu getUserMedia() baru tiap kali.
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

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));
        setAudioLevel(normalized);

        // VAD / Barge-in: kalau AI sedang bicara dan user mulai bicara cukup keras,
        // batalkan suara AI DAN langsung mulai rekam interupsi user.
        const aiSpeaking = !!audioPlayerRef.current && !audioPlayerRef.current.paused && !audioPlayerRef.current.ended;
        if (normalized > 35 && aiSpeaking && statusRef.current !== 'listening') {
          stopAiAudio();
          startListening();
        }

        // VAD: deteksi selesai bicara supaya rekaman otomatis berhenti &
        // dikirim ke STT, mirip perilaku onend SpeechRecognition dulu.
        if (statusRef.current === 'listening' && mediaRecorderRef.current?.state === 'recording') {
          const elapsed = Date.now() - recordingStartedAtRef.current;
          if (normalized > SPEECH_LEVEL_THRESHOLD) {
            hasDetectedSpeechRef.current = true;
            silenceStartRef.current = null;
          } else if (hasDetectedSpeechRef.current) {
            if (silenceStartRef.current === null) silenceStartRef.current = Date.now();
            else if (Date.now() - silenceStartRef.current >= SILENCE_STOP_MS) {
              mediaRecorderRef.current.stop();
            }
          }
          if (elapsed >= MAX_RECORDING_MS) {
            mediaRecorderRef.current.stop();
          }
        }

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
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1] || "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  const startListening = async () => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setErrorMessage(
        lang === 'id'
          ? "Browser Anda tidak mendukung perekaman audio (gunakan browser modern spt Chrome, Edge, Firefox, atau Safari terbaru)."
          : "Your browser does not support audio recording (use a modern browser: Chrome, Edge, Firefox, or recent Safari)."
      );
      setStatus('idle');
      return;
    }

    // Stop AI audio kalau sedang bicara pas user mau bicara
    stopAiAudio();

    // 1. Pastikan mic stream + analyser (utk visualisasi & VAD) aktif.
    const micOk = await ensureMicAnalyser();
    if (!micOk) {
      setStatus('idle');
      return;
    }

    // Kalau ada recorder sebelumnya yg masih jalan (mis. dari barge-in yg
    // menimpa giliran lama), hentikan dulu.
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
      setStatus('idle');
      return;
    }

    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];
    hasDetectedSpeechRef.current = false;
    silenceStartRef.current = null;
    recordingStartedAtRef.current = Date.now();

    recorder.ondataavailable = (e: BlobEvent) => {
      if (e.data.size > 0) audioChunksRef.current.push(e.data);
    };

    recorder.onstop = async () => {
      const chunks = audioChunksRef.current;
      audioChunksRef.current = [];
      const totalSize = chunks.reduce((s, c) => s + c.size, 0);

      // Diam total / klik stop sebelum sempat bicara -- jangan kirim ke STT.
      if (!hasDetectedSpeechRef.current || totalSize < 800) {
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

        // Kuota harian habis (sama persis dgn kuota chat teks, lib/ai-usage-quota.ts)
        // -- tampilkan pesan aslinya, jangan disamakan dgn "tidak menangkap
        // ucapan" yg bikin user bingung dikira mic-nya bermasalah.
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
    setStatus('listening');
    setTranscript("");

    try {
      recorder.start(250); // timeslice 250ms spy ondataavailable ngalir bertahap
    } catch (e) {
      console.warn("Failed starting media recorder:", e);
      setStatus('idle');
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

  // Dulu dipotong keras di 450 karakter (~70-90 kata) -- jawaban AI yg lebih
  // panjang dari itu kepotong di tengah kalimat saat diucapkan, padahal
  // teks penuhnya tetap tampil utuh di subtitle (mismatch: apa yg dibaca
  // beda dgn apa yg didengar). Batas dinaikkan jauh & sekarang dipotong di
  // akhir kalimat terdekat (bukan mentah di tengah kata) kalau memang masih
  // melebihi batas.
  const MAX_SPEAKABLE_CHARS = 1600;

  const cleanTextForPhonetics = (text: string): string => {
    const stripped = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '');

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

    stopAiAudio();
    const cleanText = cleanTextForPhonetics(text);

    if (!cleanText.trim()) {
      setStatus('idle');
      return;
    }

    try {
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: cleanText, languageCode: lang }),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "TTS request failed");
      }
      const audioBlob = await res.blob();
      const url = URL.createObjectURL(audioBlob);
      audioPlayerUrlRef.current = url;

      const audio = new Audio(url);
      audioPlayerRef.current = audio;

      audio.onplay = () => setStatus('speaking');
      audio.onended = () => {
        if (audioPlayerUrlRef.current === url) {
          URL.revokeObjectURL(url);
          audioPlayerUrlRef.current = null;
        }
        setStatus('listening');
        startListening();
      };
      audio.onerror = () => {
        if (audioPlayerUrlRef.current === url) {
          URL.revokeObjectURL(url);
          audioPlayerUrlRef.current = null;
        }
        setStatus('idle');
      };

      await audio.play();
    } catch (err) {
      // audio.play() bisa reject dgn AbortError kalau audio ini SENGAJA
      // dihentikan (barge-in/stopAiAudio() manggil .pause() sebelum promise
      // play() selesai) -- itu bukan kegagalan sungguhan, statusnya sudah
      // benar diurus di tempat lain (startListening() dari barge-in). Cuma
      // set 'idle' kalau audio element ini MASIH yg aktif (error genuine,
      // bukan tersalip proses lain).
      console.warn("TTS playback error:", err);
      if ((err as any)?.name !== "AbortError") {
        setStatus('idle');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0B0C0E]/95 backdrop-blur-2xl text-white p-6 md:p-12 animate-fade-in font-sans">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MyAILogo size="sm" />
          <div className="text-left">
            <h2 className="text-sm font-semibold tracking-wide text-white/90">Bogani AI Voice Mode</h2>
            <p className="text-xs text-cyan-400/80 font-mono">MongondowPedia • Mode Suara Langsung Real-Time</p>
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

      {/* Main Interactive Orb & Visualizer */}
      <div className="flex flex-col items-center justify-center space-y-8 my-auto w-full max-w-xl">
        <div className="relative flex items-center justify-center">
          {/* Dynamic Audio Level Rings */}
          {status === 'listening' && (
            <>
              <div
                className="absolute rounded-full bg-cyan-500/20 transition-all duration-75"
                style={{
                  width: `${160 + audioLevel * 1.5}px`,
                  height: `${160 + audioLevel * 1.5}px`,
                }}
              />
              <div
                className="absolute rounded-full bg-blue-500/15 transition-all duration-100"
                style={{
                  width: `${200 + audioLevel * 2.2}px`,
                  height: `${200 + audioLevel * 2.2}px`,
                }}
              />
            </>
          )}

          {status === 'speaking' && (
            <>
              <div className="absolute w-56 h-56 rounded-full bg-cyan-400/30 animate-pulse" />
              <div className="absolute w-72 h-72 rounded-full bg-blue-500/15 animate-ping" />
            </>
          )}

          {/* Core Interactive Pulsing Orb Button */}
          <button
            onClick={() => {
              if (status === 'listening') {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                  mediaRecorderRef.current.stop();
                }
                setStatus('idle');
              } else {
                startListening();
              }
            }}
            className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 cursor-pointer hover:scale-105 active:scale-95 focus:outline-none ${
              status === 'listening'
                ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/50 scale-105'
                : status === 'processing'
                ? 'bg-gradient-to-br from-amber-400 via-purple-500 to-indigo-600 animate-spin shadow-purple-500/50'
                : status === 'speaking'
                ? 'bg-gradient-to-br from-teal-300 via-cyan-500 to-blue-600 shadow-teal-400/60 scale-110'
                : 'bg-white/10 hover:bg-white/20 shadow-black/50 border border-white/20'
            }`}
            title={status === 'listening' ? "Klik untuk menghentikan" : "Klik mikrofon untuk bicara"}
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
            {status === 'listening' && (lang === 'id' ? 'Mendengarkan Anda...' : 'Listening to you...')}
            {status === 'processing' && (lang === 'id' ? 'Bogani AI sedang berpikir...' : 'Bogani AI is thinking...')}
            {status === 'speaking' && (lang === 'id' ? 'Bogani AI sedang berbicara...' : 'Bogani AI is speaking...')}
            {status === 'idle' && (lang === 'id' ? 'Tekan Mikrofon untuk Mulai' : 'Tap Microphone to Speak')}
          </p>

          {/* User Voice Transcript (muncul setelah STT selesai, bukan live) */}
          {transcript && (
            <p className="text-sm text-cyan-300 italic bg-cyan-950/40 px-4 py-2.5 rounded-xl border border-cyan-800/50 max-h-24 overflow-y-auto shadow-inner">
              &ldquo;{transcript}&rdquo;
            </p>
          )}

          {/* AI Response Subtitles */}
          {status === 'speaking' && aiSpeechText && (
            <p className="text-xs text-white/80 bg-white/5 px-4 py-2 rounded-xl border border-white/10 max-h-28 overflow-y-auto font-sans leading-relaxed">
              {aiSpeechText}
            </p>
          )}

          {/* Permission Blocked Alert Banner & Ask Permission Button */}
          {permissionState === 'denied' && (
            <div className="flex flex-col gap-2.5 text-left text-xs text-rose-300 bg-rose-950/70 p-4 rounded-2xl border border-rose-800/60 shadow-xl animate-fade-in">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="font-semibold text-rose-200">Akses Mikrofon & Speaker Diblokir</p>
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
              <button
                type="button"
                onClick={requestPermission}
                className="mt-1 py-1.5 px-3 rounded-lg bg-rose-900/60 hover:bg-rose-800/80 text-white text-[11px] font-semibold transition-colors flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Ask Permission</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="w-full max-w-md flex items-center justify-center gap-6">
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (!isMuted) {
              stopAiAudio();
            }
          }}
          className={`p-4 rounded-full transition-all duration-200 border ${
            isMuted
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              : 'bg-white/10 text-white border-white/10 hover:bg-white/20'
          }`}
          title={isMuted ? "Unmute AI Voice" : "Mute AI Voice"}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
        </button>

        <button
          onClick={() => {
            if (status === 'listening') {
              if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
              }
              setStatus('idle');
            } else {
              startListening();
            }
          }}
          className={`p-5 rounded-full font-semibold transition-all duration-300 shadow-xl flex items-center gap-2 ${
            status === 'listening'
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-cyan-600/30'
          }`}
        >
          <Mic className="w-6 h-6" />
          <span className="text-sm font-medium px-1">
            {status === 'listening' ? (lang === 'id' ? 'Hentikan' : 'Stop') : (lang === 'id' ? 'Mulai Bicara' : 'Tap to Speak')}
          </span>
        </button>
      </div>
    </div>
  );
}
