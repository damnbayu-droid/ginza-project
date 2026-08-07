'use client';

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-auth";
import { getHumanErrorMessage } from "@/lib/auth-utils";

export default function DaftarPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    });
    setLoading(false);
    if (signErr) { setError(getHumanErrorMessage(signErr)); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bento-bg text-bento-text-primary px-4">
        <div className="max-w-sm text-center space-y-3">
          <h1 className="text-xl font-bold">Cek email Anda</h1>
          <p className="text-sm text-bento-text-secondary">
            Kami sudah kirim link konfirmasi ke <strong>{email}</strong>. Klik link tersebut lalu{" "}
            <Link href="/akun/masuk" className="text-bento-accent underline">masuk di sini</Link>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bento-bg text-bento-text-primary px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-2xl border border-bento-border bg-bento-surface p-6">
        <div>
          <h1 className="text-xl font-bold">Daftar MongondowPedia</h1>
          <p className="text-sm text-bento-text-secondary mt-1">Buat akun untuk berkontribusi kata, pengetahuan, dan mengobrol dengan Bogani AI.</p>
        </div>

        <div>
          <label className="text-xs font-medium text-bento-text-secondary">Nama Tampilan</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)} required
            className="w-full mt-1 rounded-lg border border-bento-border bg-bento-bg px-3 py-2 text-sm outline-none focus:border-bento-accent" />
        </div>
        <div>
          <label className="text-xs font-medium text-bento-text-secondary">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            className="w-full mt-1 rounded-lg border border-bento-border bg-bento-bg px-3 py-2 text-sm outline-none focus:border-bento-accent" />
        </div>
        <div>
          <label className="text-xs font-medium text-bento-text-secondary">Kata Sandi</label>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
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
          {loading ? "Mendaftar..." : "Daftar"}
        </button>

        <p className="text-xs text-center text-bento-text-secondary">
          Sudah punya akun? <Link href="/akun/masuk" className="text-bento-accent underline">Masuk</Link>
        </p>
        <p className="text-[11px] text-center text-bento-text-secondary opacity-60">
          Login Google akan tersedia setelah deploy — untuk sekarang gunakan email & kata sandi.
        </p>
      </form>
    </div>
  );
}
