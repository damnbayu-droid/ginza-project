import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Languages, 
  Bot, 
  Trophy, 
  GraduationCap, 
  Music, 
  Gamepad2, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Layers, 
  CheckCircle2, 
  Server,
  Sparkles,
  ExternalLink,
  Clock
} from 'lucide-react';

export const metadata = {
  title: 'MongondowPedia Ecosystem — Pusat Platform & Pembelajaran Digital Bolaang Mongondow',
  description: 'Ekosistem digital terpadu MongondowPedia: Ensiklopedia Digital, Kamus Bahasa, Bogani AI, Kuis Cerdas Cermat, Kurikulum Mulok, Seni & Musik, serta Game Simulator Tradisional.',
};

export default function EcosystemPage() {
  const ecosystemItems = [
    {
      id: 'mongondowpedia',
      title: 'MongondowPedia',
      badge: 'Live Platform',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      subtitle: 'Pusat Informasi & Ensiklopedia Digital Bolaang Mongondow',
      url: '/',
      domain: 'mongondowpedia.org',
      isReady: true,
      icon: BookOpen,
      accentGradient: 'from-blue-600 via-indigo-600 to-cyan-500',
      borderHover: 'hover:border-blue-500/50',
      glowColor: 'group-hover:shadow-blue-500/10',
      description:
        'Pusat dokumentasi terpadu Sejarah Kerajaan Bolaang Mongondow (Loloda Mokoagow), Adat Istiadat, Sastra Lisan, Rumpun Bahasa Austronesia Kuno, serta Arsip Tokoh Pembawa Peradaban Totabuan.',
      highlights: [
        'Dokumentasi Kerajaan & Silsilah Raja-Raja Mongondow',
        'Kajian Rumpun Bahasa Austronesia Kuno',
        'Arsip Sastra Lisan & Hukum Adat Totabuan',
        'Pembaharuan Data & Kontribusi Komunitas'
      ],
      tags: ['Sejarah', 'Ensiklopedia', 'Austronesia Kuno', 'Adat Adat']
    },
    {
      id: 'kamus-mongondow',
      title: 'Kamus Bahasa Mongondow',
      badge: 'Live Database',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
      subtitle: 'Indeks Multi-Bahasa, Dialek Totabuan & Aksara Native',
      url: '/kamus',
      domain: 'mongondowpedia.org/kamus',
      isReady: true,
      icon: Languages,
      accentGradient: 'from-cyan-600 via-teal-600 to-emerald-500',
      borderHover: 'hover:border-cyan-500/50',
      glowColor: 'group-hover:shadow-cyan-500/10',
      description:
        'Kamus interaktif multi-bahasa terpadu (Mongondow ↔ Dialek Totabuan ↔ Indonesia ↔ English) lengkap dengan fonetik IPA, aksara Mongondow (88 suku kata), serta himpunan frasa percakapan harian.',
      highlights: [
        'Penelusuran Kosa Kata & Frasa Percakapan Harian',
        'Pemecahan Aksara Mongondow Native (Breakdown)',
        'Transkripsi Fonetik IPA & Terjemahan Multi-Bahasa',
        'Verifikasi Berjenjang oleh Tokoh Adat'
      ],
      tags: ['Kamus', 'Dialek Totabuan', 'Aksara Native', 'Multi-Bahasa']
    },
    {
      id: 'bogani-ai',
      title: "Bogani AI (Abo')",
      badge: 'AI Intelligence',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      subtitle: 'Asisten Kecerdasan Buatan Berbasis Adat & Memori Jangka Panjang',
      url: '/#chat',
      domain: 'mongondowpedia.org/bogani-ai',
      isReady: true,
      icon: Bot,
      accentGradient: 'from-purple-600 via-indigo-600 to-blue-500',
      borderHover: 'hover:border-purple-500/50',
      glowColor: 'group-hover:shadow-purple-500/10',
      description:
        'Asisten kecerdasan buatan cerdas yang memahami konteks adat, rumpun bahasa Austronesia, serta menjaga kesantunan tutur kata melalui sistem Reasoning tinggi dan Memori Jangka Panjang.',
      highlights: [
        'Reasoning Tinggi Cerdas (Multi-Provider AI Gateway)',
        'Memori Jangka Panjang (Long-Term Knowledge Storage)',
        'Pemahaman Adat & Tata Krama Menyapa (Tabe\' & Dega Niondon)',
        'Uji Coba Direct Playground di Admin Dashboard'
      ],
      tags: ['AI Gateway', 'Long-Term Memory', 'Reasoning Engine', 'Persona Adat']
    },
    {
      id: 'kuis-mongondow',
      title: 'Kuis Bahasa Mongondow (Cerdas Cermat)',
      badge: 'Fitur Edukasi',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      subtitle: 'Game Kuis Interaktif Bahasa, Adat & Sejarah Mongondow',
      url: '#',
      domain: 'mongondowpedia.org/kuis',
      isReady: true,
      icon: Trophy,
      accentGradient: 'from-amber-500 via-orange-600 to-yellow-500',
      borderHover: 'hover:border-amber-500/50',
      glowColor: 'group-hover:shadow-amber-500/10',
      description:
        'Wahana permainan kuis cerdas cermat interaktif untuk menguji dan mengasah pemahaman bahasa Mongondow, sejarah raja-raja, serta kebudayaan lokal bagi seluruh generasi muda.',
      highlights: [
        'Kategori Kuis: Bahasa, Adat, Sejarah & Aksara',
        'Tingkat Kesulitan Adaptif (Pemula hingga Pakar)',
        'Papan Peringkat (Leaderboard) Skor Tertinggi',
        'Mode Tantangan Harian & Pembahasan Jawaban'
      ],
      tags: ['Cerdas Cermat', 'Leaderboard', 'Tantangan Harian', 'Edukasi']
    },
    {
      id: 'educational-mulok',
      title: 'Educational (Mulok SD, SMP & SMA)',
      badge: 'Kurikulum Mulok',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      subtitle: 'Modul Pembelajaran Muatan Lokal Resmi Sekolah',
      url: '#',
      domain: 'mongondowpedia.org/educational',
      isReady: true,
      icon: GraduationCap,
      accentGradient: 'from-emerald-600 via-teal-600 to-cyan-500',
      borderHover: 'hover:border-emerald-500/50',
      glowColor: 'group-hover:shadow-emerald-500/10',
      description:
        'Kurikulum digital mata pelajaran Muatan Lokal (Mulok) resmi untuk jenjang SD, SMP, dan SMA di kawasan Bolaang Mongondow Raya untuk menjaga kelestarian bahasa & budaya sejak dini.',
      highlights: [
        'Modul Ajar Mulok Terstruktur per Jenjang Kelas',
        'Lembar Kerja Siswa (LKS) & Lembar Evaluasi',
        'Audio Pelafalan Fonetik & Video Pembelajaran',
        'Panduan Guru Pembimbing & Silabus Mulok'
      ],
      tags: ['Kurikulum Mulok', 'SD/SMP/SMA', 'Silabus Digital', 'Buku Ajar']
    },
    {
      id: 'seni-musik-tari',
      title: 'Seni, Musik & Tari Mongondow',
      badge: 'Arsip Kebudayaan',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
      subtitle: 'Galeri Pembelajaran Seni Tradisional Totabuan',
      url: '#',
      domain: 'mongondowpedia.org/seni-budaya',
      isReady: true,
      icon: Music,
      accentGradient: 'from-rose-600 via-pink-600 to-purple-500',
      borderHover: 'hover:border-rose-500/50',
      glowColor: 'group-hover:shadow-rose-500/10',
      description:
        'Pembelajaran dan dokumentasi seni tari tradisional (Tari Kabela, Tari Titi, Tari Dana-Dana), instrumen musik khas (Kolintang, Gabus, Kolintang Kawat), serta nyanyian lisan tradisional (Owadu/Katu-katu).',
      highlights: [
        'Tutorial Panduan Gerak Tari Kabela & Tari Titi',
        'Dokumentasi Alat Musik Tradisional Kolintang & Gabus',
        'Arsip Lirik & Melodi Nyanyian Lisan Owadu',
        'Galeri Kostum Adat Pakean Ogi\' & Perhiasan Adat'
      ],
      tags: ['Tari Kabela', 'Kolintang', 'Owadu', 'Kostum Adat']
    },
    {
      id: 'game-mongondow',
      title: 'Game Mongondow (Game Simulator)',
      badge: 'Pengembangan Simulator',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
      subtitle: 'Simulator Interaktif Permainan Rakyat Tradisional',
      url: '#',
      domain: 'mongondowpedia.org/game-simulator',
      isReady: false,
      icon: Gamepad2,
      accentGradient: 'from-indigo-600 via-blue-600 to-cyan-500',
      borderHover: 'hover:border-indigo-500/50',
      glowColor: 'group-hover:shadow-indigo-500/10',
      description:
        'Wahana permainan simulator ringan yang akan dikembangkan untuk mengenalkan kembali olahraga dan ketangkasan tradisional rakyat Mongondow:',
      gameSubList: [
        { name: '1. Langkadan', desc: 'Permainan ketangkasan egrang bambu tinggi tradisional' },
        { name: '2. Pisikan', desc: 'Permainan adu gasing kayu khas Bolaang Mongondow' },
        { name: '3. Lantaka', desc: 'Permainan simulator meriam bambu / dentuman pesta adat' },
        { name: '4. Sinapang', desc: 'Permainan tembakan bambu ketangkasan rakyat' },
      ],
      highlights: [
        'Simulator Langkadan (Egrang Bambu Ketangkasan)',
        'Simulator Pisikan (Gasing Kayu Tradisional)',
        'Simulator Lantaka (Meriam Bambu Pesta Adat)',
        'Simulator Sinapang (Tembakan Bambu Rakyat)'
      ],
      tags: ['Langkadan', 'Pisikan', 'Lantaka', 'Sinapang']
    }
  ];

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#ececec] selection:bg-blue-600 selection:text-white font-sans antialiased">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/3 left-[-200px] w-[500px] h-[500px] bg-purple-600/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Header Bar */}
      <header className="relative z-10 border-b border-[#21232d] bg-[#0d0e12]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl bg-[#161822] hover:bg-[#212433] text-gray-400 hover:text-white border border-[#2b2e40] transition-colors flex items-center gap-2 text-xs font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Utamapage</span>
            </Link>

            <div className="h-4 w-[1px] bg-[#292c3d]" />

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">
                MongondowPedia <span className="text-blue-400 font-normal">Ecosystem</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all duration-200 flex items-center gap-2"
            >
              <Server className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Pusat Platform &amp; Pembelajaran Digital Terpadu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            MongondowPedia <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">Ecosystem</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Menyatukan ensiklopedia digital, kamus multi-bahasa, kecerdasan buatan Bogani AI, kuis cerdas cermat, kurikulum mulok sekolah, galeri seni budaya, dan game simulator tradisional dalam satu pintu terpadu.
          </p>
        </div>

        {/* Global Key Architecture Info Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#141622] via-[#191c2b] to-[#141622] border border-[#2b2f45] shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-500" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0 mt-1 md:mt-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  Pusat Pelestarian Kebudayaan &amp; Pembelajaran Digital Totabuan
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed max-w-3xl">
                  Seluruh modul ekosistem terhubung dengan basis pengetahuan resmi Rumpun Bahasa Austronesia Kuno, Aksara Native Bolaang Mongondow, serta diverifikasi langsung oleh tokoh adat dan komunitas lokal.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#212538] text-gray-300 border border-[#333852]">
                7 Modul Utama
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Austronesia Ready
              </span>
            </div>
          </div>
        </div>

        {/* Consoles Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ecosystemItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`group relative flex flex-col bg-[#12141e] border border-[#232738] rounded-2xl p-6 transition-all duration-300 ${item.borderHover} ${item.glowColor} shadow-xl hover:shadow-2xl hover:-translate-y-1`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-tr ${item.accentGradient} text-white shadow-lg shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                {/* Card Title & Subtitle */}
                <div className="space-y-1 mb-4">
                  <h2 className="text-xl font-bold text-white tracking-tight">{item.title}</h2>
                  <p className="text-xs font-medium text-blue-400 font-mono">{item.subtitle}</p>
                  <p className="text-[11px] text-gray-500 font-mono">{item.domain}</p>
                </div>

                {/* Card Description */}
                <p className="text-xs text-gray-300 leading-relaxed mb-6">
                  {item.description}
                </p>

                {/* Game Sub-list if present */}
                {item.gameSubList && (
                  <div className="mb-6 space-y-2 bg-[#0c0d14] p-3.5 rounded-xl border border-[#1e2130]">
                    <p className="text-[11px] font-semibold text-gray-300 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      4 Simulator Permainan Rakyat (In-Development):
                    </p>
                    <div className="space-y-1.5">
                      {item.gameSubList.map((g) => (
                        <div key={g.name} className="text-xs">
                          <span className="font-bold text-amber-400">{g.name}</span>
                          <p className="text-[11px] text-gray-400 leading-tight">{g.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Highlights Checklist */}
                <div className="space-y-2 mb-8 mt-auto pt-4 border-t border-[#1e2130]">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Keunggulan &amp; Fitur Utama:</p>
                  <ul className="space-y-1.5">
                    {item.highlights.map((hl, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1b1e2c] text-gray-400 border border-[#2b3047]">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Redirect Button / Action */}
                {item.isReady ? (
                  <Link
                    href={item.url}
                    className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${item.accentGradient} hover:opacity-90 text-white font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 group-hover:shadow-blue-500/20`}
                  >
                    <span>Buka Modul {item.title}</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 px-4 rounded-xl bg-[#1a1c29] border border-[#2d3147] text-amber-400/80 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                  >
                    <Clock className="w-4 h-4 animate-spin-slow text-amber-400" />
                    <span>Akan Dikembangkan (In-Development)</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Professional Footer Statement */}
        <div className="pt-8 border-t border-[#1e2130] text-center text-xs text-gray-500 space-y-2">
          <p>© 2026 MongondowPedia Ecosystem • <code className="text-gray-400">mongondowpedia.org</code>. All Rights Reserved.</p>
          <p>Platform Digital Pelestarian Bahasa, Sejarah, Adat &amp; Kebudayaan Bolaang Mongondow.</p>
        </div>
      </main>
    </div>
  );
}
