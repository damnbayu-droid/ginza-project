'use client';

import { useState, useEffect } from "react";
import {
  User,
  MessageSquare,
  FileCheck2,
  PlusCircle,
  LogOut,
  ShieldCheck,
  Home,
  History,
  Settings,
  Lock,
  Download,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Sparkles,
  Award,
  Layers,
  Globe
} from "lucide-react";
import type { Profile } from "@/lib/ginza-db";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-auth";
import TrendingUsersWidget from "@/components/TrendingUsersWidget";

type Tab =
  | "profil"
  | "percakapan"
  | "kontribusi"
  | "ajukan"
  | "logs"
  | "pengaturan"
  | "privasi";

export default function UserDashboard({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<Tab>("profil");

  async function handleLogout() {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("[UserDashboard] Supabase signout notice:", e);
    }
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  const NAV: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profil", label: "Profil Saya", icon: User },
    { key: "percakapan", label: "Riwayat Percakapan AI", icon: MessageSquare },
    { key: "kontribusi", label: "Kontribusi Saya", icon: FileCheck2 },
    { key: "ajukan", label: "Ajukan Kata / Pengetahuan", icon: PlusCircle },
    { key: "logs", label: "Logs Aktivitas", icon: History },
    { key: "pengaturan", label: "Pengaturan", icon: Settings },
    { key: "privasi", label: "Privasi & Keamanan", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-bento-bg text-bento-text-primary flex flex-col md:flex-row">
      {/* Sidebar Navigation Panel */}
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-bento-border p-5 shrink-0 bg-bento-surface/50 backdrop-blur-md">
        {/* User Card Info */}
        <div className="flex items-center gap-3.5 mb-6 p-3 rounded-xl bg-bento-surface border border-bento-border">
          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-bento-accent to-bento-success flex items-center justify-center text-white font-bold text-base shrink-0 overflow-hidden shadow-lg shadow-bento-accent/10 border border-white/10">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              (profile.display_name ?? profile.email ?? "U")
                .substring(0, 2)
                .toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-bento-text-primary truncate">
              {profile.display_name ?? profile.email?.split("@")[0] ?? "Pengguna"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bento-accent/15 text-bento-accent border border-bento-accent/20 uppercase tracking-wider">
                {profile.role}
              </span>
              <span className="text-[11px] text-bento-text-secondary font-medium">
                ⭐ {profile.mongondow_score ?? 0} Pts
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                tab === key
                  ? "bg-bento-accent text-white shadow-lg shadow-bento-accent/25 border border-bento-accent/30 font-semibold"
                  : "text-bento-text-secondary hover:bg-bento-surface hover:text-bento-text-primary"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          <div className="pt-3 my-2 border-t border-bento-border/60">
            {profile.role === "user" ? (
              <a
                href="/verifikator"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Daftar Verifikator</span>
              </a>
            ) : (
              <a
                href="/verifikator"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-all"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Portal Verifikator</span>
              </a>
            )}

            <a
              href="/"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 mt-1 rounded-xl text-xs font-medium text-bento-text-secondary hover:bg-bento-surface hover:text-bento-text-primary transition-all"
            >
              <Home className="h-4 w-4 shrink-0 text-bento-accent" />
              <span>Kembali ke Beranda</span>
            </a>
          </div>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 mt-4 rounded-xl text-xs font-medium border border-red-500/20 text-red-400 hover:bg-red-500/15 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar Akun</span>
        </button>

        {/* Real Trending Contributors Widget */}
        <div className="mt-6">
          <TrendingUsersWidget />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 max-w-4xl overflow-y-auto">
        {tab === "profil" && <ProfilTab profile={profile} />}
        {tab === "percakapan" && <PercakapanTab />}
        {tab === "kontribusi" && <KontribusiTab />}
        {tab === "ajukan" && <AjukanTab />}
        {tab === "logs" && <LogsTab />}
        {tab === "pengaturan" && <PengaturanTab />}
        {tab === "privasi" && <PrivasiTab profile={profile} />}
      </main>
    </div>
  );
}

// ── Tab 1: Profil Saya ──────────────────────────────────────────────────
function ProfilTab({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage(null);

    try {
      // 1. Coba kompres file ke Data URL (Base64) agar 100% tersimpan tanpa tergantung bucket storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);

          setAvatarUrl(dataUrl);

          // Simpan langsung ke database profiles
          const res = await fetch("/api/public/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ avatar_url: dataUrl }),
          });

          setUploading(false);
          if (res.ok) {
            setMessage({ type: "success", text: "Foto profil berhasil diperbarui!" });
          } else {
            setMessage({ type: "error", text: "Gagal menyimpan foto ke database." });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploading(false);
      setMessage({ type: "error", text: `Gagal membaca foto: ${err.message}` });
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/public/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, bio, avatar_url: avatarUrl }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage({ type: "success", text: "Profil berhasil diperbarui dan tersimpan!" });
    } else {
      setMessage({ type: "error", text: "Gagal menyimpan profil." });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <User className="h-5 w-5 text-bento-accent" />
          <span>Profil Pengguna</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Kelola informasi nama tampilan, biodata, dan foto profil Anda di MongondowPedia.
        </p>
      </div>

      <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-6 max-w-xl">
        {/* Avatar Upload Container */}
        <div className="flex items-center gap-5 pb-6 border-b border-bento-border/60">
          <div className="relative group">
            <div className="h-20 w-20 rounded-full bg-bento-surface-lighter flex items-center justify-center text-white font-bold text-xl overflow-hidden border-2 border-bento-accent/30 shadow-lg shadow-bento-accent/10">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                (displayName || profile.email || "U").substring(0, 2).toUpperCase()
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-bento-text-primary">Foto Profil</p>
            <div className="flex gap-2">
              <label className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-bento-accent text-white hover:bg-bento-accent/90 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md shadow-bento-accent/20">
                {uploading ? "Mengunggah..." : "Pilih Foto Baru"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={uploading}
                />
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-bento-border text-bento-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  Hapus Foto
                </button>
              )}
            </div>
            <p className="text-[11px] text-bento-text-secondary">
              Format JPG, PNG, atau WEBP (Maksimal 2MB).
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
              Nama Tampilan
            </label>
            <input
              type="text"
              value={displayName ?? ""}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Masukkan nama tampilan Anda"
              className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
              Alamat Email (Akun)
            </label>
            <input
              type="email"
              value={profile.email ?? ""}
              disabled
              className="w-full mt-1.5 rounded-xl border border-bento-border/50 bg-bento-bg/50 px-3.5 py-2.5 text-sm text-bento-text-secondary outline-none cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
              Bio / Deskripsi Diri
            </label>
            <textarea
              value={bio ?? ""}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tuliskan minat Anda mengenai bahasa atau budaya Mongondow..."
              className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent transition-all resize-none"
            />
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-bento-accent text-white font-semibold text-xs shadow-lg shadow-bento-accent/20 hover:bg-bento-accent/90 transition-all disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan Profil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: Riwayat Percakapan AI ───────────────────────────────────────
function PercakapanTab() {
  const [conversations, setConversations] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/public/conversations")
      .then((r) => r.json())
      .then((d) => setConversations(d.conversations ?? []))
      .catch(() => setConversations([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-bento-accent" />
          <span>Riwayat Percakapan Bogani AI</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Daftar sesi obrolan dan pencarian pengetahuan Mongondow yang telah Anda simpan.
        </p>
      </div>

      {!conversations ? (
        <div className="p-8 text-center text-sm text-bento-text-secondary bg-bento-surface rounded-2xl border border-bento-border">
          Memuat riwayat percakapan...
        </div>
      ) : conversations.length === 0 ? (
        <div className="p-8 text-center bg-bento-surface rounded-2xl border border-bento-border space-y-3">
          <Sparkles className="h-8 w-8 text-bento-accent mx-auto opacity-60" />
          <p className="text-sm font-medium text-bento-text-primary">
            Belum ada riwayat percakapan tersimpan.
          </p>
          <p className="text-xs text-bento-text-secondary max-w-sm mx-auto">
            Mulai berdiskusi atau menanyakan kosakata Bahasa Mongondow dengan Bogani AI di halaman utama.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-bento-accent text-white text-xs font-semibold shadow-md shadow-bento-accent/20"
          >
            Mulai Percakapan Baru
          </a>
        </div>
      ) : (
        <div className="grid gap-3">
          {conversations.map((c: any) => (
            <div
              key={c.id}
              className="bg-bento-surface border border-bento-border rounded-2xl p-4 hover:border-bento-accent/40 transition-all flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-bento-text-primary">
                  {c.title ?? "Percakapan Kategori Umum"}
                </p>
                <p className="text-xs text-bento-text-secondary">
                  {new Date(c.updated_at).toLocaleString("id-ID")} ·{" "}
                  {(c.messages ?? []).length} pesan tersimpan
                </p>
              </div>
              <a
                href={`/?session=${c.id}`}
                className="px-3 py-1.5 rounded-xl border border-bento-border text-xs font-medium text-bento-accent hover:bg-bento-accent/10 transition-all"
              >
                Buka Chat
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 3: Kontribusi Saya ─────────────────────────────────────────────
function KontribusiTab() {
  const [items, setItems] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/public/contribute")
      .then((r) => r.json())
      .then((d) => setItems(d.contributions ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-bento-accent" />
          <span>Kontribusi Saya</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Daftar usulan kata, transliterasi, dan artikel yang Anda ajukan ke komunitas.
        </p>
      </div>

      {!items ? (
        <div className="p-8 text-center text-sm text-bento-text-secondary bg-bento-surface rounded-2xl border border-bento-border">
          Memuat daftar kontribusi...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center bg-bento-surface rounded-2xl border border-bento-border space-y-3">
          <BookOpen className="h-8 w-8 text-bento-accent mx-auto opacity-60" />
          <p className="text-sm font-medium text-bento-text-primary">
            Anda belum mengajukan kontribusi apapun.
          </p>
          <p className="text-xs text-bento-text-secondary max-w-sm mx-auto">
            Bantu kembangkan bahasa & ensiklopedia Mongondow dengan mengajukan kata baru atau artikel pengetahuan.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((c: any) => (
            <div
              key={c.id}
              className="bg-bento-surface border border-bento-border rounded-2xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold text-bento-text-primary">
                  {c.proposed_data?.word ?? c.proposed_data?.title ?? "(Tanpa Judul)"}
                </p>
                <p className="text-xs text-bento-text-secondary mt-0.5">
                  Jenis: <span className="uppercase">{c.contribution_type}</span> ·{" "}
                  {new Date(c.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  c.status === "approved"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : c.status === "rejected"
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {c.status === "approved"
                  ? "Disetujui"
                  : c.status === "rejected"
                  ? "Ditolak"
                  : "Menunggu Review"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tab 4: Ajukan Kata / Pengetahuan Baru (Advance & Komprehensif) ──────
function AjukanTab() {
  const [type, setType] = useState<"kamus_new" | "knowledge_new">("kamus_new");
  const [word, setWord] = useState("");
  const [phonetic, setPhonetic] = useState("");
  const [dialect, setDialect] = useState("Lolayan");
  const [wordClass, setWordClass] = useState("Kata Benda");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [reference, setReference] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Sejarah");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const proposedData =
      type === "kamus_new"
        ? { word, phonetic, dialect, word_class: wordClass, meaning, example, reference }
        : {
            title,
            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            category,
            summary,
            content,
            reference,
          };

    try {
      const res = await fetch("/api/public/contribute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, proposedData }),
      });
      setSubmitting(false);

      if (res.ok) {
        setMessage({
          type: "success",
          text: "Usulan baru berhasil diajukan! Usulan Anda telah masuk ke antrean voting Verifikator.",
        });
        setWord(""); setPhonetic(""); setMeaning(""); setExample(""); setReference("");
        setTitle(""); setSummary(""); setContent("");
      } else {
        const d = await res.json();
        setMessage({ type: "error", text: `Gagal: ${d.error ?? "Kesalahan tidak diketahui"}` });
      }
    } catch (err: any) {
      setSubmitting(false);
      setMessage({ type: "error", text: `Terjadi kesalahan: ${err.message}` });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-bento-accent" />
          <span>Ajukan Pengetahuan / Kosakata Baru</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Formulir komprehensif untuk pengajuan kata Bahasa Mongondow, dialek daerah, atau naskah pengetahuan adat.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 p-1.5 bg-bento-surface border border-bento-border rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setType("kamus_new")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            type === "kamus_new"
              ? "bg-bento-accent text-white shadow-md shadow-bento-accent/20"
              : "text-bento-text-secondary hover:text-bento-text-primary"
          }`}
        >
          Kata Kamus Baru
        </button>
        <button
          type="button"
          onClick={() => setType("knowledge_new")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
            type === "knowledge_new"
              ? "bg-bento-accent text-white shadow-md shadow-bento-accent/20"
              : "text-bento-text-secondary hover:text-bento-text-primary"
          }`}
        >
          Artikel Pengetahuan & Adat
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-4 max-w-2xl">
        {type === "kamus_new" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                  Kata (Bahasa Mongondow) *
                </label>
                <input
                  type="text"
                  value={word ?? ""}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Misal: Boluya, Koyag, Komintan"
                  required
                  className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                  Transliterasi / Fonetik (IPA)
                </label>
                <input
                  type="text"
                  value={phonetic ?? ""}
                  onChange={(e) => setPhonetic(e.target.value)}
                  placeholder="Misal: /bo.lu.ja/"
                  className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                  Dialek Wilayah
                </label>
                <select
                  value={dialect ?? "Lolayan"}
                  onChange={(e) => setDialect(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
                >
                  <option value="Lolayan">Lolayan</option>
                  <option value="Kotamobagu">Kotamobagu</option>
                  <option value="Dumoga">Dumoga</option>
                  <option value="Bolaang">Bolaang</option>
                  <option value="Passi">Passi</option>
                  <option value="Umum">Umum / Semua Dialek</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                  Kelas Kata
                </label>
                <select
                  value={wordClass ?? "Kata Benda"}
                  onChange={(e) => setWordClass(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
                >
                  <option value="Kata Benda">Kata Benda (Nomena)</option>
                  <option value="Kata Kerja">Kata Kerja (Verba)</option>
                  <option value="Kata Sifat">Kata Sifat (Adjektiva)</option>
                  <option value="Kata Keterangan">Kata Keterangan (Adverba)</option>
                  <option value="Ungkapan Adat">Ungkapan Adat / Bahasa Halus</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                Arti & Definisi Makna *
              </label>
              <textarea
                value={meaning ?? ""}
                onChange={(e) => setMeaning(e.target.value)}
                rows={3}
                placeholder="Penjelasan arti kata dalam Bahasa Indonesia..."
                required
                className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent resize-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                Contoh Kalimat Penggunaan
              </label>
              <input
                type="text"
                value={example ?? ""}
                onChange={(e) => setExample(e.target.value)}
                placeholder="Misal: Aku mogu'ug kon komintan (Mongondow & Artinya)"
                className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                Sumber / Referensi Naskah Adat
              </label>
              <input
                type="text"
                value={reference ?? ""}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Misal: Tutur lisan Tetua Adat Kotabunan / Buku Kamus Dunnebier 1951"
                className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                Judul Artikel Pengetahuan *
              </label>
              <input
                type="text"
                value={title ?? ""}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul artikel pengetahuan atau sejarah Mongondow"
                required
                className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                  Kategori
                </label>
                <select
                  value={category ?? "Sejarah"}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
                >
                  <option value="Sejarah">Sejarah & Kerajaan</option>
                  <option value="Adat & Falsafah">Adat & Falsafah (Palu'an)</option>
                  <option value="Silsilah Raja">Silsilah & Tokoh</option>
                  <option value="Bahasa & Sastra">Bahasa & Sastra (Itum-Itum)</option>
                  <option value="Seni & Tradisi">Seni & Tari Tradisional</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                  Sumber Referensi
                </label>
                <input
                  type="text"
                  value={reference ?? ""}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Misal: Catatan sejarah lokal"
                  className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                Ringkasan / Abstrak Singkat
              </label>
              <input
                type="text"
                value={summary ?? ""}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Penjelasan ringkas isi artikel..."
                className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
                Isi Artikel Lengkap (Markdown) *
              </label>
              <textarea
                value={content ?? ""}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="Tuliskan ulasan lengkap pengetahuan dalam format Markdown..."
                required
                className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent resize-none font-mono"
              />
            </div>
          </>
        )}

        {message && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-bento-accent text-white font-semibold text-xs shadow-lg shadow-bento-accent/25 hover:bg-bento-accent/90 transition-all disabled:opacity-50"
        >
          {submitting ? "Mengirimkan Usulan..." : "Kirim Usulan Komprehensif"}
        </button>
      </form>
    </div>
  );
}

// ── Tab 5: Logs Aktivitas (Immutable & Human-Readable) ─────────────────
function LogsTab() {
  const [logs, setLogs] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/public/logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .catch(() => setLogs([]));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <History className="h-5 w-5 text-bento-accent" />
          <span>Logs Aktivitas Pengguna (Immutable)</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Catatan audit permanen yang membaca aktivitas otentikasi, pengajuan kata, dan interaksi Anda.
        </p>
      </div>

      {!logs ? (
        <div className="p-8 text-center text-sm text-bento-text-secondary bg-bento-surface rounded-2xl border border-bento-border">
          Memuat logs aktivitas...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center bg-bento-surface rounded-2xl border border-bento-border text-sm text-bento-text-secondary">
          Belum ada catatan aktivitas tercatat.
        </div>
      ) : (
        <div className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-4">
          <div className="divide-y divide-bento-border/60">
            {logs.map((log: any) => (
              <div key={log.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-bento-accent/15 border border-bento-accent/30 text-bento-accent flex items-center justify-center shrink-0 mt-0.5">
                  <History className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-bento-text-primary">
                      {log.title}
                    </p>
                    <span className="text-[11px] text-bento-text-secondary">
                      {new Date(log.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <p className="text-xs text-bento-text-secondary mt-0.5">
                    {log.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab 6: Pengaturan (Settings) ───────────────────────────────────────
function PengaturanTab() {
  const [lang, setLang] = useState("id");
  const [aiDetail, setAiDetail] = useState("detail");
  const [emailNotif, setEmailNotif] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <Settings className="h-5 w-5 text-bento-accent" />
          <span>Pengaturan Akun & Preferensi</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Atur bahasa antarmuka, preferensi Bogani AI, dan notifikasi platform.
        </p>
      </div>

      <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-5 max-w-xl">
        <div>
          <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-bento-accent" />
            Bahasa Antarmuka
          </label>
          <select
            value={lang ?? "id"}
            onChange={(e) => setLang(e.target.value)}
            className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
          >
            <option value="id">Bahasa Indonesia</option>
            <option value="mog">Basa Mongondow (Lokal)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-bento-accent" />
            Gaya Respon Bogani AI
          </label>
          <select
            value={aiDetail ?? "detail"}
            onChange={(e) => setAiDetail(e.target.value)}
            className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
          >
            <option value="detail">Komprehensif & Beretimologi Lengkap</option>
            <option value="singkat">Singkat & Langsung ke Poin Utama</option>
            <option value="daerah">Dominan Gunakan Basa Mongondow</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-bento-border/60">
          <div>
            <p className="text-xs font-bold text-bento-text-primary">Notifikasi Email</p>
            <p className="text-[11px] text-bento-text-secondary">
              Terima pemberitahuan saat usulan kata Anda disetujui verifikator.
            </p>
          </div>
          <input
            type="checkbox"
            checked={emailNotif}
            onChange={(e) => setEmailNotif(e.target.checked)}
            className="h-4 w-4 rounded accent-bento-accent"
          />
        </div>
      </div>
    </div>
  );
}

// ── Tab 7: Privasi & Keamanan ──────────────────────────────────────────
function PrivasiTab({ profile }: { profile: Profile }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "Konfirmasi kata sandi baru tidak cocok." });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg({ type: "error", text: "Kata sandi minimal 6 karakter." });
      return;
    }

    setChangingPwd(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: oldPassword, newPassword }),
      });
      setChangingPwd(false);

      if (res.ok) {
        setPwdMsg({ type: "success", text: "Kata sandi berhasil diperbarui!" });
        setOldPassword(""); setNewPassword(""); setConfirmPassword("");
      } else {
        const d = await res.json();
        setPwdMsg({ type: "error", text: d.error ?? "Gagal mengubah kata sandi." });
      }
    } catch (err: any) {
      setChangingPwd(false);
      setPwdMsg({ type: "error", text: `Error: ${err.message}` });
    }
  }

  function handleExportData() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mongondowpedia_user_${profile.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <Lock className="h-5 w-5 text-bento-accent" />
          <span>Privasi & Keamanan Akun</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Kelola kredensial kata sandi, unduh salinan data pribadi, dan keamanan sesi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ubah Password Form */}
        <form onSubmit={handleChangePassword} className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-bento-text-primary flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-bento-accent" />
            Ubah Kata Sandi
          </h3>

          <div>
            <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
              Kata Sandi Lama
            </label>
            <input
              type="password"
              value={oldPassword ?? ""}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              value={newPassword ?? ""}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-bento-text-secondary uppercase tracking-wider">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              value={confirmPassword ?? ""}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
            />
          </div>

          {pwdMsg && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                pwdMsg.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              {pwdMsg.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={changingPwd}
            className="w-full py-2.5 rounded-xl bg-bento-accent text-white font-semibold text-xs shadow-md shadow-bento-accent/20 hover:bg-bento-accent/90 transition-all disabled:opacity-50"
          >
            {changingPwd ? "Memperbarui..." : "Perbarui Kata Sandi"}
          </button>
        </form>

        {/* Ekspor & Hak Data Privasi */}
        <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-bento-text-primary flex items-center gap-2">
              <Download className="h-4 w-4 text-bento-accent" />
              Ekspor Data Pribadi
            </h3>
            <p className="text-xs text-bento-text-secondary leading-relaxed">
              Sesuai kebijakan perlindungan data pribadi, Anda dapat mengunduh seluruh salinan data profil, skor, dan riwayat aktivitas Anda dalam format JSON.
            </p>
          </div>

          <button
            onClick={handleExportData}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-xs font-semibold text-bento-text-primary hover:border-bento-accent transition-all"
          >
            <Download className="h-4 w-4 text-bento-accent" />
            <span>Unduh File JSON Data Saya</span>
          </button>
        </div>
      </div>
    </div>
  );
}
