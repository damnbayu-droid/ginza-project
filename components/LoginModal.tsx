'use client';

import { useState, FormEvent } from "react";
import { Mail, Lock, Eye, EyeOff, X, ArrowRight, UserPlus, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { supabaseClient } from "@/lib/supabase-client";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setMessage("Login berhasil! Memuat halaman...");
          setTimeout(() => {
            if (onSuccess) onSuccess();
            onClose();
            window.location.reload();
          }, 800);
        } else {
          setError(data.error || "Email atau password salah.");
        }
      } else if (mode === 'register') {
        if (supabaseClient) {
          const { error: signUpError } = await supabaseClient.auth.signUp({
            email,
            password,
          });
          if (signUpError) {
            setError(signUpError.message);
          } else {
            setMessage("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi akun.");
            setMode('login');
          }
        } else {
          setMessage("Akun Anda telah dicatat untuk pendaftaran. Silakan login.");
          setMode('login');
        }
      } else if (mode === 'forgot') {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setMessage(data.message || "Tautan reset password telah dikirim ke email Anda.");
          setMode('login');
        } else {
          setError(data.error || "Gagal memproses reset password.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan koneksi server.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setError("");
    setMessage("");
    if (supabaseClient) {
      const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (oauthError) {
        setError(`Gagal terhubung ke ${provider}: ${oauthError.message}`);
      }
    } else {
      setError(`Provider ${provider} sedang dikonfigurasi pada Supabase Gateway.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md bg-[#121318] border border-[#262833] rounded-3xl p-6 md:p-8 shadow-2xl text-white space-y-6 animate-scale-up overflow-hidden">
        
        {/* Decorative Ambient Background */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header & Close Button */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' && "Masuk ke MongondowPedia"}
              {mode === 'register' && "Daftar Akun Baru"}
              {mode === 'forgot' && "Lupa Password"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {mode === 'login' && "Gunakan email dan password Anda untuk melanjutkan."}
              {mode === 'register' && "Buat akun baru untuk mengakses semua fitur Bogani AI."}
              {mode === 'forgot' && "Masukkan email Anda untuk menerima petunjuk reset password."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#20222e] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#1a1c24] border border-[#2b2e3c] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-white placeholder-gray-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Input (Login & Register) */}
          {mode !== 'forgot' && (
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError("");
                      setMessage("");
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium"
                  >
                    Lupa Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-[#1a1c24] border border-[#2b2e3c] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-white placeholder-gray-500 transition-all outline-none"
                />
                {/* Button Intip Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Sembunyikan password" : "Intip password"}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors p-0.5 rounded"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Submit CTA Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] font-bold text-sm text-white transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="animate-pulse">Memproses...</span>
            ) : (
              <>
                <span>
                  {mode === 'login' && "Masuk Sekarang"}
                  {mode === 'register' && "Daftar Akun Baru"}
                  {mode === 'forgot' && "Kirim Tautan Reset"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Registration Helper Notice */}
        <div className="pt-2 text-center text-xs text-gray-400 border-t border-[#262833]/60 space-y-1">
          {mode === 'login' && (
            <p className="flex items-center justify-center gap-1.5">
              <span>Jika Anda belum terdaftar!</span>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError("");
                  setMessage("");
                }}
                className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
              >
                Daftar Akun
              </button>
            </p>
          )}

          {(mode === 'register' || mode === 'forgot') && (
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError("");
                setMessage("");
              }}
              className="text-blue-400 hover:text-blue-300 font-bold hover:underline"
            >
              Kembali ke Login
            </button>
          )}
        </div>

        {/* OAuth Buttons (Google & Facebook) */}
        {mode === 'login' && (
          <div className="space-y-2.5 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-[#262833]" />
              <span className="absolute bg-[#121318] px-3 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                atau masuk dengan
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Google CTA */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="py-2.5 px-3 rounded-xl bg-[#1a1c24] hover:bg-[#232632] border border-[#2b2e3c] hover:border-gray-500 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Google</span>
              </button>

              {/* Facebook CTA */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('facebook')}
                className="py-2.5 px-3 rounded-xl bg-[#1a1c24] hover:bg-[#232632] border border-[#2b2e3c] hover:border-gray-500 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
