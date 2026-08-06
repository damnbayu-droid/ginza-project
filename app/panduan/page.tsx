import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  ArrowRight,
  Sparkles,
  UserCheck,
  Mic,
  Search,
  BookOpen,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserPlus,
  Compass,
  MessageSquare
} from "lucide-react";

export const metadata: Metadata = {
  title: "Panduan Pengguna — MongondowPedia",
  description:
    "Petunjuk langkah demi langkah penggunaan fitur Bogani AI, mode suara real-time, pencarian kamus, serta panduan pendaftaran verifikator dan kontribusi artikel.",
};

export default function PanduanPage() {
  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans selection:bg-blue-500/30 pb-20">
      {/* Ambient Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-600/10 via-teal-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 md:pt-12 space-y-12">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#1C1E24] pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-emerald-400">Panduan</span>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#252833] bg-[#111318] text-gray-300 hover:text-white hover:border-gray-600 transition-all flex items-center gap-1.5"
          >
            <span>Kembali ke Beranda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold font-mono uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" />
            <span>MongondowPedia User Guide</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Panduan Penggunaan & Petunjuk Pengguna
          </h1>

          <p className="text-sm md:text-base text-gray-400 leading-relaxed font-normal">
            Petunjuk praktis menggunakan seluruh fitur MongondowPedia, mulai dari obrolan Bogani AI, mode suara real-time, pencarian kamus, hingga cara menambahkan artikel & pengetahuan.
          </p>
        </div>

        {/* PANDUAN 1: BAGAIMANA CARA MEMULAI (GETTING STARTED) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#1D2029] pb-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">1. Langkah Awal & Otentikasi Akun</h2>
              <p className="text-xs text-gray-400">Mode Tamu Gratis vs Akun Pengguna Terdaftar</p>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#161822] border border-[#232736] space-y-2.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                  Mode Tamu (Guest Mode)
                </span>
                <h3 className="text-sm font-bold text-white">Akses Gratis Terbatas</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Setiap pengunjung yang belum login dapat mencoba fitur obrolan AI dan pencarian kamus hingga batas kuota gratis.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#161822] border border-[#232736] space-y-2.5">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase">
                  Akun Terdaftar (Google OAuth)
                </span>
                <h3 className="text-sm font-bold text-white">Akses Penuh & Fitur Kontribusi</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Dengan login via Google/email, Anda mendapatkan batas pemakaian obrolan yang jauh lebih luas, riwayat obrolan tersimpan, serta akses penuh untuk menambah artikel & pengetahuan.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PANDUAN 2: MEMAKAI BOGANI AI & VOICE MODE */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#1D2029] pb-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">2. Penggunaan Bogani AI & Mode Suara Real-Time</h2>
              <p className="text-xs text-gray-400">Berinteraksi secara teks maupun percakapan suara langsung</p>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-4">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Cara Mengaktifkan Bogani AI Voice Mode:</span>
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-xs text-gray-300 leading-relaxed">
                <li>Klik tombol <strong>Mikrofon (Mic CTA)</strong> pada baris input di halaman utama.</li>
                <li>Modal <strong>Bogani AI Voice Mode</strong> akan terbuka dan otomatis mulai mendengarkan (*listening mode*).</li>
                <li>Jika browser meminta izin akses audio, tekan tombol <strong>Minta Izin Akses (Ask Permission)</strong> untuk menyetujui akses mikrofon & speaker.</li>
                <li>Ucapkan pertanyaan Anda dalam Bahasa Mongondow atau Indonesia. AI akan berpikir dalam 5-10 detik dan menjawab langsung melalui suara fonetik yang alami.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* PANDUAN 3: CARA MEMPOSTING ARTIKEL & MENAMBAHKAN KNOWLEDGE */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#1D2029] pb-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">3. Cara Memposting Artikel & Menambahkan Knowledge</h2>
              <p className="text-xs text-gray-400">Langkah-langkah menyumbang naskah lisan, artikel sejarah, dan kosa kata</p>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-4">
            <div className="space-y-3">
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                Buka menu <strong>Knowledge</strong> atau klik tombol <strong>Info</strong> di header utama, lalu pilih <strong>Tambah Artikel / Kontribusi</strong>. Isi data berikut:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs text-gray-300 leading-relaxed">
                <li><strong>Judul Artikel / Kosa Kata:</strong> Masukkan istilah asli Mongondow atau judul naskah sejarah.</li>
                <li><strong>Kategori:</strong> Pilih antara Sejarah Raja-Raja, Etimologi, Falsafah Adat, Sastra Lisan (Owadu/Katu-katu), atau Kamus.</li>
                <li><strong>Uraian / Isi Dokumen:</strong> Tuliskan penjabaran lengkap beserta referensi naskah atau sumber tokoh adat yang diwawancarai.</li>
                <li><strong>Kirim ke Verifikator:</strong> Setelah dikirim, entri Anda akan masuk ke antrean <em>Pending Review</em> untuk ditinjau oleh Dewan Verifikator.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Attribution */}
        <div className="pt-8 border-t border-[#1C1F28] text-center space-y-2">
          <p className="text-xs text-gray-500 font-sans">
            (Ginza Project) MongondowPedia Inc. All rights reserved.
          </p>
          <p className="font-mono text-[10px] text-gray-600">
            Portal Kebudayaan & Bahasa Bolaang Mongondow Raya • Powered by MyAI OS
          </p>
        </div>
      </div>
    </div>
  );
}
