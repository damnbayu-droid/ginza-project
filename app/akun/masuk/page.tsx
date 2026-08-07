'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-auth";
import { getHumanErrorMessage } from "@/lib/auth-utils";

export default function MasukPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Coba login via Supabase Auth
    const supabase = getSupabaseBrowserClient();
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    if (!signErr) {
      setLoading(false);
      router.push("/u");
      router.refresh();
      return;
    }

    // 2. Fallback ke sistem login internal (untuk akun Developer / Admin)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.success) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
    } catch {
      // ignore
    }

    setLoading(false);
    setError(getHumanErrorMessage(signErr));
  }

  async function handleGoogleLogin() {
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (oauthError) setError(getHumanErrorMessage(oauthError));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bento-bg text-bento-text-primary px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-bento-border bg-bento-surface p-6">
        <div>
          <h1 className="text-xl font-bold">Masuk MongondowPedia</h1>
          <p className="text-sm text-bento-text-secondary mt-1">Akses dashboard, riwayat obrolan Bogani AI, dan kontribusi Anda.</p>
        </div>

        <div>
          <label className="text-xs font-medium text-bento-text-secondary">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full mt-1 rounded-lg border border-bento-border bg-bento-bg px-3 py-2 text-sm outline-none focus:border-bento-accent" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-bento-text-secondary">Kata Sandi</label>
            <Link href="/login?mode=forgot" className="text-[11px] text-blue-400 hover:underline">
              Lupa kata sandi?
            </Link>
          </div>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-bento-border bg-bento-bg pl-3 pr-10 py-2 text-sm outline-none focus:border-bento-accent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bento-text-secondary hover:text-bento-text-primary transition-colors p-1"
              title={showPassword ? "Sembunyikan password" : "Intip password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-bento-accent" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full rounded-lg bg-bento-accent text-white py-2 text-sm font-medium disabled:opacity-50">
          {loading ? "Masuk..." : "Masuk"}
        </button>

        <div className="relative flex items-center justify-center py-1">
          <div className="w-full border-t border-bento-border" />
          <span className="absolute bg-bento-surface px-3 text-[10px] uppercase font-bold text-bento-text-secondary">
            atau
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full rounded-lg border border-bento-border bg-bento-bg text-bento-text-primary py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-bento-surface transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Masuk dengan Google
        </button>

        <p className="text-xs text-center text-bento-text-secondary">
          Belum punya akun? <Link href="/akun/daftar" className="text-bento-accent underline">Daftar</Link>
        </p>
      </form>
    </div>
  );
}
