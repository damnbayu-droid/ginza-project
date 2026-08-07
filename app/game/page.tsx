import Link from "next/link";
import { Gamepad2, HelpCircle, PenTool, BookOpen, Database, ArrowLeft, Sparkles, Trophy, Flame } from "lucide-react";

export const metadata = {
  title: "Arena Game & Kuis Aksara Mongondow — MongondowPedia",
  description: "Uji kemampuan membaca, menulis Aksara Mongondow, serta menjelajah kosakata dan sejarah Bolaang Mongondow dalam permainan interaktif.",
};

const GAMES = [
  {
    id: "kuis-latihan",
    title: "Kuis Latihan Aksara",
    badge: "Populer",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description: "Uji kemampuan membaca & menebak suku kata Aksara Mongondow (Vokal, Diakritik, & Pamudpod) secara interaktif.",
    icon: HelpCircle,
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    link: "/aksara-mongondow?tab=quiz",
    cta: "Mulai Kuis Latihan",
    stats: "20+ Soal Aksara",
  },
  {
    id: "studio-latihan",
    title: "Studio Latihan Menulis",
    badge: "Interaktif",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    description: "Melatih keluwesan jemari menggambar goresan Aksara Mongondow pada kanvas digital interaktif berpanduan.",
    icon: PenTool,
    iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    link: "/aksara-mongondow?tab=tracing",
    cta: "Buka Studio Menulis",
    stats: "Kanvas Tracing Realtime",
  },
  {
    id: "tebak-kosakata",
    title: "Tebak Kosakata & Kamus",
    badge: "Eksplorasi",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    description: "Pelajari makna ribuan entri kosakata Bahasa Mongondow, contoh kalimat tutur adat, dan audio pengucapan suara asli.",
    icon: BookOpen,
    iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    link: "/kamus",
    cta: "Jelajah Kamus",
    stats: "Ribuan Kosakata",
  },
  {
    id: "jelajah-sejarah",
    title: "Peta Sejarah & Knowledge Graph",
    badge: "Edukasi",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    description: "Eksplorasi jaringan silsilah Raja-Raja Bolaang Mongondow, tatanan adat Bogani, hingga sejarah Kotabunan & Boltim.",
    icon: Database,
    iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    link: "/knowledge",
    cta: "Eksplorasi Sejarah",
    stats: "Jaringan Entitas Interaktif",
  },
];

export default function GamePage() {
  return (
    <main className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#212330]">
          <div className="space-y-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#171821] hover:bg-[#222433] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-semibold transition-all mb-2"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span>Kembali ke Beranda</span>
            </Link>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-purple-400 animate-bounce" />
              <span>Arena Game & Kuis</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 max-w-xl">
              Pilih arena permainan edukatif untuk mengasah kemampuan membaca, menulis, serta memahami budaya & sejarah Bolaang Mongondow.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-[#171821] p-3 rounded-2xl border border-[#2b2d3e] shadow-lg">
            <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-white">Mode Pembelajaran</p>
              <p className="text-gray-400 text-[11px]">Interaktif & Terverifikasi</p>
            </div>
          </div>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <div
                key={game.id}
                className="group relative bg-[#171821] hover:bg-[#1f2130] border border-[#262838] hover:border-purple-500/40 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${game.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${game.badgeColor}`}>
                      {game.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-2">
                      <span>{game.title}</span>
                    </h2>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {game.description}
                    </p>
                  </div>
                </div>

                {/* Card Footer & CTA */}
                <div className="pt-6 mt-4 border-t border-[#232536] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-gray-500 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>{game.stats}</span>
                  </span>

                  <Link
                    href={game.link}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-purple-600/20 group-hover:scale-105"
                  >
                    <span>{game.cta}</span>
                    <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
