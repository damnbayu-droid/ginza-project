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
  Printer,
  Mail,
  MapPin,
  ExternalLink,
  Calculator,
  Award,
  Layers,
  Target
} from "lucide-react";

export default function ProposalPage() {
  const [expandAll, setExpandAll] = useState<boolean>(true);
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

  const outputsList = [
    {
      number: "01",
      title: "Restorasi Bahasa Mongondow",
      description:
        "Penyelamatan, pemetaan fonetik, digitalisasi naskah kuno, dan pemulihan kosa kata serta frasa asli dialek Bolaang Mongondow Raya dari ancaman kepunahan."
    },
    {
      number: "02",
      title: "Penyempurnaan Aksara Totabuan",
      description:
        "Penataan dan pembakuan 88 suku kata Aksara Native Mongondow ke dalam alokasi Unicode PUA, vektor digital HD, serta font keyboard ponsel/komputer baku."
    },
    {
      number: "03",
      title: "Kamus Bahasa Mongondow Terpadu",
      description:
        "Penyusunan ensiklopedia kamus digital multi-bahasa (Mongondow ↔ Indonesia ↔ English ↔ Dialek Totabuan) yang dilengkapi transkripsi IPA dan audio suara penutur native."
    },
    {
      number: "04",
      title: "Implementasi Bahasa Mongondow di Segala Sektor",
      description:
        "Penerapan praktis Bahasa Mongondow dalam kurikulum Muatan Lokal sekolah (SD, SMP, SMA/SMK), administrasi dinas kebudayaan 5 Pemda, serta media publik."
    },
    {
      number: "05",
      title: "Sumber Sensor & Verifikasi Data Sejarah",
      description:
        "Pusat validasi dan sidang pembuktian keabsahan sejarah berbasis dewan 7 pakar (Paleografer, Linguis, Filolog, Arkeolog, Epigraf, Historian, & Tokoh Adat)."
    },
    {
      number: "06",
      title: "Sarana Kolaborasi & Integrasi 5 Kabupaten/Kota BMR",
      description:
        "Wadah sinergi gotong-royong Lintas Pemda (Boltim, Bolsel, Bolmut, Bolmong, & Kota Kotamobagu) dalam konsorsium kebudayaan & pendidikan berskala regional."
    },
    {
      number: "07",
      title: "Otorisasi Bahasa & Sejarah Mongondow Secara Internasional",
      description:
        "Registrasi standar internasional (ISO, Unicode Consortium, UNESCO) serta pendaftaran hak kekayaan intelektual kolektif warisan adat BMR di dunia akademik internasional."
    },
    {
      number: "08",
      title: "Modernisasi Metode Pembelajaran Sejarah Mongondow",
      description:
        "Penerapan teknologi kecerdasan buatan terdepan (Bogani AI / MyAI OS), platform website interaktif RAG, dan Aplikasi Mobile App cross-platform (Android & iOS)."
    }
  ];

  const sectionsList = [
    {
      id: "sec-1",
      title: "1. Pendahuluan & Visi Utama Ginza Project (Developer Perspective)",
      icon: Cpu,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Dari sudut pandang pengembang sistem (*System Architecture & Engineering Perspective*), <strong>Ginza Project</strong> diinisiasi sebagai arsitektur teknologi pelestarian bahasa dan sejarah paling komprehensif bagi suku bangsa Bolaang Mongondow Raya (BMR). Penurunan dramatis jumlah penutur asli bahasa daerah serta hilangnya dokumen sejarah fisik menjadi latar belakang utama dibangunnya platform digital ini.
          </p>
          <p>
            Platform MongondowPedia tidak sekadar situs informasi biasa, melainkan sebuah **Infrastruktur Kecerdasan Buatan Terpadu** yang menggabungkan basis data vektor terenkripsi, mesin pencari dokumen RAG (*Retrieval-Augmented Generation*), dan model bahasa alami berbasis kecerdasan buatan <strong>MyAI OS / Bogani AI (Abo&apos;)</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1 pl-1 text-[#9CA3AF] print-text-dark font-medium">
            <li>Digitalisasi 100.000+ entri kosa kata, variasi dialekTotabuan, serta fonetik IPA baku.</li>
            <li>Restorasi aksara native suku kata kuno Mongondow ke format font komputer & smartphone.</li>
            <li>Penyediaan antarmuka edukasi interaktif untuk seluruh lapisan sekolah dan masyarakat.</li>
          </ul>
        </div>
      )
    },
    {
      id: "sec-2",
      title: "2. Sasaran Proposal Ditujukan Kepada 5 Pemda Kab/Kota & Masyarakat",
      icon: Building2,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Inisiatif ini dirancang sebagai konsorsium kolaboratif lintas wilayah yang secara resmi ditujukan kepada **5 Pemerintah Daerah Kabupaten/Kota se-Bolaang Mongondow Raya**:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 py-1 print:gap-1">
            <div className="p-2.5 rounded-xl bg-[#171922] border border-[#242836] font-semibold text-white print:bg-gray-100 print:border-gray-300 print:text-black">1. Pemkab Bolaang Mongondow Timur</div>
            <div className="p-2.5 rounded-xl bg-[#171922] border border-[#242836] font-semibold text-white print:bg-gray-100 print:border-gray-300 print:text-black">2. Pemkab Bolaang Mongondow Selatan</div>
            <div className="p-2.5 rounded-xl bg-[#171922] border border-[#242836] font-semibold text-white print:bg-gray-100 print:border-gray-300 print:text-black">3. Pemkab Bolaang Mongondow Utara</div>
            <div className="p-2.5 rounded-xl bg-[#171922] border border-[#242836] font-semibold text-white print:bg-gray-100 print:border-gray-300 print:text-black">4. Pemkab Bolaang Mongondow</div>
            <div className="p-2.5 rounded-xl bg-[#171922] border border-[#242836] font-semibold text-white print:bg-gray-100 print:border-gray-300 print:text-black">5. Pemkot Kotamobagu</div>
          </div>
          <p>
            Selain itu, proposal ini juga ditujukan kepada **Masyarakat Pemerhati Sejarah, Pemangku Adat, Tokoh Pemuda, dan Akademisi** untuk bersama-sama mendanai, mendukung riset, serta mengawal keabsahan narasi kebudayaan tanah Bolaang Mongondow.
          </p>
        </div>
      )
    },
    {
      id: "sec-3",
      title: "3. Inisiasi & Pendirian Resmi Yayasan Bolaang Mongondow Raya",
      icon: FileText,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Guna menjamin kepastian legalitas, akuntabilitas keuangan, dan tata kelola program yang profesional, Ginza Project memfasilitasi pembentukan badan hukum nirlaba permanen yaitu **Yayasan Bolaang Mongondow Raya**.
          </p>
          <p>
            Tahapan pendaftaran hukum mencakup penyusunan Akta Notaris pendirian badan yayasan, pengesahan Surat Keputusan (SK) dari Kemenkumham RI, penerbitan NPWP Badan, pendaftaran NIB Sektor Pendidikan & Kebudayaan, serta pembukaan rekening konsorsium resmi.
          </p>
        </div>
      )
    },
    {
      id: "sec-4",
      title: "4. Pembentukan Pengurus Yayasan & Keterwakilan 5 Daerah",
      icon: Users,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Pengurus Yayasan dibentuk berdasarkan **prinsip proporsional dan keterwakilan seimbang dari 5 Kabupaten/Kota**, mengombinasikan unsur Pemerintah Daerah (Dinas Pendidikan & Kebudayaan) serta unsur Non-Pemerintah (Tokoh Adat, Peneliti, & Komunitas Kebudayaan).
          </p>
          <div className="p-3 rounded-2xl bg-[#171922] border border-[#242836] space-y-1.5 print:bg-gray-50 print:border-gray-300">
            <h4 className="font-bold text-amber-400 print-accent">Dua Fungsi Utama Dewan Pengurus:</h4>
            <ul className="list-disc list-inside space-y-1 text-xs print:text-[9pt]">
              <li><strong>Verifikator Internal:</strong> Menjadi majelis verifikasi data yang meninjau, menguji, dan menyetujui seluruh naskah sejarah serta entri kosa kata sebelum diunggah ke publik.</li>
              <li><strong>Trainer Penalaran AI:</strong> Memberikan supervisi ilmiah untuk melakukan fine-tuning dan memperkuat kemampuan penalaran cerdas dari Bogani AI.</li>
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
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Keberadaan markas fisik permanen diperlukan sebagai pusat riset, administrasi, dan koordinasi yang diberi nama **Markas Kebudayaan &ldquo;Baloy&rdquo;**.
          </p>
          <p>
            Gedung Baloy difungsikan sebagai: (1) Ruang Sidang Verifikasi Data oleh Dewan Pakar; (2) Studio Rekaman Audio Fonetik Penutur Native; (3) Perpustakaan Digital Manuskrip Kuno; dan (4) Pusat Pelatihan Literasi Aksara Mongondow bagi Pelajar.
          </p>
        </div>
      )
    },
    {
      id: "sec-6",
      title: "6. Operasional Tim Verifikator & Pengumpul Data Sejarah",
      icon: ShieldCheck,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Proses verifikasi ilmiah membutuhkan dukungan operasional dan insentif kehormatan bagi 7 disiplin pakar verifikator:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-xs font-mono text-center print:gap-1">
            <div className="p-1.5 rounded bg-[#181B26] border border-[#262B3D] text-amber-400 font-bold print:bg-gray-100 print:border-gray-300 print:text-black">1. Paleografer</div>
            <div className="p-1.5 rounded bg-[#181B26] border border-[#262B3D] text-cyan-400 font-bold print:bg-gray-100 print:border-gray-300 print:text-black">2. Linguis</div>
            <div className="p-1.5 rounded bg-[#181B26] border border-[#262B3D] text-purple-400 font-bold print:bg-gray-100 print:border-gray-300 print:text-black">3. Filolog</div>
            <div className="p-1.5 rounded bg-[#181B26] border border-[#262B3D] text-emerald-400 font-bold print:bg-gray-100 print:border-gray-300 print:text-black">4. Arkeolog</div>
            <div className="p-1.5 rounded bg-[#181B26] border border-[#262B3D] text-rose-400 font-bold print:bg-gray-100 print:border-gray-300 print:text-black">5. Epigraf</div>
            <div className="p-1.5 rounded bg-[#181B26] border border-[#262B3D] text-blue-400 font-bold print:bg-gray-100 print:border-gray-300 print:text-black">6. Historian</div>
            <div className="p-1.5 rounded bg-[#181B26] border border-[#262B3D] text-amber-300 font-bold col-span-2 md:col-span-2 print:bg-gray-100 print:border-gray-300 print:text-black">7. Tokoh Adat / Penutur Asli</div>
          </div>
          <p>
            Tim pakar bertugas melakukan ekspedisi riset ke desa-desa tua adat, merekam penutur lisan Owadu/Katu-katu, memotret manuskrip kayu/kertas kuno, dan memvalidasi struktur etimologi kata.
          </p>
        </div>
      )
    },
    {
      id: "sec-7",
      title: "7. Biaya Penyempurnaan Website: UI/UX Design & Micro-Animations",
      icon: Layout,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Perancangan Design System UI/UX kelas dunia dengan sistem warna HSL yang fleksibel, tipografi modern Inter & Roboto, mikro-animasi transisi yang halus, serta arsitektur antarmuka yang siap bersaing dengan platform internasional (*state-of-the-art*).
          </p>
        </div>
      )
    },
    {
      id: "sec-8",
      title: "8. Biaya Penyempurnaan Website: Domain & Keamanan Data",
      icon: Globe,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Alokasi sewa domain resmi `mongondowpedia.com`, sertifikat enkripsi SSL Enterprise 256-bit, fitur proteksi serangan DDoS dari Cloudflare Pro, serta backup basis data otomatis secara harian.
          </p>
        </div>
      )
    },
    {
      id: "sec-9",
      title: "9. Biaya Penyempurnaan Website: Vector Database & Knowledge Base RAG",
      icon: Database,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Penggunaan infrastruktur Supabase Enterprise PostgreSQL dengan ekstensi `pgvector` guna mengindeks lebih dari 100.000 dokumen, manuskrip, dan kamus menjadi representasi matriks vektor RAG untuk jawaban AI yang presisi.
          </p>
        </div>
      )
    },
    {
      id: "sec-10",
      title: "10. Biaya Penyempurnaan Website: AI Provider (Gemini Pro & Voice TTS)",
      icon: Cpu,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Pembiayaan token API High-Volume Google Gemini 1.5 Pro dan mesin sintetis suara dua arah (*Bogani AI Voice Mode*) untuk merespons pertanyaan pengguna via ucapan audio dalam waktu 5-10 detik.
          </p>
        </div>
      )
    },
    {
      id: "sec-11",
      title: "11. Pengembangan Mobile Application (Android & iOS)",
      icon: Smartphone,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Pengembangan aplikasi mobile native cross-platform (Android & iOS) yang didistribusikan gratis melalui Google Play Store dan Apple App Store. Aplikasi ini dilengkapi fitur **Offline Mode Kamus** agar tetap dapat dibuka oleh siswa di area pelosok tanpa koneksi internet.
          </p>
        </div>
      )
    },
    {
      id: "sec-12",
      title: "12. Tools Educational 'Muatan Lokal': Tingkat SD (Sekolah Dasar)",
      icon: GraduationCap,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Pengembangan modul digital Muatan Lokal SD: kuis interaktif tebak gambar aksara, audio dongeng cerita rakyat Mongondow, dan media pengenalan kata benda dalam bahasa ibu untuk siswa sekolah dasar.
          </p>
        </div>
      )
    },
    {
      id: "sec-13",
      title: "13. Tools Educational 'Muatan Lokal': Tingkat SMP (Sekolah Menengah Pertama)",
      icon: GraduationCap,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
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
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
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
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Program non-finansial swadaya: Pelatihan pengajaran Aksara Mongondow untuk guru-guru sekolah, pembentukan klub literasi di tiap kecamatan, serta webinar pendidikan sejarah BMR.
          </p>
        </div>
      )
    },
    {
      id: "sec-16",
      title: "16. Program Non-Financing: Gema Tradisi, Teater Budaya & Festival BMR",
      icon: Sparkles,
      content: (
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
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
        <div className="space-y-3 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Perkiraan alokasi dana secara transparan dengan skema pembiayaan konsorsium gotong-royong yang dibagi rata kepada 5 Pemerintah Kabupaten/Kota se-BMR:
          </p>
          <div className="p-3 rounded-2xl bg-[#171922] border border-[#242836] flex flex-col md:flex-row justify-between items-center gap-3 font-mono print:bg-gray-100 print:border-gray-300">
            <div>
              <p className="text-gray-400 text-xs print:text-black">Total Anggaran (1 Tahun):</p>
              <p className="text-lg md:text-xl font-bold text-amber-400 print:text-black">Rp {grandTotalCost.toLocaleString("id-ID")}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs print:text-black">Alokasi Per Pemda (5 Daerah):</p>
              <p className="text-lg md:text-xl font-bold text-cyan-400 print:text-blue-900">Rp {totalPerDistrict.toLocaleString("id-ID")} / Pemda</p>
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
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9.5pt]">
          <p>
            Penggunaan dana hibah akan diaudit secara terbuka oleh Akuntan Publik Independen dan laporan pemanfaatan dana dipublikasikan secara transparan di situs MongondowPedia.
          </p>
          <p className="font-semibold text-white print:text-black">
            Langkah Selanjutnya: Penjadwalan Audiensi Resmi bersama Bupati/Wali Kota dan Kepala Dinas Pendidikan & Kebudayaan 5 Daerah se-Bolaang Mongondow Raya.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans selection:bg-amber-500/30 pb-24 print:bg-white print:text-black print:pb-0">
      
      {/* CSS Print Styles for A4 PDF Output - Compact Layout to Eliminate Huge Gaps */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 10mm 10mm 10mm;
          }
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 9.5pt !important;
            line-height: 1.35 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-full-width {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Eliminate massive vertical gaps by setting continuous page flow */
          .space-y-10 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 8pt !important;
          }
          .space-y-6 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 6pt !important;
          }
          .space-y-4 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 4pt !important;
          }
          .space-y-3 > :not([hidden]) ~ :not([hidden]) {
            margin-top: 3pt !important;
          }
          .print-section {
            background-color: #ffffff !important;
            border: 1px solid #e5e7eb !important;
            color: #000000 !important;
            box-shadow: none !important;
            page-break-inside: auto !important;
            break-inside: auto !important;
            margin-bottom: 6pt !important;
            padding: 8pt 10pt !important;
            border-radius: 6px !important;
          }
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print-content {
            display: block !important;
            color: #1f2937 !important;
            padding: 4pt 6pt !important;
          }
          .print-text-dark {
            color: #000000 !important;
          }
          .print-accent {
            color: #b45309 !important;
          }
          table th, table td {
            padding: 3pt 5pt !important;
            font-size: 8.5pt !important;
          }
          tfoot tr td {
            background-color: #f3f4f6 !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Background Lighting (Hidden on Print) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-600/10 via-orange-600/5 to-transparent blur-3xl pointer-events-none z-0 no-print" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 md:pt-12 space-y-8 print-full-width">
        
        {/* Navigation Breadcrumb & Action Bar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C1E24] pb-4 gap-3 no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <Link href="/info" className="hover:text-white transition-colors">Info</Link>
            <span>/</span>
            <span className="text-amber-400">Proposal Pengembangan</span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setExpandAll(!expandAll)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#252833] bg-[#111318] text-amber-400 hover:bg-[#1A1D26] transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{expandAll ? "Tutup Semua Section" : "Buka Semua Section (Lengkap)"}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white transition-all shadow-md flex items-center gap-1.5"
              title="Cetak Proposal / Simpan Sebagai PDF A4"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Cetak / Export PDF A4</span>
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
        <div className="p-8 md:p-12 rounded-3xl bg-[#111318] border border-[#232733] space-y-6 relative overflow-hidden text-center shadow-2xl print-section print-avoid-break">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold font-mono uppercase tracking-widest no-print">
            <Award className="w-4 h-4" />
            <span>Dokumen Resmi Proposal Ginza Project</span>
          </div>

          <div className="space-y-3 max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight print-text-dark print:text-xl">
              PROPOSAL PERMOHONAN DUKUNGAN PENGEMBANGAN PLATFORM DIGITAL & PENDIRIAN YAYASAN BOLAANG MONGONDOW RAYA
            </h1>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-mono print-text-dark print:text-[9pt]">
              Nomor Dokumen: 001/PROP-GINZA/BMR/2026 • Perspektif System Architecture Developers
            </p>
          </div>

          {/* Addressed To Badge Box */}
          <div className="pt-4 border-t border-[#1D212E] max-w-3xl mx-auto space-y-3 print:border-gray-300 print:pt-2">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wider print-accent print:text-[8.5pt]">Ditujukan Kepada Yth:</p>
            <div className="flex flex-wrap items-center justify-center gap-2 print:gap-1">
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200 print:bg-gray-100 print:border-gray-300 print:text-black print:text-[8pt] print:px-2 print:py-0.5">1. Pemkab Boltim</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200 print:bg-gray-100 print:border-gray-300 print:text-black print:text-[8pt] print:px-2 print:py-0.5">2. Pemkab Bolsel</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200 print:bg-gray-100 print:border-gray-300 print:text-black print:text-[8pt] print:px-2 print:py-0.5">3. Pemkab Bolmut</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200 print:bg-gray-100 print:border-gray-300 print:text-black print:text-[8pt] print:px-2 print:py-0.5">4. Pemkab Bolmong</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-[#181B26] border border-[#282D3F] text-gray-200 print:bg-gray-100 print:border-gray-300 print:text-black print:text-[8pt] print:px-2 print:py-0.5">5. Pemkot Kotamobagu</span>
              <span className="text-[11px] font-semibold px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 print:bg-blue-50 print:border-blue-300 print:text-blue-900 print:text-[8pt] print:px-2 print:py-0.5">Masyarakat Pemerhati Sejarah BMR</span>
            </div>
          </div>
        </div>

        {/* Interactive RAB Budget Table Filter */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#232733] space-y-4 print-section print-avoid-break">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1D212E] pb-3 print:border-gray-300 print:pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs font-mono print-accent print:text-[8.5pt]">
                <Calculator className="w-4 h-4" />
                <span>KALKULATOR RAB INTERAKTIF</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight print-text-dark print:text-base">Rincian Anggaran Biaya (RAB) & Matriks Pendanaan</h2>
            </div>

            {/* Filter Selector (Hidden on Print) */}
            <div className="flex items-center gap-2 no-print">
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
            <table className="w-full text-left border-collapse text-xs print:text-[8.5pt]">
              <thead>
                <tr className="border-b border-[#232733] bg-[#161822] text-gray-400 font-mono print:bg-gray-100 print:text-black print:border-gray-300">
                  <th className="p-3 print:p-1.5">No / Kategori</th>
                  <th className="p-3 print:p-1.5">Komponen Kebutuhan Developer</th>
                  <th className="p-3 print:p-1.5">Satuan</th>
                  <th className="p-3 print:p-1.5 text-right">Total Anggaran (Rp)</th>
                  <th className="p-3 print:p-1.5 text-right">Porsi Per Pemda (5 Daerah)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D212E] print:divide-gray-300">
                {budgetItems.map((b, i) => (
                  <tr key={i} className="hover:bg-[#161822] transition-colors print:hover:bg-transparent">
                    <td className="p-3 print:p-1.5 font-semibold text-amber-400 print:text-amber-900">{b.category}</td>
                    <td className="p-3 print:p-1.5 text-gray-200 font-medium print:text-black">{b.item}</td>
                    <td className="p-3 print:p-1.5 text-gray-400 font-mono print:text-gray-700">{b.units}</td>
                    <td className="p-3 print:p-1.5 text-right font-mono font-bold text-white print:text-black">
                      {b.total > 0 ? `Rp ${b.total.toLocaleString("id-ID")}` : "Non-Financing"}
                    </td>
                    <td className="p-3 print:p-1.5 text-right font-mono font-bold text-cyan-400 print:text-blue-900">
                      {b.districtShare > 0 ? `Rp ${b.districtShare.toLocaleString("id-ID")}` : "Gotong Royong"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-amber-500/40 bg-[#191C28] font-mono text-sm print:bg-gray-100 print:text-black print:border-gray-400 print:text-xs">
                  <td colSpan={3} className="p-3 print:p-2 font-bold text-white print:text-black">
                    TOTAL KONSORSIUM (18 SECTION)
                  </td>
                  <td className="p-3 print:p-2 text-right font-extrabold text-amber-400 print:text-black">
                    Rp {grandTotalCost.toLocaleString("id-ID")}
                  </td>
                  <td className="p-3 print:p-2 text-right font-extrabold text-cyan-400 print:text-blue-900">
                    Rp {totalPerDistrict.toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* 18 Proposal Sections (Continuous Flow on Print) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#1D212E] pb-2 print:border-gray-300">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 print-text-dark print:text-base">
              <Layers className="w-5 h-5 text-amber-400 print-accent" />
              <span>18 Section Rincian Detail Proposal Ginza Project</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono no-print">Tampilan PDF A4 Siap Cetak</span>
          </div>

          <div className="space-y-2.5 print:space-y-2">
            {sectionsList.map((sec) => {
              const IconComp = sec.icon;
              const isExpanded = expandAll || activeSection === sec.id;
              return (
                <div
                  key={sec.id}
                  className="rounded-2xl bg-[#111318] border border-[#232733] overflow-hidden transition-all duration-200 print-section"
                >
                  <button
                    onClick={() => setActiveSection(activeSection === sec.id ? null : sec.id)}
                    className="w-full p-4 md:p-5 flex items-center justify-between text-left hover:bg-[#161822] transition-colors focus:outline-none no-print"
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

                  {/* Header Title for Print View */}
                  <div className="hidden print:flex items-center gap-2 p-2.5 border-b border-gray-200 bg-gray-50">
                    <IconComp className="w-4 h-4 text-amber-800 shrink-0" />
                    <h3 className="text-xs font-bold text-black">{sec.title}</h3>
                  </div>

                  {/* Section Text Content (Always Visible on Print View) */}
                  <div className={`${isExpanded ? "block" : "hidden"} print:block p-4 border-t border-[#1E2230] bg-[#141620] print-content print:border-none print:p-2.5`}>
                    {sec.content}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* OUTPUT STRATEGIS & TARGET CAPAIAN UTAMA (OUTPUT PALING BAWAH) */}
        {/* ==================================================================== */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#232733] space-y-4 print-section">
          <div className="flex items-center gap-2.5 border-b border-[#1D212E] pb-3 print:border-gray-300 print:pb-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 print:bg-emerald-50 print:border-emerald-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase no-print">
                Target Realisasi Utama
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight print-text-dark print:text-base">
                OUTPUT STRATEGIS & TARGET CAPAIAN GINZA PROJECT & YAYASAN BMR
              </h2>
            </div>
          </div>

          <p className="text-xs md:text-sm text-gray-300 leading-relaxed print-text-dark print:text-[9pt]">
            Melalui investasi dukungan pendanaan dari 5 Pemerintah Daerah Kabupaten/Kota serta sumbangsih masyarakat pemerhati sejarah, Ginza Project berkomitmen menyampaikan **8 Output Utama** berikut sebagai bentuk pertanggungjawaban karya:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2">
            {outputsList.map((out, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#161822] border border-[#232736] space-y-1.5 relative overflow-hidden hover:border-emerald-500/40 transition-all print:bg-gray-50 print:border-gray-300 print:p-2.5 print-avoid-break"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 print:bg-emerald-100 print:text-emerald-900 print:text-[8pt]">
                    OUTPUT {out.number}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
                <h3 className="text-sm font-bold text-white print-text-dark print:text-[9.5pt]">
                  {out.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed print-text-dark font-normal print:text-[8.5pt]">
                  {out.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Proposal Signoff Box */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#232733] space-y-4 text-center print-section print-avoid-break">
          <h3 className="text-lg font-bold text-white print-text-dark print:text-base">Lembar Komunikasi & Audiensi Tim Pengembang</h3>
          <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed print-text-dark print:text-[9pt]">
            Untuk permohonan audiensi resmi, penyerahan berkas proposal cetak fisik, atau diskusi teknis bersama Tim Developers Ginza Project, silakan hubungi:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <a
              href="mailto:developer@mongondowpedia.com"
              className="py-2 px-3.5 rounded-xl bg-[#181B26] border border-[#282D3F] text-cyan-400 hover:border-cyan-500 transition-all flex items-center gap-2 print:bg-gray-100 print:border-gray-300 print:text-black print:text-[8.5pt]"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>developer@mongondowpedia.com</span>
            </a>

            <a
              href="https://maps.app.goo.gl/Gznpt6NtqFNLxE4F8"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3.5 rounded-xl bg-[#181B26] border border-[#282D3F] text-rose-300 hover:border-rose-500 transition-all flex items-center gap-2 print:bg-gray-100 print:border-gray-300 print:text-black print:text-[8.5pt]"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Kotabunan, Jl. Tangkudegan</span>
            </a>
          </div>
        </div>

        {/* Homepage Matching Footer */}
        <div className="pt-6 border-t border-[#1C1F28] text-center space-y-1 print:border-gray-300 print:pt-3">
          <p className="text-xs text-gray-500 font-sans print:text-black print:text-[8pt]">
            (Ginza Project) MongondowPedia Inc. All rights reserved.
          </p>
          <p className="font-mono text-[10px] text-gray-600 print:text-gray-700 print:text-[7.5pt]">
            Portal Kebudayaan & Bahasa Bolaang Mongondow Raya • Powered by MyAI OS
          </p>
        </div>

      </div>
    </div>
  );
}
