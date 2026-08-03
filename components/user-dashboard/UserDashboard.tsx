'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, MessageSquare, FileCheck2, PlusCircle, LogOut, ShieldCheck } from "lucide-react";
import type { Profile } from "@/lib/ginza-db";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-auth";
import TrendingUsersWidget from "@/components/TrendingUsersWidget";

type Tab = "profil" | "percakapan" | "kontribusi" | "ajukan";

export default function UserDashboard({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profil");

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const NAV: { key: Tab; label: string; icon: typeof User }[] = [
    { key: "profil", label: "Profil Saya", icon: User },
    { key: "percakapan", label: "Riwayat Percakapan AI", icon: MessageSquare },
    { key: "kontribusi", label: "Kontribusi Saya", icon: FileCheck2 },
    { key: "ajukan", label: "Ajukan Kata / Pengetahuan Baru", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-bento-bg text-bento-text-primary flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-bento-border p-4 shrink-0">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-bento-accent to-bento-success flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {(profile.display_name ?? profile.email ?? "U").substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{profile.display_name ?? "Pengguna"}</p>
            <p className="text-[11px] text-bento-text-secondary truncate">{profile.role} · Skor {profile.mongondow_score}</p>
          </div>
        </div>

        <nav className="space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                tab === key ? "bg-bento-accent-muted text-bento-accent" : "text-bento-text-secondary hover:bg-bento-surface-lighter"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" /> {label}
            </button>
          ))}
          {profile.role === "user" && (
            <a href="/verifikator" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left text-bento-text-secondary hover:bg-bento-surface-lighter">
              <ShieldCheck className="h-4 w-4 shrink-0" /> Jadi Verifikator
            </a>
          )}
          {(profile.role === "verificator" || profile.role === "admin") && (
            <a href="/verifikator" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left text-bento-text-secondary hover:bg-bento-surface-lighter">
              <ShieldCheck className="h-4 w-4 shrink-0" /> Verifikator Dashboard
            </a>
          )}
        </nav>

        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 mt-6 rounded-lg text-xs border border-red-500/20 text-red-400 hover:bg-red-500/10">
          <LogOut className="h-4 w-4" /> Keluar
        </button>

        <div className="mt-6">
          <TrendingUsersWidget />
        </div>
      </aside>

      <main className="flex-1 p-6 max-w-3xl">
        {tab === "profil" && <ProfilTab profile={profile} />}
        {tab === "percakapan" && <PercakapanTab />}
        {tab === "kontribusi" && <KontribusiTab />}
        {tab === "ajukan" && <AjukanTab />}
      </main>
    </div>
  );
}

function ProfilTab({ profile }: { profile: Profile }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const supabase = getSupabaseBrowserClient();
    const path = `${profile.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
    } else {
      setMessage(`Gagal upload foto: ${error.message}`);
    }
    setUploading(false);
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
    setMessage(res.ok ? "Profil tersimpan." : "Gagal menyimpan profil.");
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Profil Saya</h2>
      <div className="space-y-4 max-w-md">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover border border-bento-border" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-bento-surface-lighter" />
          )}
          <label className="text-xs text-bento-accent underline cursor-pointer">
            {uploading ? "Mengunggah..." : "Ganti foto"}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>

        <div>
          <label className="text-xs font-medium text-bento-text-secondary">Nama Tampilan</label>
          <input value={displayName} onChange={e => setDisplayName(e.target.value)}
            className="w-full mt-1 rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent" />
        </div>
        <div>
          <label className="text-xs font-medium text-bento-text-secondary">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            className="w-full mt-1 rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent" />
        </div>

        {message && <p className="text-xs text-bento-text-secondary">{message}</p>}

        <button onClick={handleSave} disabled={saving}
          className="rounded-lg bg-bento-accent text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan Profil"}
        </button>
      </div>
    </div>
  );
}

function PercakapanTab() {
  const [conversations, setConversations] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/public/conversations").then(r => r.json()).then(d => setConversations(d.conversations ?? []));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Riwayat Percakapan dengan Bogani AI</h2>
      {!conversations ? (
        <p className="text-sm text-bento-text-secondary">Memuat...</p>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-bento-text-secondary">Belum ada percakapan tersimpan. Mulai ngobrol dengan Bogani AI di halaman utama.</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((c: any) => (
            <li key={c.id} className="rounded-lg border border-bento-border p-3">
              <p className="text-sm font-medium">{c.title ?? "Percakapan tanpa judul"}</p>
              <p className="text-xs text-bento-text-secondary">{new Date(c.updated_at).toLocaleString("id-ID")} · {(c.messages ?? []).length} pesan</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function KontribusiTab() {
  const [items, setItems] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/public/contribute").then(r => r.json()).then(d => setItems(d.contributions ?? []));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4">Kontribusi Saya</h2>
      {!items ? (
        <p className="text-sm text-bento-text-secondary">Memuat...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-bento-text-secondary">Anda belum mengajukan kontribusi apapun.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((c: any) => (
            <li key={c.id} className="rounded-lg border border-bento-border p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{c.proposed_data?.word ?? c.proposed_data?.title ?? "(tanpa judul)"}</p>
                <p className="text-xs text-bento-text-secondary">{c.contribution_type} · {new Date(c.created_at).toLocaleDateString("id-ID")}</p>
              </div>
              <span className="text-xs font-medium">{c.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AjukanTab() {
  const [type, setType] = useState<"kamus_new" | "knowledge_new">("kamus_new");
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const proposedData = type === "kamus_new"
      ? { word, meaning, example }
      : { title, slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), content, category_id: null };

    const res = await fetch("/api/public/contribute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, proposedData }),
    });
    setSubmitting(false);
    if (res.ok) {
      setMessage("Usulan terkirim! Menunggu voting verifikator.");
      setWord(""); setMeaning(""); setExample(""); setTitle(""); setContent("");
    } else {
      const d = await res.json();
      setMessage(`Gagal: ${d.error ?? "kesalahan tidak diketahui"}`);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Ajukan Kata / Pengetahuan Baru</h2>
      <p className="text-sm text-bento-text-secondary mb-4">
        Usulan Anda (kata baru, istilah, pantun/puisi Mongondow, atau artikel pengetahuan) akan direview verifikator
        sebelum masuk ke Kamus/Knowledge resmi.
      </p>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setType("kamus_new")} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${type === "kamus_new" ? "bg-bento-accent text-white border-bento-accent" : "border-bento-border text-bento-text-secondary"}`}>Kata Kamus Baru</button>
        <button onClick={() => setType("knowledge_new")} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${type === "knowledge_new" ? "bg-bento-accent text-white border-bento-accent" : "border-bento-border text-bento-text-secondary"}`}>Artikel Pengetahuan Baru</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
        {type === "kamus_new" ? (
          <>
            <input value={word} onChange={e => setWord(e.target.value)} placeholder="Kata (Bahasa Mongondow)" required
              className="w-full rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent" />
            <textarea value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="Arti / makna" rows={2}
              className="w-full rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent" />
            <input value={example} onChange={e => setExample(e.target.value)} placeholder="Contoh kalimat (opsional)"
              className="w-full rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent" />
          </>
        ) : (
          <>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Judul artikel" required
              className="w-full rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Isi artikel" rows={6} required
              className="w-full rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent" />
          </>
        )}

        {message && <p className="text-xs text-bento-text-secondary">{message}</p>}

        <button type="submit" disabled={submitting}
          className="rounded-lg bg-bento-accent text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
          {submitting ? "Mengirim..." : "Kirim Usulan"}
        </button>
      </form>
    </div>
  );
}
