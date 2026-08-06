'use client';

import Link from "next/link";
import {
  BookOpen,
  Languages,
  Type,
  Edit3,
  Trophy,
  Database,
  ShieldCheck,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  ExternalLink,
  Bot,
  MapPin,
  Cpu,
  Globe,
  HeartHandshake,
  Building2,
  GraduationCap,
  Mail
} from "lucide-react";

export default function InfoPage() {
  const tools = [
    {
      id: "kamus",
      title: "Kamus Bahasa Mongondow",
      category: "Tools Linguistik",
      href: "/kamus",
      icon: Languages,
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
      description:
        "Indeks kosa kata multi-bahasa (Mongondow ↔ Indonesia ↔ English ↔ Dialek Totabuan) dilengkapi fonetik IPA, aksara native, serta audio pelafalan asli.",
      features: ["Pencarian Kosa Kata & Frasa", "Transkripsi Fonetik IPA", "Audio Suara Penutur Native", "Contoh Penggunaan Kalimat"]
    },
    {
      id: "aksara",
      title: "Aksara Mongondow Native",
      category: "Tools Kebudayaan",
      href: "/aksara-mongondow",
      icon: Type,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
      description:
        "Portal dokumentasi & eksplorasi 88 suku kata native Aksara Kuno Bolaang Mongondow lengkap dengan titik Unicode PUA & pembagian kategori bunyi.",
      features: ["Indeks 88 Suku Kata Native", "Pemecahan Bunyi Vokal & Konsonan", "Unicode PUA Codepoints", "Gaya Aksara Vektor HD"]
    },
    {
      id: "transliterasi",
      title: "Transliterasi Latin ↔ Aksara",
      category: "Tools Konversi",
      href: "/aksara-mongondow",
      icon: Layers,
      color: "from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30",
      description:
        "Mesin alih aksara otomatis dari teks Latin ke Aksara Mongondow (dan sebaliknya) secara real-time menggunakan algoritma aturan Fonotaktik BMR.",
      features: ["Konversi Teks Real-Time", "Aturan Fonotaktik Austronesia", "Salin & Bagikan Vektor Aksara", "Kesesuaian Suku Kata"]
    },
    {
      id: "studio-menulis",
      title: "Studio Latihan Menulis Aksara",
      category: "Interactive Studio",
      href: "/aksara-mongondow",
      icon: Edit3,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
      description:
        "Canvas menggambar & menulis interaktif tempat pengguna dapat melatih coretan (*stroke*) tangan menulis Aksara Mongondow secara presisi.",
      features: ["Canvas Menulis Touch & Mouse", "Panduan Urutan Coretan (Stroke Guide)", "Penyesuaian Ketebalan Kuas", "Reset & Simpan Gambar Canvas"]
    },
    {
      id: "kuis-tebak-aksara",
      title: "Kuis & Latihan Tebak Aksara",
      category: "Edukasi & Game",
      href: "/aksara-mongondow",
      icon: Trophy,
      color: "from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30",
      description:
        "Game cerdas cermat interaktif untuk menguji pemahaman membaca Aksara Mongondow, kosa kata adat, dan sejarah raja-raja Bolaang Mongondow.",
      features: ["Mode Tebak Aksara Interaktif", "Skor & Umpan Balik Instan", "Tingkat Kesulitan Kuis Adaptif", "Tantangan Kosa Kata Adat"]
    }
  ];

  const knowledgeTopics = [
    {
      title: "Graphify Silsilah Raja-Raja Mongondow",
      badge: "Grafik Silsilah Interaktif",
      description: "Pemetaan silsilah sutan, dinasti, dan penguasa adat dari era Gumalangit-Tendeduata, Zaman Bogani, Era Punu', hingga Dinasti Manoppo & D.C. Manoppo.",
      href: "/knowledge"
    },
    {
      title: "Graphify Etimologi & Morfologi Bahasa",
      badge: "Kajian Austronesia Kuno",
      description: "Penelusuran asal-usul kata Bolaang, Mongondow, Totabuan, Lipu', Baloy, serta sistem pembentukan afiksasi prefiks Mo-, Moko-, Moto-, dan Po-.",
      href: "/knowledge"
    },
    {
      title: "Graphify Pemetaan Konsep Adat & Falsafah",
      badge: "Nilai Falsafah Adat",
      description: "Analisis struktur falsafah Tri-Motto (Mototompiaan, Mototabian, Mototanoban), stratifikasi sosial masyarakat BMR, serta ritus siklus hidup.",
      href: "/knowledge"
    },
    {
      title: "Dokumentasi Sastra Lisan & Hukum Adat",
      badge: "Arsip Kebudayaan",
      description: "Himpunan naskah lisan Owadu, Katu-katu, aturan hukum adat Totabuan, serta panduan tata cara upacara perkawinan & penobatan adat.",
      href: "/knowledge"
    }
  ];

  const indicators = [
    {
      status: "Terverifikasi (Verified)",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
      desc: "Informasi/kosa kata yang telah diteliti, disetujui, dan divalidasi oleh Dewan Verifikator & Tokoh Adat Bolaang Mongondow Raya."
    },
    {
      status: "Menunggu Peninjauan (Pending Review)",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      icon: Clock,
      desc: "Usulan entri data atau entri perbaikan baru dari komunitas yang sedang berada dalam antrean evaluasi verifikator."
    },
    {
      status: "Konsep / Draf (Draft)",
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      icon: FileText,
      desc: "Data awal hasil himpunan tim peneliti yang sedang disusun strukturnya sebelum diajukan ke sidang verifikasi."
    }
  ];

  return (
    <div className="min-h-screen bg-[#07080A] text-white font-sans selection:bg-blue-500/30 pb-16">
      
      {/* Background Lighting Elements */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-indigo-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 md:pt-12 space-y-12">
        
        {/* Navigation Breadcrumb with Location Address */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1C1E24] pb-4 gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            <span className="text-blue-400">Info</span>
            <span className="text-gray-600 hidden sm:inline">•</span>
            <a
              href="https://maps.app.goo.gl/Gznpt6NtqFNLxE4F8"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-gray-400 hover:text-cyan-400 transition-colors bg-[#111318] px-2.5 py-1 rounded-lg border border-[#232733]"
              title="Buka Peta Lokasi"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>Kotabunan, Jl. Tangkudegan</span>
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </a>
          </div>

          <Link
            href="/"
            className="self-start sm:self-auto text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#252833] bg-[#111318] text-gray-300 hover:text-white hover:border-gray-600 transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>Kembali ke Beranda</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Page Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-bold font-mono uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MongondowPedia Directory</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Pusat Informasi & Direktori Perkakas Platform
          </h1>

          <p className="text-sm md:text-base text-gray-400 leading-relaxed font-normal">
            Panduan menyeluruh mengenai seluruh perkakas digital (Tools), basis pengetahuan RAG (Knowledge Base), MyAI OS, serta mekanisme Ginza Project di MongondowPedia.
          </p>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 1: PERKAKAS DIGITAL (TOOLS) */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1D2029] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Perkakas Utama (Tools)</h2>
                <p className="text-xs text-gray-400">Pilih dan gunakan alat interaktif untuk eksplorasi kebudayaan</p>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#14161D] border border-[#232733] text-gray-400">
              5 Perkakas Aktif
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const IconComp = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative p-5 rounded-2xl bg-[#111318] border border-[#1F222C] hover:border-blue-500/40 transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-blue-500/5 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-xl border ${tool.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#1A1D26] text-gray-400 border border-[#262A38]">
                        {tool.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        <span>{tool.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-xs text-gray-400 mt-1.5 leading-relaxed font-normal">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1C1F28] space-y-1.5">
                    {tool.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 2: BASIS PENGETAHUAN (KNOWLEDGE BASE) */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1D2029] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Basis Pengetahuan (Knowledge Base)</h2>
                <p className="text-xs text-gray-400">Koleksi naskah, silsilah raja-raja, dan etimologi Austronesia Kuno</p>
              </div>
            </div>
            <Link
              href="/knowledge"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>Buka Knowledge Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {knowledgeTopics.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="p-5 rounded-2xl bg-[#111318] border border-[#1F222C] hover:border-purple-500/40 transition-all duration-200 space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/30">
                    {item.badge}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 3: INFORMASI LENGKAP & INDIKATOR DATA */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 border-b border-[#1D2029] pb-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Informasi Lengkap & Status Verifikasi Data</h2>
              <p className="text-xs text-gray-400">Standar tata kelola keabsahan informasi dan peran dewan verifikator</p>
            </div>
          </div>

          {/* Indikator Status Badges Card */}
          <div className="p-6 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              <span>Indikator Lencana (Status Badges) pada Website</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {indicators.map((ind, i) => {
                const Icon = ind.icon;
                return (
                  <div key={i} className="p-4 rounded-2xl bg-[#171922] border border-[#242836] space-y-2.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold font-mono px-2.5 py-1 rounded-lg border ${ind.badgeColor}`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span>{ind.status}</span>
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {ind.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Mechanics: Verification Pipeline & Verificators */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cara Kerja Verifikasi */}
            <div className="p-6 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Cara Kerja & Alur Verifikasi Informasi</span>
              </h3>
              <ul className="space-y-3 text-xs text-gray-300 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span><strong>Pengusulan Komunitas (Submission):</strong> Anggota masyarakat atau peneliti mengusulkan entri kata/perbaikan melalui tombol kontribusi.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span><strong>Sidang Sidik Linguistik:</strong> Dewan verifikator membandingkan naskah pengajuan dengan sumber rujukan sejarah terverifikasi & fonetik baku BMR.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span><strong>Penerbitan Lencana (Publish):</strong> Data yang memenuhi kuorum verifikasi akan mendapatkan status <em>Terverifikasi</em> dan secara otomatis memperkaya basis pengetahuan Bogani AI.</span>
                </li>
              </ul>
            </div>

            {/* Platform Identity & AI Integration */}
            <div className="p-6 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                <span>Teknologi Bogani AI (MyAI OS)</span>
              </h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Asisten kecerdasan buatan <strong>Bogani AI (Abo&apos;)</strong> dirancang khusus menggunakan arsitektur <em>Retrieval-Augmented Generation (RAG)</em> yang terhubung langsung dengan dokumen sejarah dan Kamus MongondowPedia.
              </p>
              <div className="p-3.5 rounded-2xl bg-[#161922] border border-[#242836] space-y-1.5">
                <p className="text-[11px] font-semibold text-blue-400">Integritas Respon AI:</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Bogani AI mengutamakan fakta dari dokumen yang sudah terverifikasi adat dan tidak akan mengarang tebakan kosa kata di luar referensi shahih.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 4: INFORMASI TENTANG MyAI OS (myai.nexus) */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1D2029] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Teknologi Pintar: MyAI OS</h2>
                <p className="text-xs text-gray-400">Sistem Operasi Kecerdasan Buatan Terpadu (AI Engine)</p>
              </div>
            </div>
            <a
              href="https://myai.nexus"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-semibold px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>myai.nexus</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-3xl pointer-events-none" />

            <div className="space-y-3 max-w-3xl">
              <span className="text-[10px] font-mono font-bold tracking-widest px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
                AI Operating System Architecture
              </span>
              <h3 className="text-lg md:text-2xl font-bold text-white leading-tight">
                Penopang Utama Penalaran Kecerdasan Buatan & Interaksi Suara Real-Time
              </h3>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                <strong>MyAI OS</strong> adalah fondasi platform kecerdasan buatan terpadu yang memotori mesin Bogani AI (Abo&apos;), sistem pencarian dokumen RAG (Retrieval-Augmented Generation), alih aksara Fonotaktik Austronesia, hingga streaming interaksi percakapan suara (*Real-Time Voice Mode*).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#161922] border border-[#242836] space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                  <Database className="w-4 h-4 shrink-0" />
                  <span>Knowledge Graph Memory</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Menghubungkan entri kosa kata, silsilah kerajaan, dan naskah adat Bolaang Mongondow dalam struktur grafis terintegrasi.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#161922] border border-[#242836] space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                  <Bot className="w-4 h-4 shrink-0" />
                  <span>Real-Time Low-Latency Voice</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Dukungan percakapan suara dua arah secara langsung dengan respon fonetik Mongondow yang alami & lancar.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#161922] border border-[#242836] space-y-2">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                  <Globe className="w-4 h-4 shrink-0" />
                  <span>Dokumentasi Resmi</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Pelajari selengkapnya mengenai spesifikasi dan kapabilitas teknis MyAI OS di situs resmi{" "}
                  <a
                    href="https://myai.nexus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 underline hover:text-cyan-300 font-mono"
                  >
                    https://myai.nexus
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* SECTION 5: GINZA PROJECT & INISIASI YAYASAN (PALING BAWAH) */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#1D2029] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Ginza Project & Inisiasi Yayasan</h2>
                <p className="text-xs text-gray-400">Proyek Edukasi Sejarah, Kebudayaan & Modernisasi Teknologi BMR</p>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Educational Project
            </span>
          </div>

          <div className="p-6 md:p-8 rounded-3xl bg-[#111318] border border-[#1F222C] space-y-6 relative overflow-hidden">
            <div className="space-y-4 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                  Inisiasi Kebudayaan & Edukasi
                </span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase">
                  Yayasan Bolaang Mongondow Raya
                </span>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-white leading-tight">
                Modernisasi Teknologi Sejarah & Kebudayaan Bolaang Mongondow
              </h3>

              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                <strong>Ginza Project</strong> merupakan proyek edukasi (<em>Educational Project</em>) yang mendedikasikan diri untuk dokumentasi sejarah, pelestarian bahasa, serta modernisasi kebudayaan Bolaang Mongondow melalui integrasi Bogani AI dan berbagai alat digital interaktif lainnya.
              </p>

              <div className="p-4 rounded-2xl bg-[#171922] border border-[#262B3B] space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs md:text-sm">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>Inisiasi Pembentukan Yayasan & Verifikator Internal</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Saat ini, Ginza Project sedang menginisiasi pendirian <strong>Yayasan &ldquo;Bolaang Mongondow Raya&rdquo;</strong> dan berada dalam tahapan pembentukan Pengurus Yayasan. Pengurus ini nantinya akan bertindak sebagai <strong>Verifikator Internal</strong> dari MongondowPedia sekaligus <strong>Trainer Penyempurnaan penalaran kecerdasan buatan Bogani AI</strong>.
                </p>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed italic">
                Project ini sedang dalam tahap aktif pengembangan dan membutuhkan banyak sumber daya, kolaborasi riset, serta dukungan berkelanjutan untuk mencapai kesuksesannya secara menyeluruh.
              </p>
            </div>

            {/* Proposal Request Download CTA Button & Developer Contact */}
            <div className="pt-4 border-t border-[#1D202A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-not-allowed opacity-90"
                  title="Proposal Bantuan Dana Pengembangan (Segera Hadir)"
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Permintaan Bantuan Dana Pengembangan (Proposal)</span>
                </a>
                <span className="text-[11px] text-gray-500 font-mono text-center sm:text-left">
                  (Link proposal pendanaan akan segera diunggah)
                </span>
              </div>

              <a
                href="mailto:developer@mongondowpedia.com"
                className="py-2.5 px-4 rounded-xl bg-[#181A24] hover:bg-[#202330] border border-[#2B2F40] text-gray-300 hover:text-cyan-400 text-xs font-semibold font-mono transition-all flex items-center justify-center gap-2 shrink-0"
                title="Hubungi Pengembang"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>developer@mongondowpedia.com</span>
              </a>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* HOMEPAGE MATCHING FOOTER */}
        {/* ==================================================================== */}
        <div className="pt-8 border-t border-[#1C1F28] text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-gray-400">
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kontak Pengembang:</span>
            <a href="mailto:developer@mongondowpedia.com" className="text-cyan-400 hover:underline">
              developer@mongondowpedia.com
            </a>
          </div>
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
