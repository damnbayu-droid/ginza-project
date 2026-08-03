'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-auth";

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
    const supabase = getSupabaseBrowserClient();
    const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signErr) { setError(signErr.message); return; }
    router.push("/u");
    router.refresh();
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
          <label className="text-xs font-medium text-bento-text-secondary">Kata Sandi</label>
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

        <p className="text-xs text-center text-bento-text-secondary">
          Belum punya akun? <Link href="/akun/daftar" className="text-bento-accent underline">Daftar</Link>
        </p>
      </form>
    </div>
  );
}
