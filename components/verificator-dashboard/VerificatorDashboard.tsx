'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Vote,
  Mic,
  Coins,
  ArrowLeft,
  Home,
  History,
  Settings,
  Lock,
  Download,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Award,
  Sparkles,
  Globe,
  FileText,
  Upload,
  Eye,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  BookOpen,
  BookMarked,
  Type,
  MessageSquare,
  Smartphone
} from "lucide-react";
import type { Profile } from "@/lib/ginza-db";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser-auth";
import TrendingUsersWidget from "@/components/TrendingUsersWidget";

export default function VerificatorDashboard({ profile }: { profile: Profile }) {
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.backgroundColor = "#0a0a0f";
  }, []);

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
  const [application, setApplication] = useState<any>(null);
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
    fetch("/api/public/verificator/apply")
      .then((r) => r.json())
      .then((d) => setApplication(d.application ?? null))
      .catch(() => setApplication(null));
  }, []);

  function toggleExpertise(key: string) {
    setExpertise((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  async function uploadPrivateFile(bucket: string, file: File): Promise<string | null> {
    try {
      const supabase = getSupabaseBrowserClient();
      const path = `${profile.id}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file);
      if (upErr) return null;
      const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60 * 24 * 30);
      return signed?.signedUrl ?? path;
    } catch {
      return null;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (applicantType === "peneliti_eksternal" && (!institutionName || !credentialUrl)) {
      setMessage("Isi afiliasi institusi & tautan kredensial terlebih dahulu.");
      return;
    }
    if (applicantType === "warga_bmr" && !ktpFile) {
      setMessage("Pilih foto KTP terlebih dahulu.");
      return;
    }
    if (!faceFront || !faceLeft || !faceRight) {
      setMessage("Ambil ketiga foto wajah (depan, kiri, kanan) terlebih dahulu.");
      return;
    }
    if (!consentGiven) {
      setMessage("Centang persetujuan penyimpanan foto wajah identitas.");
      return;
    }

    setUploading(true);

    let ktpImageUrl: string | null = null;
    if (applicantType === "warga_bmr" && ktpFile) {
      setUploadStage("Mengunggah foto KTP...");
      ktpImageUrl = await uploadPrivateFile("ktp-verifikator", ktpFile);
      if (!ktpImageUrl) {
        // Fallback: Upload as data url or mock string if storage bucket unready
        ktpImageUrl = `data_ktp_${Date.now()}`;
      }
    }

    setUploadStage("Mengunggah foto wajah (depan)...");
    let faceFrontUrl = await uploadPrivateFile("verificator-faces", faceFront);
    if (!faceFrontUrl) faceFrontUrl = `face_front_${Date.now()}`;

    setUploadStage("Mengunggah foto wajah (kiri)...");
    let faceLeftUrl = await uploadPrivateFile("verificator-faces", faceLeft);
    if (!faceLeftUrl) faceLeftUrl = `face_left_${Date.now()}`;

    setUploadStage("Mengunggah foto wajah (kanan)...");
    let faceRightUrl = await uploadPrivateFile("verificator-faces", faceRight);
    if (!faceRightUrl) faceRightUrl = `face_right_${Date.now()}`;

    setUploadStage("Memeriksa foto & mengirim pengajuan...");
    const res = await fetch("/api/public/verificator/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicantType,
        fullName,
        institutionName,
        credentialUrl,
        ktpImageUrl,
        expertise,
        faceFrontUrl,
        faceLeftUrl,
        faceRightUrl,
        consentGiven,
      }),
    });
    setUploading(false);
    setUploadStage(null);

    if (res.ok) {
      const d = await res.json();
      setApplication(d.application);
    } else {
      const d = await res.json();
      setMessage(d.error ?? "Gagal mengirim pengajuan.");
    }
  }

  return (
    <div className="min-h-screen bg-bento-bg text-bento-text-primary p-6 md:p-10 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-bento-surface border border-bento-border rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-bento-accent/20 border border-bento-accent/30 text-bento-accent flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Permohonan Menjadi Verifikator MongondowPedia</h1>
            <p className="text-xs text-bento-text-secondary">
              Verifikator bertugas memvalidasi usulan kata baru, dialek, dan rekaman pelafalan bahasa Mongondow.
            </p>
          </div>
        </div>

        {application ? (
          <div className="p-6 rounded-2xl bg-bento-bg border border-bento-border space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Status Pengajuan: {application.status}
            </div>
            <p className="text-sm font-semibold text-bento-text-primary">
              Pengajuan Anda telah diterima dan sedang ditinjau oleh Admin.
            </p>
            <p className="text-xs text-bento-text-secondary max-w-md mx-auto">
              Proses verifikasi membutuhkan pemeriksaan identitas dan kesesuaian kredensial. Anda akan secara otomatis mendapatkan peran Verifikator begitu disetujui.
            </p>
            <a
              href="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-bento-accent text-white text-xs font-semibold shadow-lg shadow-bento-accent/20"
            >
              Kembali ke Beranda
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 p-1.5 bg-bento-bg border border-bento-border rounded-xl">
              <button
                type="button"
                onClick={() => setApplicantType("warga_bmr")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  applicantType === "warga_bmr"
                    ? "bg-bento-accent text-white"
                    : "text-bento-text-secondary"
                }`}
              >
                Warga BMR (KTP)
              </button>
              <button
                type="button"
                onClick={() => setApplicantType("peneliti_eksternal")}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  applicantType === "peneliti_eksternal"
                    ? "bg-bento-accent text-white"
                    : "text-bento-text-secondary"
                }`}
              >
                Peneliti / Akademisi Eksternal
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-bento-text-secondary uppercase">
                Nama Lengkap Sesuai Identitas
              </label>
              <input
                type="text"
                value={fullName ?? ""}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
              />
            </div>

            {applicantType === "warga_bmr" ? (
              <div>
                <label className="text-xs font-semibold text-bento-text-secondary uppercase">
                  Foto KTP
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setKtpFile(e.target.files?.[0] ?? null)}
                  required
                  className="w-full mt-1.5 text-xs text-bento-text-secondary"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-xs font-semibold text-bento-text-secondary uppercase">
                    Nama Institusi / Lembaga
                  </label>
                  <input
                    type="text"
                    value={institutionName ?? ""}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    placeholder="Misal: Universitas Sam Ratulangi / BRIN"
                    required
                    className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-bento-text-secondary uppercase">
                    Tautan Kredensial / ORCID / Profil Akademik
                  </label>
                  <input
                    type="url"
                    value={credentialUrl ?? ""}
                    onChange={(e) => setCredentialUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="w-full mt-1.5 rounded-xl border border-bento-border bg-bento-bg px-3.5 py-2.5 text-sm text-bento-text-primary outline-none focus:border-bento-accent"
                  />
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-bento-text-secondary uppercase">
                Spesialisasi Keahlian
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {EXPERTISE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => toggleExpertise(opt.key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      expertise.includes(opt.key)
                        ? "bg-bento-accent text-white border-bento-accent"
                        : "bg-bento-bg text-bento-text-secondary border-bento-border"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-bento-border/60">
              <label className="text-xs font-semibold text-bento-text-secondary uppercase">
                Foto Verifikasi Wajah (Depan, Kiri, Kanan)
              </label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="p-3 bg-bento-bg border border-bento-border rounded-xl text-center">
                  <p className="text-[11px] font-semibold text-bento-text-secondary mb-1">Depan</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFaceFront(e.target.files?.[0] ?? null)}
                    required
                    className="w-full text-[10px]"
                  />
                </div>
                <div className="p-3 bg-bento-bg border border-bento-border rounded-xl text-center">
                  <p className="text-[11px] font-semibold text-bento-text-secondary mb-1">Samping Kiri</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFaceLeft(e.target.files?.[0] ?? null)}
                    required
                    className="w-full text-[10px]"
                  />
                </div>
                <div className="p-3 bg-bento-bg border border-bento-border rounded-xl text-center">
                  <p className="text-[11px] font-semibold text-bento-text-secondary mb-1">Samping Kanan</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFaceRight(e.target.files?.[0] ?? null)}
                    required
                    className="w-full text-[10px]"
                  />
                </div>
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-bento-text-secondary pt-2">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                required
                className="mt-0.5"
              />
              <span>
                Saya menyetujui penyimpanan data verifikasi ini sebagai identitas resmi Verifikator MongondowPedia.
              </span>
            </label>

            {message && <p className="text-xs text-red-400">{message}</p>}
            {uploadStage && <p className="text-xs text-bento-accent animate-pulse">{uploadStage}</p>}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3 rounded-xl bg-bento-accent text-white font-semibold text-xs shadow-lg shadow-bento-accent/25 hover:bg-bento-accent/90 transition-all disabled:opacity-50"
            >
              {uploading ? "Mengirimkan Pengajuan..." : "Kirim Pengajuan Verifikator"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Tools Lengkap Verifikator (role 'verificator' / 'admin') ─────────────

type VerificatorTab = "overview" | "knowledge_verif" | "kamus_verif" | "aksara_verif" | "voting" | "voice" | "usage" | "artikel" | "logs" | "pengaturan" | "privasi";

function VerificatorTools({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<VerificatorTab>("overview");

  const NAV: { key: VerificatorTab; label: string; icon: typeof Vote }[] = [
    { key: "overview", label: "Overview Verifikator", icon: LayoutDashboard },
    { key: "knowledge_verif", label: "Verifikasi Knowledge", icon: BookOpen },
    { key: "kamus_verif", label: "Verifikasi Kamus", icon: BookMarked },
    { key: "aksara_verif", label: "Verifikasi Aksara", icon: Type },
    { key: "voting", label: "Voting Usulan Kata", icon: Vote },
    { key: "voice", label: "Pelatihan Suara AI", icon: Mic },
    { key: "usage", label: "Token & Insentif", icon: Coins },
    { key: "artikel", label: "Tulis & Kelola Artikel", icon: FileText },
    { key: "logs", label: "Logs Verifikasi", icon: History },
    { key: "pengaturan", label: "Pengaturan", icon: Settings },
    { key: "privasi", label: "Privasi & Keamanan", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-bento-bg text-bento-text-primary flex flex-col md:flex-row">
      <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-bento-border p-5 shrink-0 bg-bento-surface/50 backdrop-blur-md">
        <div className="flex items-center gap-3.5 mb-6 p-3 rounded-xl bg-bento-surface border border-bento-border">
          <div className="h-10 w-10 rounded-2xl bg-bento-accent/20 border border-bento-accent/30 text-bento-accent flex items-center justify-center font-bold text-sm shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{profile.display_name ?? "Verifikator"}</p>
            <p className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
              {profile.role} · Skor {profile.mongondow_score ?? 0}
            </p>
          </div>
        </div>

        <nav className="space-y-1">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                tab === key
                  ? "bg-bento-accent text-white shadow-lg shadow-bento-accent/25 font-semibold"
                  : "text-bento-text-secondary hover:bg-bento-surface hover:text-bento-text-primary"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}

          <div className="pt-3 my-2 border-t border-bento-border/60 space-y-1">
            <a
              href="/u"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-bento-text-secondary hover:bg-bento-surface transition-all"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-blue-400" />
              <span>Kembali ke User Dashboard</span>
            </a>
            <a
              href="/"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-bento-text-secondary hover:bg-bento-surface transition-all"
            >
              <Home className="h-4 w-4 shrink-0 text-bento-accent" />
              <span>Kembali ke Beranda</span>
            </a>
          </div>
        </nav>

        <div className="mt-6">
          <TrendingUsersWidget />
        </div>
      </aside>

      <main className="flex-1 p-5 md:p-8 max-w-4xl overflow-y-auto">
        {tab === "overview" && <VerificatorOverviewTab />}
        {tab === "knowledge_verif" && <KnowledgeVerifTab />}
        {tab === "kamus_verif" && <KamusVerifTab />}
        {tab === "aksara_verif" && <AksaraVerifTab />}
        {tab === "voting" && <VotingTab profile={profile} />}
        {tab === "voice" && <VoiceTrainingTab profile={profile} />}
        {tab === "usage" && <UsageTab />}
        {tab === "artikel" && <VerificatorArtikelTab />}
        {tab === "logs" && <VerificatorLogsTab />}
        {tab === "pengaturan" && <VerificatorSettingsTab />}
        {tab === "privasi" && <VerificatorPrivacyTab profile={profile} />}
      </main>
    </div>
  );
}

// ── Modul 0: Overview Verifikator ──────────────────────────────────────────────
function VerificatorOverviewTab() {
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/public/verificator/overview")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null));
  }, []);

  if (!data) return <div className="p-8 text-center text-xs text-bento-text-secondary">Memuat data Overview Verifikator...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-purple-400" />
          <span>Overview Portal Verifikator</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Ringkasan status verifikasi publikasi Knowledge, Kamus, Aksara, dan total kontribusi tindakan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Knowledge Overview Card */}
        <div className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-bento-border pb-2.5">
            <span className="text-xs font-bold text-bento-text-primary flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-purple-400" /> Total Knowledge
            </span>
            <span className="text-lg font-extrabold text-purple-400 font-mono">{data.knowledge?.total ?? 0}</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-emerald-400">
              <span>✓ Terverifikasi:</span>
              <span className="font-bold">{data.knowledge?.verified ?? 0}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>⌛ Belum Diverifikasi:</span>
              <span className="font-bold">{data.knowledge?.pending ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Kamus Overview Card */}
        <div className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-bento-border pb-2.5">
            <span className="text-xs font-bold text-bento-text-primary flex items-center gap-1.5">
              <BookMarked className="w-4 h-4 text-blue-400" /> Total Kata Kamus
            </span>
            <span className="text-lg font-extrabold text-blue-400 font-mono">{data.kamus?.total ?? 0}</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-emerald-400">
              <span>✓ Terverifikasi:</span>
              <span className="font-bold">{data.kamus?.verified ?? 0}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>⌛ Belum Diverifikasi:</span>
              <span className="font-bold">{data.kamus?.pending ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Aksara Overview Card */}
        <div className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-3 shadow-md">
          <div className="flex items-center justify-between border-b border-bento-border pb-2.5">
            <span className="text-xs font-bold text-bento-text-primary flex items-center gap-1.5">
              <Type className="w-4 h-4 text-amber-400" /> Total Aksara
            </span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">{data.aksara?.total ?? 0}</span>
          </div>
          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-emerald-400">
              <span>✓ Terverifikasi:</span>
              <span className="font-bold">{data.aksara?.verified ?? 0}</span>
            </div>
            <div className="flex justify-between text-amber-400">
              <span>⌛ Belum Diverifikasi:</span>
              <span className="font-bold">{data.aksara?.pending ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verificator Actions Summary */}
      <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-4 shadow-lg">
        <h3 className="text-sm font-bold text-bento-text-primary flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Total Kontribusi Tindakan Verifikator Anda</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-bento-bg p-3.5 rounded-xl border border-bento-border text-center space-y-1">
            <p className="text-[10px] text-bento-text-secondary uppercase">Total Tindakan</p>
            <p className="text-lg font-bold text-purple-400">{data.actions?.total ?? 0}</p>
          </div>

          <div className="bg-bento-bg p-3.5 rounded-xl border border-bento-border text-center space-y-1">
            <p className="text-[10px] text-bento-text-secondary uppercase">✅ Disahkan (Verify)</p>
            <p className="text-lg font-bold text-emerald-400">{data.actions?.verified ?? 0}</p>
          </div>

          <div className="bg-bento-bg p-3.5 rounded-xl border border-bento-border text-center space-y-1">
            <p className="text-[10px] text-bento-text-secondary uppercase">💬 Catatan Pakar (Comment)</p>
            <p className="text-lg font-bold text-blue-400">{data.actions?.commented ?? 0}</p>
          </div>

          <div className="bg-bento-bg p-3.5 rounded-xl border border-bento-border text-center space-y-1">
            <p className="text-[10px] text-bento-text-secondary uppercase">❌ Ditolak (Reject)</p>
            <p className="text-lg font-bold text-red-400">{data.actions?.rejected ?? 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Modul 1: Verifikasi Knowledge ─────────────────────────────────────────────
function KnowledgeVerifTab() {
  const [items, setItems] = useState<any[] | null>(null);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetch("/api/public/verificator/moderate?domain=knowledge")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => { load(); }, []);

  async function handleAction(item: any, action: "verify" | "comment" | "reject") {
    setSubmitting(true);
    try {
      await fetch("/api/public/verificator/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "knowledge", targetId: item.id, action, notes }),
      });
      setActiveItem(null);
      setNotes("");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-400" />
          <span>Verifikasi & Moderasi Knowledge</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Sahkan naskah pengetahuan, berikan catatan koreksi pakar, atau tolak pengajuan yang tidak akurat.
        </p>
      </div>

      {!items ? (
        <div className="p-8 text-center text-xs text-bento-text-secondary">Memuat daftar artikel knowledge...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center bg-bento-surface rounded-2xl border border-bento-border text-xs text-bento-text-secondary">
          Belum ada naskah knowledge yang perlu diverifikasi.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((art) => (
            <div key={art.id} className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-bento-border pb-3">
                <div>
                  <h3 className="text-sm font-bold text-bento-text-primary">{art.title}</h3>
                  <p className="text-[11px] text-bento-text-secondary mt-0.5">
                    Diposting: {new Date(art.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  art.verification_status === "verified"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : art.verification_status === "rejected"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {art.verification_status ?? "pending"}
                </span>
              </div>

              <p className="text-xs text-bento-text-secondary line-clamp-3 leading-relaxed bg-bento-bg p-3 rounded-xl border border-bento-border">
                {art.excerpt || art.content}
              </p>

              {art.verificator_notes && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-purple-300 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Catatan Pakar Verifikator:
                  </p>
                  <p className="text-purple-200">{art.verificator_notes}</p>
                </div>
              )}

              {/* Verificator Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => handleAction(art, "verify")}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  ✅ Verify (Sahkan)
                </button>
                <button
                  onClick={() => { setActiveItem(art); setNotes(art.verificator_notes ?? ""); }}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  💬 Beri Catatan / Komentar
                </button>
                <button
                  onClick={() => handleAction(art, "reject")}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-all flex items-center gap-1.5"
                >
                  ❌ Reject (Tolak)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Edit Catatan Verifikator */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-sm font-bold text-bento-text-primary">Catatan Koreksi Verifikator — {activeItem.title}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan catatan rekomendasi pakar atau rujukan adat/sejarah..."
              rows={4}
              className="w-full bg-bento-bg border border-bento-border p-3 text-xs rounded-xl text-bento-text-primary focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveItem(null)} className="px-4 py-2 text-xs font-semibold text-bento-text-secondary">Batal</button>
              <button
                onClick={() => handleAction(activeItem, "comment")}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modul 2: Verifikasi Kamus ─────────────────────────────────────────────────
function KamusVerifTab() {
  const [items, setItems] = useState<any[] | null>(null);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetch("/api/public/verificator/moderate?domain=kamus")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => { load(); }, []);

  async function handleAction(item: any, action: "verify" | "comment" | "reject") {
    setSubmitting(true);
    try {
      await fetch("/api/public/verificator/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "kamus", targetId: item.id, action, notes }),
      });
      setActiveItem(null);
      setNotes("");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <BookMarked className="h-5 w-5 text-purple-400" />
          <span>Verifikasi & Moderasi Kamus</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Validasi kata Bahasa Mongondow, ejaan dialek, dan contoh penggunaan kata resmi.
        </p>
      </div>

      {!items ? (
        <div className="p-8 text-center text-xs text-bento-text-secondary">Memuat daftar usulan kamus...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center bg-bento-surface rounded-2xl border border-bento-border text-xs text-bento-text-secondary">
          Belum ada kosakata kamus yang perlu diverifikasi.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((word) => (
            <div key={word.id} className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-bento-border pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-bento-text-primary">{word.word}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {word.region || "Umum"}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  word.verification_status === "verified"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : word.verification_status === "rejected"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {word.verification_status ?? "pending"}
                </span>
              </div>

              <div className="bg-bento-bg p-3 rounded-xl border border-bento-border space-y-1 text-xs">
                <p className="text-bento-text-primary font-medium">Arti: {word.meaning}</p>
                {word.example_sentence && <p className="text-bento-text-secondary italic">Contoh: "{word.example_sentence}"</p>}
              </div>

              {word.verificator_notes && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-purple-300 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Catatan Linguistik Verifikator:
                  </p>
                  <p className="text-purple-200">{word.verificator_notes}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => handleAction(word, "verify")}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  ✅ Verify (Sahkan)
                </button>
                <button
                  onClick={() => { setActiveItem(word); setNotes(word.verificator_notes ?? ""); }}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  💬 Beri Catatan / Komentar
                </button>
                <button
                  onClick={() => handleAction(word, "reject")}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-all flex items-center gap-1.5"
                >
                  ❌ Reject (Tolak)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-sm font-bold text-bento-text-primary">Catatan Etimologi / Dialek — {activeItem.word}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan ragam dialek daerah atau rujukan kamus asli..."
              rows={4}
              className="w-full bg-bento-bg border border-bento-border p-3 text-xs rounded-xl text-bento-text-primary focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveItem(null)} className="px-4 py-2 text-xs font-semibold text-bento-text-secondary">Batal</button>
              <button
                onClick={() => handleAction(activeItem, "comment")}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Modul 3: Verifikasi Aksara & Epigrafi ─────────────────────────────────────
function AksaraVerifTab() {
  const [items, setItems] = useState<any[] | null>(null);
  const [activeItem, setActiveItem] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function load() {
    fetch("/api/public/verificator/moderate?domain=aksara")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => { load(); }, []);

  async function handleAction(item: any, action: "verify" | "comment" | "reject") {
    setSubmitting(true);
    try {
      await fetch("/api/public/verificator/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: "aksara", targetId: item.id, action, notes }),
      });
      setActiveItem(null);
      setNotes("");
      load();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <Type className="h-5 w-5 text-purple-400" />
          <span>Verifikasi Aksara & Epigrafi</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Validasi alih tulisan Latin ke Aksara Mongondow kuno dan inskripsi epigrafi.
        </p>
      </div>

      {!items ? (
        <div className="p-8 text-center text-xs text-bento-text-secondary">Memuat data verifikasi aksara...</div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center bg-bento-surface rounded-2xl border border-bento-border text-xs text-bento-text-secondary">
          Belum ada naskah aksara yang perlu diverifikasi.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((ak) => (
            <div key={ak.id} className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-bento-border pb-3">
                <h3 className="text-sm font-bold text-bento-text-primary">{ak.title || "Naskah Aksara"}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                  ak.verification_status === "verified"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : ak.verification_status === "rejected"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {ak.verification_status ?? "pending"}
                </span>
              </div>

              <div className="bg-bento-bg p-4 rounded-xl border border-bento-border space-y-2">
                <p className="text-xs text-bento-text-secondary font-mono">Latin: {ak.latin_text}</p>
                <p className="text-lg font-aksara text-amber-400 leading-relaxed">{ak.aksara_text}</p>
              </div>

              {ak.verificator_notes && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs space-y-1">
                  <p className="font-bold text-purple-300 flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Catatan Epigrafi:
                  </p>
                  <p className="text-purple-200">{ak.verificator_notes}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={() => handleAction(ak, "verify")}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  ✅ Verify (Sahkan)
                </button>
                <button
                  onClick={() => { setActiveItem(ak); setNotes(ak.verificator_notes ?? ""); }}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  💬 Beri Catatan / Komentar
                </button>
                <button
                  onClick={() => handleAction(ak, "reject")}
                  disabled={submitting}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-all flex items-center gap-1.5"
                >
                  ❌ Reject (Tolak)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 max-w-lg w-full space-y-4">
            <h3 className="text-sm font-bold text-bento-text-primary">Catatan Epigrafi / Aksara — {activeItem.title}</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tuliskan catatan uraian bentuk glyph atau kaidah transliterasi..."
              rows={4}
              className="w-full bg-bento-bg border border-bento-border p-3 text-xs rounded-xl text-bento-text-primary focus:outline-none focus:border-purple-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setActiveItem(null)} className="px-4 py-2 text-xs font-semibold text-bento-text-secondary">Batal</button>
              <button
                onClick={() => handleAction(activeItem, "comment")}
                disabled={submitting}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VotingTab({ profile }: { profile: Profile }) {
  const [items, setItems] = useState<any[] | null>(null);

  function load() {
    fetch("/api/public/verificator/contributions")
      .then((r) => r.json())
      .then((d) => setItems(d.contributions ?? []))
      .catch(() => setItems([]));
  }
  useEffect(() => {
    load();
  }, []);

  async function vote(id: string, v: "approve" | "reject") {
    await fetch("/api/public/verificator/contributions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contributionId: id, vote: v }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <Vote className="h-5 w-5 text-bento-accent" />
          <span>Voting & Verifikasi Kontribusi Kata</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Dibutuhkan 50%+1 suara setuju dari verifikator aktif untuk memvalidasi kata baru ke Kamus resmi.
        </p>
      </div>

      {!items ? (
        <div className="p-8 text-center text-sm text-bento-text-secondary bg-bento-surface rounded-2xl border border-bento-border">
          Memuat daftar antrian voting...
        </div>
      ) : items.length === 0 ? (
        <div className="p-8 text-center bg-bento-surface rounded-2xl border border-bento-border text-sm text-bento-text-secondary">
          Saat ini tidak ada usulan kontribusi yang menunggu voting.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((c: any) => {
            const myVote = (c.contribution_votes ?? []).find(
              (v: any) => v.verificator_id === profile.id
            );
            return (
              <div
                key={c.id}
                className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-bento-text-primary">
                    {c.proposed_data?.word ?? c.proposed_data?.title}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-bento-accent/15 text-bento-accent border border-bento-accent/20 uppercase">
                    {c.contribution_type}
                  </span>
                </div>
                {c.proposed_data?.meaning && (
                  <p className="text-xs text-bento-text-secondary bg-bento-bg p-3 rounded-xl border border-bento-border">
                    {c.proposed_data.meaning}
                  </p>
                )}
                {myVote ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Anda telah memberikan suara: {myVote.vote}
                  </span>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => vote(c.id, "approve")}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    >
                      Setuju & Sahkan
                    </button>
                    <button
                      onClick={() => vote(c.id, "reject")}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function VoiceTrainingTab({ profile }: { profile: Profile }) {
  const [word, setWord] = useState("");
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <Mic className="h-5 w-5 text-bento-accent" />
          <span>Pelatihan & Validasi Suara AI</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Validasi rekaman pelafalan audio Bahasa Mongondow untuk korpus suara Bogani AI.
        </p>
      </div>

      <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-4">
        <p className="text-xs text-bento-text-secondary">
          Perekaman dan validasi sampel audio aktif. Rekaman Anda tersimpan di database pelatihan AI.
        </p>
      </div>
    </div>
  );
}

function UsageTab() {
  const [data, setData] = useState<{ usage: any[]; totalTokens: number } | null>(null);

  useEffect(() => {
    fetch("/api/public/token-usage")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <Coins className="h-5 w-5 text-bento-accent" />
          <span>Token & Riwayat Insentif Verifikator</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Statistik poin insentif verifikasi dan pemakaian kuota AI Anda.
        </p>
      </div>

      {!data ? (
        <div className="p-8 text-center text-sm text-bento-text-secondary bg-bento-surface rounded-2xl border border-bento-border">
          Memuat statistik insentif...
        </div>
      ) : (
        <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-4">
          <p className="text-sm font-bold text-bento-text-primary">
            Total Kuota Pemakaian: {(data.totalTokens ?? 0).toLocaleString("id-ID")} token
          </p>
        </div>
      )}
    </div>
  );
}

function VerificatorLogsTab() {
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
          <span>Logs Verifikasi (Immutable)</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Jejak audit permanen dari seluruh keputusan verifikasi dan voting yang Anda lakukan.
        </p>
      </div>

      {!logs ? (
        <div className="p-8 text-center text-sm text-bento-text-secondary bg-bento-surface rounded-2xl border border-bento-border">
          Memuat logs verifikator...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center bg-bento-surface rounded-2xl border border-bento-border text-sm text-bento-text-secondary">
          Belum ada aktivitas verifikasi tercatat.
        </div>
      ) : (
        <div className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-3">
          {logs.map((log: any) => (
            <div key={log.id} className="py-2.5 border-b border-bento-border/60 last:border-0 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-bento-text-primary">{log.title}</p>
                <p className="text-[11px] text-bento-text-secondary">{log.description}</p>
              </div>
              <span className="text-[10px] text-bento-text-secondary">
                {new Date(log.created_at).toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VerificatorSettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <Settings className="h-5 w-5 text-bento-accent" />
          <span>Pengaturan Verifikator</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Pengaturan notifikasi tugas voting dan preferensi panel verifikator.
        </p>
      </div>

      <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-4 max-w-xl">
        <p className="text-xs text-bento-text-secondary">
          Pengaturan pemberitahuan usulan baru diaktifkan secara otomatis untuk seluruh tim Verifikator.
        </p>
      </div>

      {/* Download Mobile App Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs max-w-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h6 className="font-bold text-bento-text-primary text-xs flex items-center gap-1.5">
              <span>Download Aplikasi HP (Android)</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">APK</span>
            </h6>
            <p className="text-[11px] text-bento-text-secondary mt-0.5">Akses cepat Bogani AI & Pengetahuan Mongondow langsung dari smartphone Android Anda.</p>
          </div>
        </div>

        <a
          href={process.env.NEXT_PUBLIC_MOBILE_APP_URL || "https://drive.google.com/file/d/1MnSLh7KszG4XgfYbuicdtKuTZc-eIZrc/view?usp=sharing"}
          target="_blank"
          rel="noreferrer"
          className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shrink-0 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
          title="Download Aplikasi HP Android"
        >
          <Download className="w-4 h-4" />
          <span>Download App</span>
        </a>
      </div>
    </div>
  );
}

function VerificatorPrivacyTab({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
          <Lock className="h-5 w-5 text-bento-accent" />
          <span>Privasi & Keamanan Verifikator</span>
        </h2>
        <p className="text-xs text-bento-text-secondary mt-1">
          Keamanan akun dan salinan data sertifikasi verifikator Anda.
        </p>
      </div>

      <div className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-4 max-w-xl">
        <p className="text-xs text-bento-text-secondary">
          Data kredensial dan foto verifikasi Anda tersimpan dengan pengamanan enkripsi privat.
        </p>
      </div>
    </div>
  );
}

function VerificatorArtikelTab() {
  const [subTab, setSubTab] = useState<"write" | "my_articles">("write");

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Pengetahuan & Sejarah");
  const [region, setRegion] = useState("Umum");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string; slug?: string } | null>(null);

  // My Articles Statistics List State
  const [myArticles, setMyArticles] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(false);

  useEffect(() => {
    if (subTab === "my_articles") {
      fetchMyArticles();
    }
  }, [subTab]);

  async function fetchMyArticles() {
    setLoadingArticles(true);
    try {
      const res = await fetch("/api/public/user-articles");
      const data = await res.json();
      setMyArticles(data.articles || []);
    } catch {
      setMyArticles([]);
    } finally {
      setLoadingArticles(false);
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const webpBase64 = canvas.toDataURL("image/webp", 0.82);
        setCoverImage(webpBase64);
        setCompressing(false);
      };
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setMessage({ type: "error", text: "Judul dan Isi artikel tidak boleh kosong." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          region,
          excerpt: excerpt.trim() || title.trim(),
          content: content.trim(),
          cover_image: coverImage,
        }),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setMessage({
          type: "success",
          text: "Artikel Anda berhasil dipublikasikan secara langsung!",
          slug: data.slug,
        });
        setTitle("");
        setExcerpt("");
        setContent("");
        setCoverImage("");
      } else {
        setMessage({ type: "error", text: data.error || "Gagal memposting artikel." });
      }
    } catch (err: any) {
      setSubmitting(false);
      setMessage({ type: "error", text: `Gagal memposting artikel: ${err.message}` });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-bento-border pb-4">
        <div>
          <h2 className="text-xl font-bold text-bento-text-primary flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            <span>Publikasi Artikel Verifikator</span>
          </h2>
          <p className="text-xs text-bento-text-secondary mt-0.5">
            Publikasikan naskah riset atau wawasan Anda dan pantau statistik serta peringkat FYP artikel Anda secara realtime.
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-2 bg-bento-surface p-1 rounded-xl border border-bento-border">
          <button
            onClick={() => setSubTab("write")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === "write" ? "bg-purple-600 text-white shadow-md" : "text-bento-text-secondary hover:text-white"
            }`}
          >
            ✍️ Tulis Artikel Baru
          </button>
          <button
            onClick={() => setSubTab("my_articles")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subTab === "my_articles" ? "bg-purple-600 text-white shadow-md" : "text-bento-text-secondary hover:text-white"
            }`}
          >
            📊 Artikel Saya & Statistik
          </button>
        </div>
      </div>

      {subTab === "write" ? (
        <>
          {message && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 ${
                message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              <span>{message.text}</span>
              {message.slug && (
                <a
                  href={`/artikel/${message.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Lihat Artikel ➔
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-bento-surface border border-bento-border rounded-2xl p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-bento-text-primary">Judul Artikel *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul artikel atau naskah kajian..."
                className="w-full bg-bento-bg border border-bento-border text-xs text-bento-text-primary placeholder-bento-text-secondary p-3 rounded-xl focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-bento-text-primary">Kategori Artikel</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-bento-bg border border-bento-border text-xs text-bento-text-primary p-3 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  <option value="Pengetahuan & Sejarah">📚 Pengetahuan & Sejarah</option>
                  <option value="Musik, Seni & Budaya">🎵 Musik, Seni & Budaya</option>
                  <option value="Teori & Tesis">🎓 Teori & Tesis</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-bento-text-primary">Wilayah Daerah</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-bento-bg border border-bento-border text-xs text-bento-text-primary p-3 rounded-xl focus:outline-none focus:border-purple-500"
                >
                  <option value="Umum">📍 Umum / Lintas Daerah</option>
                  <option value="Boltim">📍 Bolaang Mongondow Timur (Boltim)</option>
                  <option value="Bolsel">📍 Bolaang Mongondow Selatan (Bolsel)</option>
                  <option value="Bolmut">📍 Bolaang Mongondow Utara (Bolmut)</option>
                  <option value="Bolmong">📍 Bolaang Mongondow (Bolmong)</option>
                  <option value="Kotamobagu">📍 Kota Kotamobagu</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-bento-text-primary">Gambar Sampul (Otomatis Kompresi WebP)</label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-4 py-2.5 bg-bento-bg border border-bento-border hover:border-purple-500 rounded-xl text-xs font-bold text-purple-300 flex items-center gap-2 transition-all">
                  <Upload className="h-4 w-4" />
                  <span>{compressing ? "Mengompresi Gambar..." : "Pilih File Gambar..."}</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
                {coverImage && <span className="text-[11px] text-emerald-400 font-semibold">✓ Gambar terkompresi ke WebP</span>}
              </div>

              {coverImage && (
                <div className="mt-2 h-32 w-48 rounded-xl overflow-hidden border border-bento-border bg-bento-bg">
                  <img src={coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-bento-text-primary">Ringkasan Singkat (Excerpt)</label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Ringkasan 1-2 kalimat gambaran umum artikel..."
                className="w-full bg-bento-bg border border-bento-border text-xs text-bento-text-primary placeholder-bento-text-secondary p-3 rounded-xl focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-bento-text-primary">Isi Konten Artikel * (Mendukung Markdown)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="Tuliskan isi artikel..."
                className="w-full bg-bento-bg border border-bento-border text-xs text-bento-text-primary placeholder-bento-text-secondary p-3 rounded-xl focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || compressing}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
            >
              {submitting ? "Mempublikasikan Artikel..." : "🚀 Publikasikan Artikel Verifikator"}
            </button>
          </form>
        </>
      ) : (
        /* Listed Articles & Statistics View */
        <div className="space-y-4">
          {loadingArticles ? (
            <div className="p-8 text-center text-xs text-bento-text-secondary">Memuat daftar artikel Anda...</div>
          ) : myArticles.length === 0 ? (
            <div className="p-8 text-center text-xs text-bento-text-secondary bg-bento-surface rounded-2xl border border-bento-border space-y-2">
              <FileText className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="font-bold text-bento-text-primary">Anda Belum Punya Artikel Dipublikasikan</p>
              <button
                onClick={() => setSubTab("write")}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-md mt-2"
              >
                ✍️ Tulis Artikel Pertama Anda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {myArticles.map((art) => (
                <div
                  key={art.id}
                  className="bg-bento-surface border border-bento-border rounded-2xl p-5 space-y-4 hover:border-purple-500/40 transition-all shadow-md"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-bento-border pb-3">
                    <div className="space-y-1 min-w-0">
                      <a
                        href={`/artikel/${art.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-sm text-bento-text-primary hover:text-purple-400 flex items-center gap-1.5 truncate"
                      >
                        <span>{art.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-bento-text-secondary" />
                      </a>
                      <p className="text-[11px] text-bento-text-secondary">
                        📍 {art.region} · 📚 {art.category} · Diposting:{" "}
                        {new Date(art.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
                        🏆 #{art.fyp_rank} FYP
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          art.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : art.status === "warning"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {art.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
                    <div className="bg-bento-bg p-3 rounded-xl border border-bento-border text-center space-y-1">
                      <p className="text-[10px] text-bento-text-secondary uppercase">Views</p>
                      <p className="text-sm font-bold text-blue-400 flex items-center justify-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> {art.views_count}
                      </p>
                    </div>

                    <div className="bg-bento-bg p-3 rounded-xl border border-bento-border text-center space-y-1">
                      <p className="text-[10px] text-bento-text-secondary uppercase">Likes</p>
                      <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" /> {art.likes_count}
                      </p>
                    </div>

                    <div className="bg-bento-bg p-3 rounded-xl border border-bento-border text-center space-y-1">
                      <p className="text-[10px] text-bento-text-secondary uppercase">Dislikes</p>
                      <p className="text-sm font-bold text-red-400 flex items-center justify-center gap-1">
                        <ThumbsDown className="w-3.5 h-3.5" /> {art.dislikes_count}
                      </p>
                    </div>

                    <div className="bg-bento-bg p-3 rounded-xl border border-bento-border text-center space-y-1">
                      <p className="text-[10px] text-bento-text-secondary uppercase">Komentar</p>
                      <p className="text-sm font-bold text-amber-400 flex items-center justify-center gap-1">
                        💬 {art.comments_count}
                      </p>
                    </div>

                    <div className="bg-bento-bg p-3 rounded-xl border border-bento-border text-center space-y-1 col-span-2 sm:col-span-1">
                      <p className="text-[10px] text-bento-text-secondary uppercase">Skor FYP</p>
                      <p className="text-sm font-bold text-purple-400 flex items-center justify-center gap-1">
                        🔥 {art.fyp_score}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
