'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Vote, Mic, Coins, ArrowLeft } from "lucide-react";
import type { Profile } from "@/lib/ginza-db";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-auth";

export default function VerificatorDashboard({ profile }: { profile: Profile }) {
  const router = useRouter();

  if (profile.role === "user") {
    return <KtpApplicationScreen profile={profile} />;
  }

  return <VerificatorTools profile={profile} />;
}

// ── Layar pengajuan jadi verifikator (role masih 'user') ────────────────

function KtpApplicationScreen({ profile }: { profile: Profile }) {
  const [application, setApplication] = useState<any>(undefined);
  const [fullName, setFullName] = useState(profile.display_name ?? "");
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/public/verificator/apply").then(r => r.json()).then(d => setApplication(d.application));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ktpFile) { setMessage("Pilih foto KTP dulu."); return; }
    setUploading(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    const path = `${profile.id}/${Date.now()}_${ktpFile.name}`;
    const { error: upErr } = await supabase.storage.from("ktp-verifikator").upload(path, ktpFile);
    if (upErr) { setMessage(`Gagal upload KTP: ${upErr.message}`); setUploading(false); return; }

    // Bucket privat — simpan path saja, admin akan buka via signed URL kalau perlu
    const { data: signed } = await supabase.storage.from("ktp-verifikator").createSignedUrl(path, 60 * 60 * 24 * 30);

    const res = await fetch("/api/public/verificator/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ktpImageUrl: signed?.signedUrl ?? path, fullName }),
    });
    setUploading(false);
    if (res.ok) {
      const d = await res.json();
      setApplication(d.application);
      setMessage("Pengajuan terkirim, menunggu review admin.");
    } else {
      setMessage("Gagal mengirim pengajuan.");
    }
  }

  if (application === undefined) return <div className="min-h-screen bg-bento-bg" />;

  return (
    <div className="min-h-screen bg-bento-bg text-bento-text-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-4">
        <a href="/u" className="inline-flex items-center gap-1 text-xs text-bento-text-secondary hover:text-bento-text-primary">
          <ArrowLeft className="h-3 w-3" /> Kembali ke Dashboard
        </a>
        <div className="rounded-2xl border border-bento-border bg-bento-surface p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-bento-accent" />
            <h1 className="text-lg font-bold">Jadi Verifikator</h1>
          </div>

          {application ? (
            <p className="text-sm text-bento-text-secondary">
              Status pengajuan Anda: <strong>{application.status === "pending" ? "Menunggu review admin" : application.status === "approved" ? "Disetujui" : "Ditolak"}</strong>.
              {application.status === "rejected" && application.review_notes && <><br />Catatan: {application.review_notes}</>}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm text-bento-text-secondary">
                Verifikator bertugas memverifikasi kata Kamus, voting kontribusi user, dan melatih Bogani AI melafalkan
                Bahasa Mongondow. Upload foto KTP untuk verifikasi identitas (wajib — hanya admin yang bisa melihatnya).
              </p>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nama lengkap sesuai KTP" required
                className="w-full rounded-lg border border-bento-border bg-bento-bg px-3 py-2 text-sm outline-none focus:border-bento-accent" />
              <input type="file" accept="image/*" onChange={e => setKtpFile(e.target.files?.[0] ?? null)} required
                className="w-full text-xs text-bento-text-secondary" />
              {message && <p className="text-xs text-bento-text-secondary">{message}</p>}
              <button type="submit" disabled={uploading}
                className="w-full rounded-lg bg-bento-accent text-white py-2 text-sm font-medium disabled:opacity-50">
                {uploading ? "Mengirim..." : "Kirim Pengajuan"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tools lengkap utk role 'verificator' / 'admin' ──────────────────────

type Tab = "voting" | "voice" | "usage";

function VerificatorTools({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<Tab>("voting");

  const NAV: { key: Tab; label: string; icon: typeof Vote }[] = [
    { key: "voting", label: "Voting Kontribusi", icon: Vote },
    { key: "voice", label: "Pelatihan Suara AI", icon: Mic },
    { key: "usage", label: "Token Usage Saya", icon: Coins },
  ];

  return (
    <div className="min-h-screen bg-bento-bg text-bento-text-primary flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-bento-border p-4 shrink-0">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="h-5 w-5 text-bento-accent" />
          <div>
            <p className="text-sm font-semibold">Verifikator Dashboard</p>
            <p className="text-[11px] text-bento-text-secondary">{profile.display_name}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-all ${
                tab === key ? "bg-bento-accent-muted text-bento-accent" : "text-bento-text-secondary hover:bg-bento-surface-lighter"
              }`}>
              <Icon className="h-4 w-4 shrink-0" /> {label}
            </button>
          ))}
          <a href="/u" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left text-bento-text-secondary hover:bg-bento-surface-lighter">
            <ArrowLeft className="h-4 w-4 shrink-0" /> Kembali ke User Dashboard
          </a>
        </nav>
      </aside>

      <main className="flex-1 p-6 max-w-3xl">
        {tab === "voting" && <VotingTab profile={profile} />}
        {tab === "voice" && <VoiceTrainingTab profile={profile} />}
        {tab === "usage" && <UsageTab />}
      </main>
    </div>
  );
}

function VotingTab({ profile }: { profile: Profile }) {
  const [items, setItems] = useState<any[] | null>(null);

  function load() {
    fetch("/api/public/verificator/contributions").then(r => r.json()).then(d => setItems(d.contributions ?? []));
  }
  useEffect(() => { load(); }, []);

  async function vote(id: string, v: "approve" | "reject") {
    await fetch("/api/public/verificator/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contributionId: id, vote: v }),
    });
    load();
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Voting Kontribusi</h2>
      <p className="text-sm text-bento-text-secondary mb-4">Butuh 50%+1 suara &quot;setuju&quot; dari seluruh verifikator aktif sebelum admin bisa menerapkannya.</p>
      {!items ? (
        <p className="text-sm text-bento-text-secondary">Memuat...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-bento-text-secondary">Tidak ada kontribusi menunggu voting.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c: any) => {
            const myVote = (c.contribution_votes ?? []).find((v: any) => v.verificator_id === profile.id);
            return (
              <li key={c.id} className="rounded-lg border border-bento-border p-3">
                <p className="text-sm font-medium">{c.proposed_data?.word ?? c.proposed_data?.title}</p>
                <p className="text-xs text-bento-text-secondary mb-2">Oleh {c.profiles?.display_name ?? "user"} · {c.status}</p>
                {c.proposed_data?.meaning && <p className="text-xs mb-2">{c.proposed_data.meaning}</p>}
                {myVote ? (
                  <span className="text-xs font-medium text-bento-accent">Anda sudah vote: {myVote.vote}</span>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => vote(c.id, "approve")} className="px-3 py-1 rounded-lg text-xs bg-bento-accent text-white">Setuju</button>
                    <button onClick={() => vote(c.id, "reject")} className="px-3 py-1 rounded-lg text-xs border border-red-500/30 text-red-400">Tolak</button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function VoiceTrainingTab({ profile }: { profile: Profile }) {
  const [samples, setSamples] = useState<any[] | null>(null);
  const [word, setWord] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    fetch("/api/public/verificator/voice-samples").then(r => r.json()).then(d => setSamples(d.samples ?? []));
  }
  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !word) return;
    setUploading(true);
    setMessage(null);
    const supabase = getSupabaseBrowserClient();
    const path = `${profile.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from("voice-samples").upload(path, file);
    if (upErr) { setMessage(`Gagal upload: ${upErr.message}`); setUploading(false); return; }
    const { data: signed } = await supabase.storage.from("voice-samples").createSignedUrl(path, 60 * 60 * 24 * 30);

    await fetch("/api/public/verificator/voice-samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordOrPhrase: word, audioUrl: signed?.signedUrl ?? path }),
    });
    setUploading(false);
    setWord(""); setFile(null);
    load();
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Pelatihan Suara Bogani AI</h2>
      <p className="text-sm text-bento-text-secondary mb-4">Rekam pelafalan kata/frasa Bahasa Mongondow untuk melatih Bogani AI. Sampel Anda akan direview admin.</p>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md mb-6">
        <input value={word} onChange={e => setWord(e.target.value)} placeholder="Kata / frasa yang direkam" required
          className="w-full rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent" />
        <input type="file" accept="audio/*" onChange={e => setFile(e.target.files?.[0] ?? null)} required className="w-full text-xs text-bento-text-secondary" />
        {message && <p className="text-xs text-red-400">{message}</p>}
        <button type="submit" disabled={uploading} className="rounded-lg bg-bento-accent text-white px-4 py-2 text-sm font-medium disabled:opacity-50">
          {uploading ? "Mengunggah..." : "Kirim Sampel Suara"}
        </button>
      </form>

      {samples && samples.length > 0 && (
        <ul className="space-y-1 text-xs">
          {samples.map((s: any) => (
            <li key={s.id} className="flex justify-between border-b border-bento-border py-1">
              <span>{s.word_or_phrase}</span>
              <span className="text-bento-text-secondary">{s.status}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UsageTab() {
  const [data, setData] = useState<{ usage: any[]; totalTokens: number } | null>(null);

  useEffect(() => {
    fetch("/api/public/token-usage").then(r => r.json()).then(setData);
  }, []);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Token Usage Saya</h2>
      {!data ? (
        <p className="text-sm text-bento-text-secondary">Memuat...</p>
      ) : data.usage.length === 0 ? (
        <p className="text-sm text-bento-text-secondary">Belum ada pemakaian token tercatat.</p>
      ) : (
        <>
          <p className="text-sm mb-3">Total: <strong>{data.totalTokens.toLocaleString("id-ID")}</strong> token</p>
          <ul className="text-xs space-y-1">
            {data.usage.map((u: any) => (
              <li key={u.id} className="flex justify-between border-b border-bento-border py-1">
                <span>{u.provider ?? "-"} · {u.endpoint ?? "-"}</span>
                <span className="font-mono">{u.tokens_used} token</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
