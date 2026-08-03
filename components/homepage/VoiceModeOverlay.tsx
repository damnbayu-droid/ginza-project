'use client';

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Volume2, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import MyAILogo from "./MyAILogo";

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceMessage: (text: string, isVoiceInput?: boolean) => Promise<string>;
  lang: 'id' | 'en';
}

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

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

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

    startListening();

    return () => {
      stopVoiceSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const stopVoiceSession = () => {
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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setStatus('idle');
    setAudioLevel(0);
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

        // VAD / Barge-in: if AI is speaking and user starts talking loudly, cancel AI speech
        if (normalized > 35 && synthRef.current?.speaking) {
          synthRef.current.cancel();
          setStatus('listening');
        }

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (e) {
      console.warn("Audio analyser setup warning:", e);
    }
  };

  const startListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        lang === 'id'
          ? "Browser Anda tidak mendukung Speech Recognition (Gunakan Chrome, Edge, atau Safari)."
          : "Your browser does not support Speech Recognition."
      );
      setStatus('idle');
      return;
    }

    // Stop TTS if speaking when user starts talking
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    // 1. Request microphone access with high quality audio constraints
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        micStreamRef.current = stream;
        setPermissionState('granted');
        setupAudioAnalyser(stream);
      } catch (err: any) {
        console.warn("Microphone permission denied:", err);
        setPermissionState('denied');
        setErrorMessage(
          lang === 'id'
            ? "Izin Mikrofon diblokir. Klik ikon gembok di URL bar browser Anda untuk mengizinkan akses mikrofon."
            : "Microphone access blocked. Click the lock icon in your browser URL bar to allow microphone."
        );
        setStatus('idle');
        return;
      }
    }

    setErrorMessage("");
    setStatus('listening');
    setTranscript("");

    // 2. Start Web Speech Recognition
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'id' ? 'id-ID' : 'en-US';

    recognition.onresult = (event: any) => {
      let currentText = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        currentText += event.results[i][0].transcript;
      }
      setTranscript(currentText);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setPermissionState('denied');
        setErrorMessage(
          lang === 'id'
            ? "Izin Mikrofon diblokir. Klik ikon gembok di URL bar browser Anda untuk mengizinkan."
            : "Microphone permission blocked. Please allow mic in browser address bar."
        );
      } else if (event.error !== 'no-speech') {
        setErrorMessage(
          lang === 'id'
            ? "Gagal mendeteksi suara, silakan coba lagi."
            : "Speech recognition error, please try again."
        );
      }
      setStatus('idle');
    };

    recognition.onend = async () => {
      setTranscript((current) => {
        if (current && current.trim().length > 0) {
          handleProcessVoiceInput(current);
        } else {
          setStatus('idle');
        }
        return current;
      });
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn("Failed starting speech recognition:", e);
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

  const cleanTextForPhonetics = (text: string): string => {
    return text
      .replace(/[*_#`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/Mongondow/gi, 'Mong-gon-dow')
      .replace(/Bolaang/gi, 'Bo-la-ang')
      .replace(/Bogani/gi, 'Bo-ga-ni')
      .slice(0, 450);
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current || isMuted) {
      setStatus('idle');
      return;
    }

    synthRef.current.cancel();
    const cleanText = cleanTextForPhonetics(text);

    if (!cleanText.trim()) {
      setStatus('idle');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'id' ? 'id-ID' : 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setStatus('speaking');
    };

    utterance.onend = () => {
      setStatus('listening');
      startListening();
    };

    utterance.onerror = () => {
      setStatus('idle');
    };

    synthRef.current.speak(utterance);
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

          {/* Core Pulsing Orb */}
          <div
            className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
              status === 'listening'
                ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/50 scale-105'
                : status === 'processing'
                ? 'bg-gradient-to-br from-amber-400 via-purple-500 to-indigo-600 animate-spin shadow-purple-500/50'
                : status === 'speaking'
                ? 'bg-gradient-to-br from-teal-300 via-cyan-500 to-blue-600 shadow-teal-400/60 scale-110'
                : 'bg-white/10 shadow-black/50'
            }`}
          >
            {status === 'processing' ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : status === 'speaking' ? (
              <Volume2 className="w-12 h-12 text-white animate-bounce" />
            ) : (
              <Mic className={`w-12 h-12 text-white ${status === 'listening' ? 'animate-pulse' : ''}`} />
            )}
          </div>
        </div>

        {/* Status Text & Subtitle Transcripts */}
        <div className="text-center space-y-3 max-w-md px-4">
          <p className="text-lg font-medium tracking-wide text-white/95">
            {status === 'listening' && (lang === 'id' ? 'Mendengarkan Anda...' : 'Listening to you...')}
            {status === 'processing' && (lang === 'id' ? 'Bogani AI sedang berpikir...' : 'Bogani AI is thinking...')}
            {status === 'speaking' && (lang === 'id' ? 'Bogani AI sedang berbicara...' : 'Bogani AI is speaking...')}
            {status === 'idle' && (lang === 'id' ? 'Tekan Mikrofon untuk Mulai' : 'Tap Microphone to Speak')}
          </p>

          {/* User Live Voice Transcript */}
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

          {/* Permission Blocked Alert Banner */}
          {permissionState === 'denied' && (
            <div className="flex items-start gap-2 text-left text-xs text-rose-300 bg-rose-950/60 p-3.5 rounded-xl border border-rose-800/60">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Akses Mikrofon Diblokir</p>
                <p className="text-rose-300/90 text-[11px] mt-0.5">
                  Klik ikon gembok (🔒) di URL bar browser <code className="bg-black/40 px-1 py-0.5 rounded text-rose-200">localhost:3005</code> lalu ubah Izin Mikrofon ke <strong>Izinkan (Allow)</strong>.
                </p>
              </div>
            </div>
          )}

          {errorMessage && permissionState !== 'denied' && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-rose-400 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-800/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="w-full max-w-md flex items-center justify-center gap-6">
        <button
          onClick={() => {
            setIsMuted(!isMuted);
            if (synthRef.current && !isMuted) {
              synthRef.current.cancel();
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
              if (recognitionRef.current) recognitionRef.current.stop();
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
