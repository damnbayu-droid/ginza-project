'use client';

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Building2,
  Users,
  Home,
  ShieldCheck,
  Layout,
  Globe,
  Database,
  Cpu,
  Smartphone,
  GraduationCap,
  BookOpen,
  Sparkles,
  HeartHandshake,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  Printer,
  Mail,
  MapPin,
  ExternalLink,
  DollarSign,
  Calculator,
  Award,
  Layers
} from "lucide-react";

export default function ProposalPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  const districts = [
    { id: "all", name: "Semua 5 Daerah (Konsorsium Total)" },
    { id: "boltim", name: "Kab. Bolaang Mongondow Timur" },
    { id: "bolsel", name: "Kab. Bolaang Mongondow Selatan" },
    { id: "bolmut", name: "Kab. Bolaang Mongondow Utara" },
    { id: "bolmong", name: "Kab. Bolaang Mongondow" },
    { id: "kotamobagu", name: "Kota Kotamobagu" },
  ];

  const budgetItems = [
    {
      category: "1. Kelembagaan & Hukum",
      item: "Pendirian Legalitas Yayasan Bolaang Mongondow Raya (Akta Notaris & SK Kemenkumham)",
      costPerUnit: 25000000,
      units: "1 Paket",
      total: 25000000,
      districtShare: 5000000,
      type: "Financing"
    },
    {
      category: "2. Sarana Fisik & Sewa Kantor",
      item: "Penyewaan & Renovasi Gedung Markas Kebudayaan 'Baloy' (Kantor Riset & Studio)",
      costPerUnit: 60000000,
      units: "1 Tahun",
      total: 60000000,
      districtShare: 12000000,
      type: "Financing"
    },
    {
      category: "3. Tim Verifikator & Riset",
      item: "Operasional Tim Verifikator (7 Pakar: Paleografer, Linguis, Filolog, Arkeolog, Epigraf, Historian, Tokoh Adat)",
      costPerUnit: 15000000,
      units: "12 Bulan",
      total: 180000000,
      districtShare: 36000000,
      type: "Financing"
    },
    {
      category: "4. UI/UX & Frontend Platform",
      item: "Penyempurnaan Design System UI/UX, Micro-Animation, & Interaktivitas Web",
      costPerUnit: 35000000,
      units: "1 Paket",
      total: 35000000,
      districtShare: 7000000,
      type: "Financing"
    },
    {
      category: "5. Domain, Hosting & DDoS Protect",
      item: "Sewa Domain mongondowpedia.com, SSL Enterprise, Cloudflare Pro, & Infrastruktur Backup",
      costPerUnit: 15000000,
      units: "1 Tahun",
      total: 15000000,
      districtShare: 3000000,
      type: "Financing"
    },
    {
      category: "6. Database Vector & Knowledge",
      item: "Infrastruktur Supabase Enterprise, Vector Database RAG (100k+ Naskah & Kamus)",
      costPerUnit: 30000000,
      units: "1 Tahun",
      total: 30000000,
      districtShare: 6000000,
      type: "Financing"
    },
    {
      category: "7. AI Provider & Voice Engine",
      item: "Alokasi Kuota API High-Token Gemini Pro & Real-Time TTS Audio Multi-Modal Voice Mode",
      costPerUnit: 45000000,
      units: "1 Tahun",
      total: 45000000,
      districtShare: 9000000,
      type: "Financing"
    },
    {
      category: "8. Aplikasi Mobile (Android/iOS)",
      item: "Pengembangan & Publikasi Aplikasi Mobile Native (Play Store & App Store) + Mode Offline",
      costPerUnit: 75000000,
      units: "1 Paket",
      total: 75000000,
      districtShare: 15000000,
      type: "Financing"
    },
    {
      category: "9. Tools Muatal Lokal (SD/SMP/SMA)",
      item: "Pengembangan Modul Interaktif Muatan Lokal Pendidikan SD, SMP, & SMA/SMK (3 Tingkatan)",
      costPerUnit: 30000000,
      units: "3 Modul Digital",
      total: 90000000,
      districtShare: 18000000,
      type: "Financing"
    },
    {
      category: "10. Program Non-Financing",
      item: "Gerakan Literasi Mongondow, Gema Tradisi, Teater Budaya, & Festival Kebudayaan BMR",
      costPerUnit: 0,
      units: "Swadaya & Kemitraan",
      total: 0,
      districtShare: 0,
      type: "Non-Financing"
    }
  ];

  const grandTotalCost = budgetItems.reduce((acc, item) => acc + item.total, 0);
  const totalPerDistrict = grandTotalCost / 5;

  const toggleAccordion = (id: string) => {
    setActiveSection(activeSection === id ? null : id);
  };

  const sectionsList = [
    {
      id: "sec-1",
      title: "1. Pendahuluan & Visi Utama Ginza Project (Developer Perspective)",
      icon: Cpu,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Dari perspektif Tim Pengembang (*System Architects & Developers*), <strong>Ginza Project</strong> lahir sebagai respons atas ancaman kepunahan bahasa dan degradasi memori sejarah kebudayaan Bolaang Mongondow Raya (BMR). Perkembangan teknologi digital yang pesat jika tidak dimanfaatkan untuk melestarikan warisan leluhur akan menyebabkan generasi mendatang kehilangan akar identitasnya.
          </p>
          <p>
            MongondowPedia dibangun menggunakan arsitektur web modern bertaraf internasional (Next.js 16 App Router, Supabase Vector Storage, dan kecerdasan buatan <strong>MyAI OS / Bogani AI</strong>). Proyek edukasi ini memadukan ketepatan ilmiah linguistik dengan kecepatan antarmuka digital real-time.
          </p>
        </div>
      )
    },
    {
      id: "sec-2",
      title: "2. Sasaran Proposal Ditujukan Kepada 5 Pemda Kab/Kota & Masyarakat",
      icon: Building2,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Proposal ini disusun secara terpadu dan ditujukan kepada 5 Pemerintah Daerah Kabupaten/Kota se-Bolaang Mongondow Raya:
          </p>
          <ul className="list-disc list-inside space-y-1.5 font-semibold text-white">
            <li>Pemerintah Kabupaten Bolaang Mongondow Timur</li>
            <li>Pemerintah Kabupaten Bolaang Mongondow Selatan</li>
            <li>Pemerintah Kabupaten Bolaang Mongondow Utara</li>
            <li>Pemerintah Kabupaten Bolaang Mongondow</li>
            <li>Pemerintah Kota Kotamobagu</li>
          </ul>
          <p>
            Serta ditujukan kepada seluruh elemen **Masyarakat Pemerhati Sejarah, Pemangku Adat, Tokoh Pemuda, dan Akademisi** guna menciptakan konsorsium gotong-royong pembiayaan serta pengumpulan naskah kebudayaan.
          </p>
        </div>
      )
    },
    {
      id: "sec-3",
      title: "3. Inisiasi & Pendirian Resmi Yayasan Bolaang Mongondow Raya",
      icon: FileText,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Guna memberikan payung hukum yang sah dan berkelanjutan, Ginza Project menginisiasi pendirian badan hukum resmi berupa **Yayasan Bolaang Mongondow Raya**. 
          </p>
          <p>
            Pendirian ini mencakup penyusunan Akta Notaris pendirian, pengesahan SK dari Kementerian Hukum dan Hak Asasi Manusia (Kemenkumham RI), NPWP Yayasan, serta pendaftaran Nomor Induk Berusaha (NIB) sektor edukasi kebudayaan.
          </p>
        </div>
      )
    },
    {
      id: "sec-4",
      title: "4. Pembentukan Pengurus Yayasan & Keterwakilan 5 Daerah",
      icon: Users,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Struktur Kepengurusan Yayasan dirancang dengan mengedepankan **prinsip keterwakilan seimbang dari 5 Kabupaten/Kota**, melingkupi gabungan unsur Pemerintah Daerah (Dinas Pendidikan & Kebudayaan) serta Unsur Non-Pemerintah (Tokoh Adat, Budayawan, & Peneliti Independent).
          </p>
          <div className="p-4 rounded-2xl bg-[#171922] border border-[#242836] space-y-2">
            <h4 className="font-bold text-amber-400">Tugas Utama Pengurus Yayasan:</h4>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Menjadi **Verifikator Internal Resmi** bagi kosa kata kamus & artikel sejarah MongondowPedia.</li>
              <li>Menjadi **Trainer Penyempurnaan Penalaran AI** untuk melatih akurasi kecerdasan buatan Bogani AI.</li>
              <li>Mengawasi akuntabilitas penggunaan dana hibah & sumbangan masyarakat.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "sec-5",
      title: "5. Penyewaan Lokasi Markas Kebudayaan 'Baloy'",
      icon: Home,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Dibutuhkan lokasi fisik sebagai Pusat Operational, Laboratorium Riset Bahasa, dan Perpustakaan Manuskrip yang diberi nama **Markas Kebudayaan &ldquo;Baloy&rdquo;**.
          </p>
          <p>
            Lokasi Baloy akan difungsikan sebagai:
          </p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Ruang Sidang Verifikasi Data oleh Dewan Verifikator.</li>
            <li>Studio Rekaman Fonetik Audio Bahasa Mongondow (Penutur Native).</li>
            <li>Ruang Galeri Pameran Aksara Kuno & Naskah Sejarah untuk Pelajar/Mahasiswa.</li>
          </ul>
        </div>
      )
    },
    {
      id: "sec-6",
      title: "6. Operasional Tim Verifikator & Pengumpul Data Sejarah",
      icon: ShieldCheck,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Proses verifikasi informasi memerlukan dukungan insentif dan operasional lapangan bagi 7 spesialisasi verifikator:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-[#181B26] border border-[#262B3D]">1. Paleografer</div>
            <div className="p-2 rounded-lg bg-[#181B26] border border-[#262B3D]">2. Linguis</div>
            <div className="p-2 rounded-lg bg-[#181B26] border border-[#262B3D]">3. Filolog</div>
            <div className="p-2 rounded-lg bg-[#181B26] border border-[#262B3D]">4. Arkeolog</div>
            <div className="p-2 rounded-lg bg-[#181B26] border border-[#262B3D]">5. Epigraf</div>
            <div className="p-2 rounded-lg bg-[#181B26] border border-[#262B3D]">6. Historian</div>
            <div className="p-2 rounded-lg bg-[#181B26] border border-[#262B3D]">7. Tokoh Adat</div>
          </div>
          <p>
            Dana operasional digunakan untuk riset wawancara lisan ke desa-desa tua adat BMR, digitalisasi naskah kuno, dan sidang pengesahan entri kata.
          </p>
        </div>
      )
    },
    {
      id: "sec-7",
      title: "7. Biaya Penyempurnaan Website: UI/UX Design & Micro-Animations",
      icon: Layout,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Pengembangan aspek estetika antarmuka (Design System, HSL Color Palette, Typography Inter, Micro-animations) untuk memastikan situs MongondowPedia tampil modern, responsif di semua perangkat, dan memberikan kesan *premium/state-of-the-art*.
          </p>
        </div>
      )
    },
    {
      id: "sec-8",
      title: "8. Biaya Penyempurnaan Website: Domain & Infrastruktur Keamanan",
      icon: Globe,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Alokasi registrasi domain resmi `mongondowpedia.com`, sertifikat SSL Enterprise 256-bit, perlindungan Cloudflare DDoS Attack Protection, serta sistem cadangan data harian (*daily automated backups*).
          </p>
        </div>
      )
    },
    {
      id: "sec-9",
      title: "9. Biaya Penyempurnaan Website: Vector Database & Knowledge Base RAG",
      icon: Database,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Sewa server Database Supabase PostgreSQL + pgvector untuk menyimpan 100.000+ dokumen naskah lisan, silsilah sutan raja, serta vektor kecerdasan buatan RAG (Retrieval-Augmented Generation).
          </p>
        </div>
      )
    },
    {
      id: "sec-10",
      title: "10. Biaya Penyempurnaan Website: AI Provider (Gemini Pro & Voice TTS)",
      icon: Cpu,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Pembiayaan konsumsi token API AI Provider (Google Gemini 1.5 Flash/Pro) dan API sintetis suara percakapan real-time dua arah (*Bogani AI Voice Mode*) tanpa batas interupsi.
          </p>
        </div>
      )
    },
    {
      id: "sec-11",
      title: "11. Pengembangan Mobile Application (Android & iOS)",
      icon: Smartphone,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Pembuatan aplikasi smartphone cross-platform (Android & iOS) yang dapat diunduh gratis melalui Google Play Store dan Apple App Store, dilengkapi fitur **Offline Mode Kamus** agar dapat diakses pelajar di wilayah dengan sinyal terbatas.
          </p>
        </div>
      )
    },
    {
      id: "sec-12",
      title: "12. Tools Educational 'Muatan Lokal': Tingkat SD (Sekolah Dasar)",
      icon: GraduationCap,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Pengembangan modul digital Muatan Lokal interaktif untuk siswa SD: kuis bergambar tebak aksara, audio dongeng cerita rakyat Mongondow, dan pengenalan nama benda sekitar dalam bahasa ibu.
          </p>
        </div>
      )
    },
    {
      id: "sec-13",
      title: "13. Tools Educational 'Muatan Lokal': Tingkat SMP (Sekolah Menengah Pertama)",
      icon: GraduationCap,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Modul digital Muatan Lokal SMP: mesin alih aksara Latin ↔ Aksara Mongondow, studio latihan menulis *stroke* aksara di layar sentuh, dan pembelajaran tata bahasa dasar (*Morfologi Prefiks Mo-, Moko-, Moto-*).
          </p>
        </div>
      )
    },
    {
      id: "sec-14",
      title: "14. Tools Educational 'Muatan Lokal': Tingkat SMA/SMK (Sekolah Menengah Atas)",
      icon: GraduationCap,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Modul digital Muatan Lokal SMA/SMK: eksplorasi interaktif Graphify silsilah kerajaan BMR, hukum adat Totabuan, analisis sastra lisan Owadu/Katu-katu, serta penulisan karya ilmiah sejarah lokal.
          </p>
        </div>
      )
    },
    {
      id: "sec-15",
      title: "15. Program Non-Financing: Gerakan Literasi Mongondow & Pelatihan Guru",
      icon: BookOpen,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Program non-finansial berbasis gotong-royong: Pelatihan pengajaran Aksara Mongondow untuk guru-guru sekolah, pembuatan grup komunitas literasi di tiap kecamatan, serta webinar pendidikan sejarah BMR.
          </p>
        </div>
      )
    },
    {
      id: "sec-16",
      title: "16. Program Non-Financing: Gema Tradisi, Teater Budaya & Festival BMR",
      icon: Sparkles,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Penyelenggaraan kegiatan pelestarian seni tutur tradisional (Gema Tradisi), teater cerita rakyat anak muda, dan Festival Kebudayaan Bolaang Mongondow Raya tahunan berbasis keterlibatan publik.
          </p>
        </div>
      )
    },
    {
      id: "sec-17",
      title: "17. Tabel Rincian Anggaran Biaya (RAB) & Skema Konsorsium Gotong-Royong",
      icon: Calculator,
      content: (
        <div className="space-y-4 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Berikut adalah perkiraan alokasi dana secara terbuka dengan skema pembagian rata (*Equal Consortium Model*) kepada 5 Pemerintah Kabupaten/Kota se-BMR:
          </p>
          
          <div className="p-4 rounded-2xl bg-[#171922] border border-[#242836] flex flex-col md:flex-row justify-between items-center gap-4 font-mono">
            <div>
              <p className="text-gray-400 text-xs">Total Anggaran Pengembangan (1 Tahun):</p>
              <p className="text-xl md:text-2xl font-bold text-amber-400">Rp {grandTotalCost.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Estimasi Alokasi Per Pemda (5 Kabupaten/Kota):</p>
              <p className="text-xl md:text-2xl font-bold text-cyan-400">Rp {totalPerDistrict.toLocaleString("id-ID")} / Pemda</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-18",
      title: "18. Mekanisme Akuntabilitas, Audit Transparansi & Langkah Selanjutnya",
      icon: HeartHandshake,
      content: (
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Seluruh penggunaan dana hibah akan diaudit secara berkala oleh Akuntan Publik Independen dan laporan keuangan dipublikasikan secara transparan di situs MongondowPedia.
          </p>
          <p className="font-semibold text-white">
            Langkah Selanjutnya: Pelaksanaan Audiensi Resmi bersama Bupati/Wali Kota dan Kepala Dinas Pendidikan & Kebudayaan 5 Daerah se-Bolaang Mongondow Raya.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans selection:bg-amber-500/30 pb-24">
      {/* Background Lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-600/10 via-orange-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 md:pt-12 space-y-10">
        
        {/* Navigation Breadcrumb & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C1E24] pb-4 gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/info" className="hover:text-white transition-colors">Info</Link>
            <span>/</span>
            <span className="text-amber-400">Proposal Pengembangan</span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => window.print()}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#252833] bg-[#111318] text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
              title="Cetak Proposal"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak / PDF</span>
            </button>

            <Link
              href="/info"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#252833] bg-[#111318] text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <span>Kembali</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Official Document Cover Header */}
        <div className="p-8 md:p-12 rounded-3xl bg-[#111318] border border-[#232733] space-y-6 relative overflow-hidden text-center shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold font-mono uppercase tracking-widest">
            <Award className="w-4 h-4" />
            <span>Dokumen Resmi Proposal Ginza Project</span>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              PROPOSAL PERMOHONAN DUKUNGAN PENGEMBANGAN PLATFORM DIGITAL & PENDIRIAN YAYASAN BOLAANG MONGONDOW RAYA
            </h1>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-mono">
              Nomor Dokumen: 001/PROP-GINZA/BMR/2026 • Perspektif Pengembang System Architecture
            </p>
          </div>

          {/* Addressed To Badge Box */}
          <div className="pt-4 border-t border-[#1D212E] max-w-3xl mx-auto space-y-3">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Ditujukan Kepada Yth:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200">1. Pemkab Boltim</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200">2. Pemkab Bolsel</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200">3. Pemkab Bolmut</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200">4. Pemkab Bolmong</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200">5. Pemkot Kotamobagu</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">Masyarakat Pemerhati Sejarah BMR</span>
            </div>
          </div>
        </div>

        {/* Interactive RAB Budget Table Filter */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#232733] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1D212E] pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs font-mono">
                <Calculator className="w-4 h-4" />
                <span>KALKULATOR RAB INTERAKTIF</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Rincian Anggaran Biaya (RAB) & Matriks Pendanaan</h2>
            </div>

            {/* Filter Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:inline">Lihat Porsi:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-[#171922] border border-[#2A2E3D] text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-amber-500"
              >
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#232733] bg-[#161822] text-gray-400 font-mono">
                  <th className="p-3">No / Kategori</th>
                  <th className="p-3">Komponen Kebutuhan Developer</th>
                  <th className="p-3">Satuan</th>
                  <th className="p-3 text-right">Total Anggaran (Rp)</th>
                  <th className="p-3 text-right">Porsi Per Pemda (5 Daerah)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D212E]">
                {budgetItems.map((b, i) => (
                  <tr key={i} className="hover:bg-[#161822] transition-colors">
                    <td className="p-3 font-semibold text-amber-400">{b.category}</td>
                    <td className="p-3 text-gray-200 font-medium">{b.item}</td>
                    <td className="p-3 text-gray-400 font-mono">{b.units}</td>
                    <td className="p-3 text-right font-mono font-bold text-white">
                      {b.total > 0 ? `Rp ${b.total.toLocaleString("id-ID")}` : "Non-Financing"}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-cyan-400">
                      {b.districtShare > 0 ? `Rp ${b.districtShare.toLocaleString("id-ID")}` : "Gotong Royong"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-amber-500/40 bg-[#191C28] font-mono text-sm">
                  <td colSpan={3} className="p-4 font-bold text-white">
                    TOTAL KONSORSIUM (18 SECTION)
                  </td>
                  <td className="p-4 text-right font-extrabold text-amber-400">
                    Rp {grandTotalCost.toLocaleString("id-ID")}
                  </td>
                  <td className="p-4 text-right font-extrabold text-cyan-400">
                    Rp {totalPerDistrict.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 18 Interactive Proposal Sections */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1D212E] pb-3">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>18 Section Rincian Detail Proposal Ginza Project</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono">Klik section untuk membuka detail</span>
          </div>

          <div className="space-y-3">
            {sectionsList.map((sec) => {
              const IconComp = sec.icon;
              const isExpanded = activeSection === sec.id;
              return (
                <div
                  key={sec.id}
                  className="rounded-2xl bg-[#111318] border border-[#232733] overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleAccordion(sec.id)}
                    className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-[#161822] transition-colors focus:outline-none"
                  >
                    <div className="flex items-center gap-3 pr-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                        <IconComp className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <h3 className="text-xs md:text-sm font-bold text-white">{sec.title}</h3>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="p-5 border-t border-[#1E2230] bg-[#141620] animate-fade-in">
                      {sec.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact & Proposal Signoff Box */}
        <div className="p-8 rounded-3xl bg-[#111318] border border-[#232733] space-y-6 text-center">
          <h3 className="text-lg font-bold text-white">Lembar Komunikasi & Audiensi Tim Pengembang</h3>
          <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
            Untuk permohonan audiensi resmi, penyerahan berkas proposal cetak fisik, atau diskusi teknis bersama Tim Developers Ginza Project, silakan hubungi:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            <a
              href="mailto:developer@mongondowpedia.com"
              className="py-2.5 px-4 rounded-xl bg-[#181B26] border border-[#282D3F] text-cyan-400 hover:border-cyan-500 transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>developer@mongondowpedia.com</span>
            </a>

            <a
              href="https://maps.app.goo.gl/Gznpt6NtqFNLxE4F8"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 rounded-xl bg-[#181B26] border border-[#282D3F] text-rose-300 hover:border-rose-500 transition-all flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Kotabunan, Jl. Tangkudegan</span>
            </a>
          </div>
        </div>

        {/* Homepage Matching Footer */}
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
