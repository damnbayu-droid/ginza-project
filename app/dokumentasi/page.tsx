import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Sparkles,
  FileText,
  PlusCircle,
  CheckCircle2,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Bot,
  Globe,
  Share2
} from "lucide-react";

export const metadata: Metadata = {
  title: "Dokumentasi Platform — MongondowPedia",
  description:
    "Dokumentasi lengkap arsitektur MongondowPedia, Bogani AI RAG Engine, serta panduan pengguna dalam mempublikasikan artikel dan menambah pengetahuan kebudayaan.",
};

export default function DokumentasiPage() {
  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans selection:bg-blue-500/30 pb-20">
      {/* Ambient Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-cyan-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 md:pt-12 space-y-12">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between border-b border-[#1C1E24] pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-blue-400">Dokumentasi</span>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold font-mono uppercase tracking-widest">
            <BookOpen className="w-3.5 h-3.5" />
            <span>MongondowPedia Documentation</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Dokumentasi & Panduan Publikasi Pengetahuan
          </h1>

          <p className="text-sm md:text-base text-gray-400 leading-relaxed font-normal">
            Panduan teknis, arsitektur Bogani AI RAG, serta tata cara pengguna berkontribusi menambahkan dokumen sejarah, artikel kebudayaan, dan kosa kata di MongondowPedia.
          </p>
        </div>

        {/* SECTION 1: ARSITEKTUR PLATFORM & BOGANI AI */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#1D2029] pb-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">1. Pengenalan Arsitektur MongondowPedia</h2>
              <p className="text-xs text-gray-400">Sistem Ensiklopedia Terpadu & RAG Engine Bogani AI (Abo&apos;)</p>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-6">
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
              <strong>MongondowPedia</strong> dirancang sebagai infrastruktur digital terpadu untuk pelestarian sastra lisan, sejarah raja-raja, kosa kata kamus, serta alih aksara Bolaang Mongondow Raya (BMR). Seluruh informasi pada platform ini terhubung langsung dengan mesin <strong>Bogani AI</strong> berbasis arsitektur <em>Retrieval-Augmented Generation (RAG)</em>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#161822] border border-[#232736] space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                  <Bot className="w-4 h-4" />
                  <span>Bogani AI RAG Engine</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Menjawab pertanyaan pengguna berdasarkan korpus naskah terverifikasi tanpa melakukan halusinasi fakta.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#161822] border border-[#232736] space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                  <Layers className="w-4 h-4" />
                  <span>Knowledge Graph</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Struktur grafis hubungan entitas sejarah raja-raja, silsilah keluarga, dan konsep adat Totabuan.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#161822] border border-[#232736] space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sidik Verifikasi Linguistik</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Penyaringan berlapis oleh Dewan Verifikator untuk menjamin keabsahan isi kamus dan artikel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CARA MENAMBAHKAN KNOWLEDGE & ARTIKEL USER */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#1D2029] pb-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">2. Panduan Kontribusi User: Menambahkan Knowledge & Artikel</h2>
              <p className="text-xs text-gray-400">Bagaimana pengguna dapat mengusulkan dokumen, cerita rakyat, atau kosa kata</p>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-6">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Siapa Saja Yang Bisa Berkontribusi?</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                Setiap **pengguna terdaftar**, budayawan, akademisi, penutur asli, dan masyarakat umum dapat berkontribusi memperkaya basis pengetahuan MongondowPedia melalui tombol <strong>Kontribusi / Tambah Pengetahuan</strong>.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Tahapan Alur Kontribusi & Publikasi:</h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#161822] border border-[#232736] space-y-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">1</span>
                  <h5 className="text-xs font-bold text-white">Login / Register</h5>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Masuk menggunakan akun Google atau email terdaftar untuk mengaktifkan fitur kontribusi.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#161822] border border-[#232736] space-y-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">2</span>
                  <h5 className="text-xs font-bold text-white">Isi Formulir Kontribusi</h5>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Masukkan judul artikel, naskah/kosa kata, rujukan sejarah, serta lampiran foto/file pendukung.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#161822] border border-[#232736] space-y-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">3</span>
                  <h5 className="text-xs font-bold text-white">Evaluasi Verifikator</h5>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Tim Verifikator (Paleografer, Linguis, Filolog, Historian) meninjau kebenaran isi artikel.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#161822] border border-[#232736] space-y-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold flex items-center justify-center">4</span>
                  <h5 className="text-xs font-bold text-white">Publikasi & Training AI</h5>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Setelah disetujui, artikel tampil publik dengan lencana <em>Terverifikasi</em> & melatih AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: REFERENSI API & STARTER EXAMPLES */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#1D2029] pb-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">3. Integrasi API & Pengembang External</h2>
              <p className="text-xs text-gray-400">Akses SDK, API Konsol, dan Contoh Kode MyAI OS</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://console.myai.nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-[#111318] border border-[#1F222C] hover:border-purple-500/40 transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 uppercase">
                  Konsol Developer
                </span>
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                Referensi API — console.myai.nexus
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Kelola API Keys, batas penggunaan kuota, endpoint chat completion, serta integrasi webhook langsung dari Konsol Pengembang MyAI OS.
              </p>
            </a>

            <a
              href="https://myai.nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-[#111318] border border-[#1F222C] hover:border-cyan-500/40 transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                  Starter Kits
                </span>
                <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                Contoh Starter — myai.nexus
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Template kode awal, contoh aplikasi chat Next.js/Python, serta pustaka SDK untuk memuat pengetahuan budaya ke dalam aplikasi Anda.
              </p>
            </a>
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
