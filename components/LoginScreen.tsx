'use client';

import { useState, useEffect, FormEvent } from "react";
import { Code, Mail, Lock, Globe, Eye, EyeOff, BookOpen, Code2, Layers, FileText, Info, X, ArrowLeft } from "lucide-react";
import { Language } from "@/lib/types";
import { translations } from "@/lib/i18n";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase-client";
import { getHumanErrorMessage } from "@/lib/auth-utils";

export default function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Language>('id');
  const t = translations[lang];

  // Forms
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode === "forgot" || qMode === "register" || qMode === "login") {
      setMode(qMode);
    }
  }, [searchParams]);

  // Submit Handler for all modes
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      if (mode === 'login') {
        // 1. Coba login Supabase Auth terlebih dahulu
        if (supabaseClient) {
          const { data: suData, error: suErr } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
          });

          if (!suErr && suData.session) {
            router.push("/u");
            router.refresh();
            return;
          }
        }

        // 2. Fallback ke API internal login (Admin / Developer Account)
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setError(getHumanErrorMessage(data.error || t.loginError));
        }
      } else if (mode === 'register') {
        if (supabaseClient) {
          const { error: signUpError } = await supabaseClient.auth.signUp({
            email,
            password,
          });
          if (signUpError) {
            setError(getHumanErrorMessage(signUpError));
          } else {
            setInfoMessage("Pendaftaran berhasil! Silakan periksa email Anda untuk mengonfirmasi akun.");
            setMode('login');
          }
        } else {
          setInfoMessage("Pendaftaran akun berhasil dicatat. Silakan masuk.");
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
          setInfoMessage(data.message || "Tautan reset password telah dikirim ke email Anda.");
          setMode('login');
        } else {
          setError(getHumanErrorMessage(data.error || "Gagal memproses reset sandi."));
        }
      }
    } catch (err: any) {
      setError(getHumanErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const [oauthNotice, setOauthNotice] = useState<string | null>(null);

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setError("");
    setInfoMessage("");
    if (provider === 'google') {
      if (supabaseClient) {
        const { error: oauthError } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (oauthError) {
          setError(`Gagal terhubung ke Google: ${oauthError.message}`);
        }
      } else {
        setError("Supabase Client belum terkonfigurasi pada browser.");
      }
    } else {
      setOauthNotice("Maaf Integrasi Facebook sedang dalam proses penyiapan");
    }
  };

  const devResources = [
    { icon: BookOpen, label: lang === 'id' ? "Dokumentasi" : "Documentation", href: "/dokumentasi", isExternal: false },
    { icon: Code2,    label: lang === 'id' ? "Referensi API" : "API Reference", href: "https://console.myai.nexus", isExternal: true },
    { icon: Layers,   label: lang === 'id' ? "Contoh Starter" : "Starter Examples", href: "https://myai.nexus", isExternal: true },
    { icon: FileText, label: lang === 'id' ? "Panduan" : "Guides", href: "/panduan", isExternal: false },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-200 relative overflow-hidden bg-[#060709] text-white">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#5B8DEF]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#2DD4BF]/5 blur-3xl pointer-events-none" />

      {/* Exit CTA Button (Top Left) */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border border-[#1D1E22] bg-[#111214] text-[#9CA3AF] hover:text-white hover:border-gray-700 transition-all shadow-sm group z-20"
        title="Kembali ke Beranda Utama (Exit)"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform text-[#5B8DEF]" />
        <span>Exit</span>
      </Link>

      {/* Language Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <Globe className="h-4 w-4 opacity-50" />
        <button
          onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
          id="login-lang-toggle"
          className="text-xs font-bold px-3 py-1.5 rounded-xl border border-[#1D1E22] bg-[#111214] text-[#9CA3AF] hover:text-white"
        >
          {lang === 'id' ? "English" : "Bahasa Indonesia"}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10" id="login-container">

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105 bg-[#5B8DEF]/10 text-[#5B8DEF]">
            <Code className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">MongondowPedia</h1>
            <p className="text-xs font-semibold tracking-widest uppercase opacity-60 font-mono">Bogani AI • (Abo) </p>
          </div>
          <div className="max-w-xs mx-auto">
            <p className="text-xs text-gray-400 font-medium leading-relaxed">{t.tagline}</p>
          </div>
        </div>

        {/* Login/Register/Forgot Card */}
        <div className="p-8 rounded-3xl border bg-[#111215] border-[#1D1E22] relative" id="login-card">
          <Link
            href="/"
            className="absolute top-5 right-5 p-1.5 rounded-xl bg-[#1C1E24] hover:bg-[#262933] text-gray-400 hover:text-white border border-[#25262B] transition-colors"
            title="Keluar ke Beranda (Exit)"
          >
            <X className="w-4 h-4" />
          </Link>

          <div className="mb-6 pr-6">
            <h2 className="text-base font-bold tracking-tight mb-1" id="login-card-title">
              {mode === 'login' && "Masuk ke MongondowPedia"}
              {mode === 'register' && "Daftar Akun Baru"}
              {mode === 'forgot' && "Lupa Password"}
            </h2>
            <p className="text-xs text-gray-500">
              {mode === 'login' && "Gunakan kredensial Anda untuk melanjutkan"}
              {mode === 'register' && "Buat akun baru untuk mengakses semua fitur Bogani AI."}
              {mode === 'forgot' && "Masukkan email Anda untuk menerima petunjuk reset password."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                <span>⚠️ {error}</span>
              </div>
            )}

            {infoMessage && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                <span>📩 {infoMessage}</span>
              </div>
            )}

            {/* Email Field (all modes) */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500 opacity-60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-1 bg-[#1C1E24] border-[#25262B] text-white focus:ring-[#5B8DEF]"
                />
              </div>
            </div>

            {/* Password Field (login & register only) */}
            {mode !== 'forgot' && (
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot');
                        setError("");
                        setInfoMessage("");
                      }}
                      className="text-xs text-[#5B8DEF] hover:underline font-medium"
                    >
                      Lupa Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-500 opacity-60" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className="w-full pl-10 pr-12 py-2.5 text-sm rounded-xl border focus:outline-none focus:ring-1 bg-[#1C1E24] border-[#25262B] text-white focus:ring-[#5B8DEF]"
                  />
                  {/* Button Intip Password */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? "Sembunyikan password" : "Intip password"}
                    className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-[#5B8DEF]" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-150 bg-[#5B8DEF] hover:bg-[#497BE0] active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? t.loading : (
                  mode === 'login' ? "Masuk Sekarang" :
                  mode === 'register' ? "Daftar Akun Baru" :
                  "Kirim Reset Sandi"
                )}
              </button>

              {/* Notice & Mini CTA Daftar Akun */}
              <div className="text-center text-xs text-gray-400 pt-1">
                {mode === 'login' && (
                  <p className="flex items-center justify-center gap-1.5">
                    <span>Jika Anda belum terdaftar!</span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setError("");
                        setInfoMessage("");
                      }}
                      className="text-emerald-400 font-bold hover:underline"
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
                      setInfoMessage("");
                    }}
                    className="text-[#5B8DEF] font-bold hover:underline"
                  >
                    Kembali ke Login
                  </button>
                )}
              </div>

              {/* Social Login Buttons (Google & Facebook) */}
              {mode === 'login' && (
                <div className="space-y-2 pt-2">
                  <div className="relative flex items-center justify-center">
                    <div className="w-full border-t border-[#25262B]" />
                    <span className="absolute bg-[#111215] px-3 text-[10px] uppercase font-bold text-gray-500">
                      atau masuk dengan
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Google CTA */}
                    <button
                      type="button"
                      onClick={() => handleOAuthLogin('google')}
                      className="w-full py-2.5 rounded-xl font-bold text-xs border border-[#25262B] bg-[#1C1E24] text-white hover:bg-[#252832] flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                      className="w-full py-2.5 rounded-xl font-bold text-xs border border-[#25262B] bg-[#1C1E24] text-white hover:bg-[#252832] flex items-center justify-center gap-2 transition-colors"
                    >
                      <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Facebook</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Developer Resources Grid */}
        <div className="grid grid-cols-4 gap-2" id="dev-resources-grid">
          {devResources.map(resource => {
            const Icon = resource.icon;
            return resource.isExternal ? (
              <a
                key={resource.label}
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl border border-[#1D1E22] bg-[#111214] hover:bg-[#18191E] flex flex-col items-center justify-center gap-1.5 transition-all group text-center"
              >
                <Icon className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#5B8DEF] transition-colors" />
                <span className="text-[10px] font-semibold text-[#9CA3AF] group-hover:text-white transition-colors truncate w-full">{resource.label}</span>
              </a>
            ) : (
              <Link
                key={resource.label}
                href={resource.href}
                className="p-3 rounded-2xl border border-[#1D1E22] bg-[#111214] hover:bg-[#18191E] flex flex-col items-center justify-center gap-1.5 transition-all group text-center"
              >
                <Icon className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#5B8DEF] transition-colors" />
                <span className="text-[10px] font-semibold text-[#9CA3AF] group-hover:text-white transition-colors truncate w-full">{resource.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-4 text-xs text-[#6B7280]">
          <Link href="/terms" className="hover:text-gray-400 transition-colors">
            Syarat & Ketentuan
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">
            Kebijakan Privasi
          </Link>
          <span>•</span>
          <span>© 2026 MongondowPedia™ (Ginza Project) All Rights Reserved</span>
        </div>
      </div>

      {/* Mini Popup Notice for Google / Facebook OAuth Integration */}
      {oauthNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-[#181920] border border-[#2b2d3c] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 relative animate-scale-up overflow-hidden">
            <button
              onClick={() => setOauthNotice(null)}
              className="absolute top-3.5 right-3.5 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-[#252838] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner mt-1">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 px-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Pemberitahuan Integrasi</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-medium">{oauthNotice}</p>
            </div>
            <button
              onClick={() => setOauthNotice(null)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/25 active:scale-95 cursor-pointer"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
