'use client';

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Volume2, Loader2 } from "lucide-react";
import MyAILogo from "./MyAILogo";

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceMessage: (text: string) => Promise<string>;
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
  const [isMuted, setIsMuted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

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
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // no-op: recognition may already be stopped
      }
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setStatus('idle');
  };

  const startListening = async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(lang === 'id' ? "Browser Anda tidak mendukung Speech Recognition (Gunakan Chrome, Edge, atau Safari)." : "Your browser does not support Speech Recognition.");
      setStatus('idle');
      return;
    }

    // Request microphone access explicitly to trigger browser permission popup if needed
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err: any) {
        setErrorMessage(lang === 'id' ? "Izin Mikrofon ditolak. Harap izinkan akses mikrofon di browser Anda." : "Microphone permission denied. Please allow microphone in browser.");
        setStatus('idle');
        return;
      }
    }

    setErrorMessage("");
    setStatus('listening');
    setTranscript("");

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
        setErrorMessage(lang === 'id' ? "Izin Mikrofon diblokir. Klik ikon gembok di URL bar browser Anda untuk mengizinkan." : "Microphone permission blocked. Please allow mic in browser address bar.");
      } else if (event.error !== 'no-speech') {
        setErrorMessage(lang === 'id' ? "Gagal mendeteksi suara, silakan coba lagi." : "Speech recognition error, please try again.");
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

    recognition.start();
  };

  const handleProcessVoiceInput = async (spokenText: string) => {
    setStatus('processing');
    try {
      const response = await onSendVoiceMessage(spokenText);
      speakResponse(response);
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses pesan suara");
      setStatus('idle');
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current || isMuted) {
      setStatus('idle');
      return;
    }

    synthRef.current.cancel();

    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .slice(0, 350);

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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0d0e12]/95 backdrop-blur-xl text-white p-6 md:p-12 animate-fade-in">
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MyAILogo size="sm" />
          <div className="text-left">
            <h2 className="text-sm font-semibold tracking-wide text-white/90">Bogani AI Voice Mode</h2>
            <p className="text-xs text-white/50">MongondowPedia • Mode Suara Langsung</p>
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

      <div className="flex flex-col items-center justify-center space-y-8 my-auto">
        <div className="relative flex items-center justify-center">
          {status === 'listening' && (
            <>
              <div className="absolute w-48 h-48 rounded-full bg-blue-500/20 animate-ping" />
              <div className="absolute w-64 h-64 rounded-full bg-blue-600/10 animate-pulse" />
            </>
          )}

          {status === 'speaking' && (
            <>
              <div className="absolute w-52 h-52 rounded-full bg-cyan-500/30 animate-pulse" />
              <div className="absolute w-72 h-72 rounded-full bg-blue-500/10 animate-ping" />
            </>
          )}

          <div
            className={`relative w-36 h-36 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
              status === 'listening'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/50 scale-105'
                : status === 'processing'
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600 animate-spin shadow-purple-500/50'
                : status === 'speaking'
                ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-500/50 scale-110'
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

        <div className="text-center space-y-2 max-w-md px-4">
          <p className="text-lg font-medium text-white/90">
            {status === 'listening' && (lang === 'id' ? 'Mendengarkan Anda...' : 'Listening to you...')}
            {status === 'processing' && (lang === 'id' ? 'Bogani AI sedang berpikir...' : 'Bogani AI is thinking...')}
            {status === 'speaking' && (lang === 'id' ? 'Bogani AI sedang berbicara...' : 'Bogani AI is speaking...')}
            {status === 'idle' && (lang === 'id' ? 'Tekan Mikrofon untuk Mulai' : 'Tap Microphone to Speak')}
          </p>

          {transcript && (
            <p className="text-sm text-blue-300 italic bg-blue-950/40 px-4 py-2 rounded-xl border border-blue-800/40 max-h-24 overflow-y-auto">
              &ldquo;{transcript}&rdquo;
            </p>
          )}

          {errorMessage && (
            <p className="text-xs text-rose-400 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-800/40">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

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
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
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
