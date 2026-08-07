'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Vote, Mic, Coins, ArrowLeft, Home } from "lucide-react";
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

const EXPERTISE_OPTIONS = [
  { key: "sejarah", label: "Peneliti Sejarah" },
  { key: "aksara", label: "Ahli Aksara/Epigrafi" },
  { key: "bahasa", label: "Ahli Bahasa/Linguistik" },
  { key: "adat_budaya", label: "Tetua/Pemangku Adat & Budaya" },
  { key: "pemerintahan", label: "Pemerintahan Daerah" },
  { key: "pendidikan", label: "Pendidikan/Pengajar" },
  { key: "lainnya", label: "Lainnya" },
];

function KtpApplicationScreen({ profile }: { profile: Profile }) {
  const [application, setApplication] = useState<any>(undefined);
  const [applicantType, setApplicantType] = useState<"warga_bmr" | "peneliti_eksternal">("warga_bmr");
  const [fullName, setFullName] = useState(profile.display_name ?? "");
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [institutionName, setInstitutionName] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [faceFront, setFaceFront] = useState<File | null>(null);
  const [faceLeft, setFaceLeft] = useState<File | null>(null);
  const [faceRight, setFaceRight] = useState<File | null>(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/public/verificator/apply").then(r => r.json()).then(d => setApplication(d.application));
  }, []);

  function toggleExpertise(key: string) {
    setExpertise(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  }

  async function uploadPrivateFile(bucket: string, file: File): Promise<string | null> {
    const supabase = getSupabaseBrowserClient();
    const path = `${profile.id}/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from(bucket).upload(path, file);
    if (upErr) return null;
    const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 30);
    return signed?.signedUrl ?? path;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (applicantType === "peneliti_eksternal" && (!institutionName || !credentialUrl)) {
      setMessage("Isi afiliasi institusi & tautan kredensial dulu.");
      return;
    }
    if (applicantType === "warga_bmr" && !ktpFile) {
      setMessage("Pilih foto KTP dulu.");
      return;
    }
    if (!faceFront || !faceLeft || !faceRight) {
      setMessage("Ambil ketiga foto wajah (depan, kiri, kanan) dulu.");
      return;
    }
    if (!consentGiven) {
      setMessage("Centang dulu persetujuan penyimpanan foto wajah.");
      return;
    }

    setUploading(true);

    let ktpImageUrl: string | null = null;
    if (applicantType === "warga_bmr" && ktpFile) {
      setUploadStage("Mengunggah foto KTP...");
      ktpImageUrl = await uploadPrivateFile("ktp-verifikator", ktpFile);
      if (!ktpImageUrl) { setMessage("Gagal upload foto KTP."); setUploading(false); setUploadStage(null); return; }
    }

    setUploadStage("Mengunggah foto wajah (depan)...");
    const faceFrontUrl = await uploadPrivateFile("verificator-faces", faceFront);
    setUploadStage("Mengunggah foto wajah (kiri)...");
    const faceLeftUrl = await uploadPrivateFile("verificator-faces", faceLeft);
    setUploadStage("Mengunggah foto wajah (kanan)...");
    const faceRightUrl = await uploadPrivateFile("verificator-faces", faceRight);
    if (!faceFrontUrl || !faceLeftUrl || !faceRightUrl) {
      setMessage("Gagal upload salah satu foto wajah.");
      setUploading(false);
      setUploadStage(null);
      return;
    }

    setUploadStage("Memeriksa foto & mengirim pengajuan...");
    const res = await fetch("/api/public/verificator/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicantType, fullName, institutionName, credentialUrl, ktpImageUrl,
        expertise, faceFrontUrl, faceLeftUrl, faceRightUrl, consentGiven,
      }),
    });
    setUploading(false);
    setUploadStage(null);
    if (res.ok) {
      const d = await res.json();
      setApplication(d.application);
      setMessage("Pengajuan terkirim, menunggu review admin.");
    } else {
      const d = await res.json().catch(() => ({}));
      setMessage(d.error || "Gagal mengirim pengajuan.");
    }
  }

  if (application === undefined) return <div className="min-h-screen bg-bento-bg" />;

  return (
    <div className="min-h-screen bg-bento-bg text-bento-text-primary flex items-center justify-center px-4 py-8">
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
                Verifikator bertugas memverifikasi kata Kamus, huruf Aksara, sejarah/adat, dan voting kontribusi. Siapa saja
                boleh mendaftar — dalam maupun luar negeri — tapi status Anda tetap <strong>menunggu</strong> sampai
                dikonfirmasi admin.
              </p>

              <div className="flex rounded-lg border border-bento-border overflow-hidden text-xs font-medium">
                <button type="button" onClick={() => setApplicantType("warga_bmr")}
                  className={`flex-1 py-2 ${applicantType === "warga_bmr" ? "bg-bento-accent text-white" : "bg-bento-bg text-bento-text-secondary"}`}>
                  Warga BMR (KTP)
                </button>
                <button type="button" onClick={() => setApplicantType("peneliti_eksternal")}
                  className={`flex-1 py-2 ${applicantType === "peneliti_eksternal" ? "bg-bento-accent text-white" : "bg-bento-bg text-bento-text-secondary"}`}>
                  Peneliti/Akademisi Eksternal
                </button>
              </div>

              <input value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder={applicantType === "warga_bmr" ? "Nama lengkap sesuai KTP" : "Nama lengkap"} required
                className="w-full rounded-lg border border-bento-border bg-bento-bg px-3 py-2 text-sm outline-none focus:border-bento-accent" />

              {applicantType === "warga_bmr" ? (
                <>
                  <p className="text-xs text-bento-text-secondary">Upload foto KTP untuk verifikasi identitas (wajib — hanya admin yang bisa melihatnya).</p>
                  <input type="file" accept="image/*" onChange={e => setKtpFile(e.target.files?.[0] ?? null)} required
                    className="w-full text-xs text-bento-text-secondary" />
                </>
              ) : (
                <>
                  <input value={institutionName} onChange={e => setInstitutionName(e.target.value)}
                    placeholder="Afiliasi institusi (universitas/lembaga riset)" required
                    className="w-full rounded-lg border border-bento-border bg-bento-bg px-3 py-2 text-sm outline-none focus:border-bento-accent" />
                  <input value={credentialUrl} onChange={e => setCredentialUrl(e.target.value)}
                    placeholder="Tautan kredensial (profil institusi/publikasi/ORCID/Google Scholar)" required
                    className="w-full rounded-lg border border-bento-border bg-bento-bg px-3 py-2 text-sm outline-none focus:border-bento-accent" />
                  <p className="text-xs text-bento-text-secondary">Admin akan meninjau tautan ini secara manual sebagai pengganti KTP.</p>
                </>
              )}

              {/* Spesialisasi keahlian */}
              <div>
                <p className="text-xs font-semibold text-bento-text-secondary mb-1.5">Spesialisasi keahlian (opsional, boleh lebih dari satu)</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXPERTISE_OPTIONS.map(opt => (
                    <button key={opt.key} type="button" onClick={() => toggleExpertise(opt.key)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                        expertise.includes(opt.key)
                          ? "bg-bento-accent text-white border-bento-accent"
                          : "bg-bento-bg text-bento-text-secondary border-bento-border"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Foto wajah wajib */}
              <div className="space-y-1.5 pt-1 border-t border-bento-border">
                <p className="text-xs font-semibold text-bento-text-secondary pt-2">Foto wajah (wajib — depan, kiri, kanan)</p>
                <p className="text-[11px] text-bento-text-secondary">
                  Tersimpan privat, hanya admin yang bisa melihat, dan tidak bisa dihapus/diubah sendiri setelah dikirim.
                  Sistem AI akan memeriksa awal apakah ini foto wajah manusia asli — hasil akhir tetap ditentukan admin.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex flex-col items-center gap-1 text-[10px] text-bento-text-secondary">
                    Depan
                    <input type="file" accept="image/*" capture="user" required
                      onChange={e => setFaceFront(e.target.files?.[0] ?? null)}
                      className="w-full text-[10px]" />
                  </label>
                  <label className="flex flex-col items-center gap-1 text-[10px] text-bento-text-secondary">
                    Kiri
                    <input type="file" accept="image/*" capture="user" required
                      onChange={e => setFaceLeft(e.target.files?.[0] ?? null)}
                      className="w-full text-[10px]" />
                  </label>
                  <label className="flex flex-col items-center gap-1 text-[10px] text-bento-text-secondary">
                    Kanan
                    <input type="file" accept="image/*" capture="user" required
                      onChange={e => setFaceRight(e.target.files?.[0] ?? null)}
                      className="w-full text-[10px]" />
                  </label>
                </div>
              </div>

              <label className="flex items-start gap-2 text-[11px] text-bento-text-secondary pt-1">
                <input type="checkbox" checked={consentGiven} onChange={e => setConsentGiven(e.target.checked)} required
                  className="mt-0.5" />
                <span>
                  Saya setuju foto wajah saya disimpan MongondowPedia sebagai data identitas verifikator, hanya dapat diakses
                  admin, dan tidak dapat saya hapus sendiri.
                </span>
              </label>

              {message && <p className="text-xs text-bento-text-secondary">{message}</p>}
              {uploadStage && <p className="text-xs text-bento-accent">{uploadStage}</p>}
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
          <a href="/" className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left text-bento-text-secondary hover:bg-bento-surface-lighter hover:text-bento-text-primary font-medium">
            <Home className="h-4 w-4 shrink-0 text-blue-400" /> Kembali ke Beranda
          </a>
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

function describeMicError(err: any): string {
  if (err?.name === "NotAllowedError") return "Izin mikrofon diblokir. Klik ikon gembok di URL bar untuk mengizinkan.";
  return `Gagal mengakses mikrofon: ${err?.message || err}`;
}

function VoiceTrainingTab({ profile }: { profile: Profile }) {
  const [samples, setSamples] = useState<any[] | null>(null);
  const [suggested, setSuggested] = useState<string[] | null>(null);
  const [phraseQuery, setPhraseQuery] = useState("");
  const [phraseResults, setPhraseResults] = useState<{ word: string }[]>([]);
  const [word, setWord] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [micUnsupported, setMicUnsupported] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micStreamRef = useRef<MediaStream | null>(null);

  function load() {
    fetch("/api/public/verificator/voice-samples").then(r => r.json()).then(d => setSamples(d.samples ?? []));
  }
  function loadSuggested() {
    fetch("/api/public/verificator/suggested-words?count=8").then(r => r.json()).then(d => setSuggested(d.words ?? []));
  }
  useEffect(() => { load(); loadSuggested(); }, []);

  // Cari frasa/kata dari Kamus yang sudah ada — supaya rekaman terarah
  // (bukan bebas ketik apa saja), sesuai arahan Boss Bayu: "cari 1 frasa,
  // mereka melafalkan itu, kita rekam". Kalau tidak ketemu, tetap bisa pakai
  // teks bebas yang diketik (fallback, mis. utk frasa yang belum ada di Kamus).
  useEffect(() => {
    if (!phraseQuery.trim()) { setPhraseResults([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/kamus?query=${encodeURIComponent(phraseQuery.trim())}&limit=8`)
        .then(r => r.json())
        .then(d => setPhraseResults(d.data ?? []))
        .catch(() => setPhraseResults([]));
    }, 300);
    return () => clearTimeout(t);
  }, [phraseQuery]);

  function resetRecording() {
    setRecordedBlob(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  }

  async function startRecording() {
    setMessage(null);
    resetRecording();
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicUnsupported(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setRecordedBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        micStreamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
    } catch (err: any) {
      setMessage(describeMicError(err));
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!word) { setMessage("Pilih atau ketik dulu kata/frasa yang direkam."); return; }
    const audioSource: Blob | File | null = recordedBlob ?? file;
    if (!audioSource) { setMessage("Rekam langsung atau upload file audio dulu."); return; }

    setUploading(true);
    setMessage(null);
    const supabase = getSupabaseBrowserClient();
    const ext = audioSource instanceof File ? audioSource.name.split(".").pop() || "webm" : "webm";
    const path = `${profile.id}/${Date.now()}_${word.replace(/\s+/g, "_")}.${ext}`;
    const { error: upErr } = await supabase.storage.from("voice-samples").upload(path, audioSource);
    if (upErr) { setMessage(`Gagal upload: ${upErr.message}`); setUploading(false); return; }
    const { data: signed } = await supabase.storage.from("voice-samples").createSignedUrl(path, 60 * 60 * 24 * 30);

    await fetch("/api/public/verificator/voice-samples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordOrPhrase: word, audioUrl: signed?.signedUrl ?? path }),
    });
    setUploading(false);
    setWord(""); setFile(null); setPhraseQuery("");
    resetRecording();
    load();
    loadSuggested();
  }

  return (
    <div>
      <h2 className="text-lg font-bold mb-2">Pelatihan Suara Bogani AI</h2>
      <p className="text-sm text-bento-text-secondary mb-4">
        Cari kata/frasa dari Kamus, lalu rekam pelafalannya langsung dari mikrofon (atau upload file audio). Sampel Anda
        akan direview admin sebelum masuk korpus pelatihan.
      </p>

      <div className="rounded-lg border border-bento-border bg-bento-surface p-3 mb-4 max-w-md">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-bento-text-secondary">Antrian: kata yang belum ada rekamannya</p>
          <button type="button" onClick={loadSuggested} className="text-[11px] text-bento-accent underline">acak ulang</button>
        </div>
        {!suggested ? (
          <p className="text-[11px] text-bento-text-secondary">Memuat saran...</p>
        ) : suggested.length === 0 ? (
          <p className="text-[11px] text-bento-text-secondary">Tidak ada saran saat ini — semua sudah terekam, atau Kamus belum termuat.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {suggested.map(w => (
              <button key={w} type="button"
                onClick={() => { setWord(w); setPhraseQuery(""); setPhraseResults([]); }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  word === w ? "bg-bento-accent text-white border-bento-accent" : "bg-bento-bg border-bento-border text-bento-text-secondary hover:border-bento-accent hover:text-bento-accent"
                }`}>
                {w}
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 max-w-md mb-6">
        <div>
          <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Kata / frasa</label>
          <input
            value={word || phraseQuery}
            onChange={e => { setWord(""); setPhraseQuery(e.target.value); }}
            placeholder="Ketik untuk cari di Kamus, atau tulis frasa bebas..."
            className="w-full rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent"
          />
          {phraseResults.length > 0 && !word && (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {phraseResults.map(r => (
                <button key={r.word} type="button"
                  onClick={() => { setWord(r.word); setPhraseQuery(""); setPhraseResults([]); }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-bento-bg border border-bento-border text-bento-text-secondary hover:border-bento-accent hover:text-bento-accent">
                  {r.word}
                </button>
              ))}
            </div>
          )}
          {word && <p className="text-[11px] text-bento-accent mt-1">Terpilih: &quot;{word}&quot; <button type="button" onClick={() => setWord("")} className="underline">ganti</button></p>}
        </div>

        <div className="rounded-lg border border-bento-border p-3 space-y-2">
          {micUnsupported ? (
            <p className="text-xs text-bento-text-secondary">Browser ini tidak mendukung perekaman mikrofon langsung — gunakan opsi upload file di bawah.</p>
          ) : (
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button type="button" onClick={startRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bento-accent text-white text-xs font-medium">
                  <Mic className="h-3.5 w-3.5" /> Mulai Rekam
                </button>
              ) : (
                <button type="button" onClick={stopRecording}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium animate-pulse">
                  <Mic className="h-3.5 w-3.5" /> Berhenti Rekam
                </button>
              )}
              {previewUrl && <audio controls src={previewUrl} className="h-8" />}
            </div>
          )}
          <div>
            <p className="text-[11px] text-bento-text-secondary mb-1">Atau upload file audio yang sudah ada:</p>
            <input type="file" accept="audio/*" onChange={e => { setFile(e.target.files?.[0] ?? null); resetRecording(); }}
              className="w-full text-xs text-bento-text-secondary" />
          </div>
        </div>

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
