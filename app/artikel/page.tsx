'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Search,
  Sparkles,
  Flame,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Share2,
  Eye,
  Plus,
  ArrowLeft,
  Filter,
  MapPin,
  BookOpen,
  Music,
  GraduationCap,
  Layers,
  Clock
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  region: string;
  excerpt: string;
  cover_image?: string;
  views_count: number;
  shares_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  fyp_score: number;
  created_at: string;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
}

const CATEGORY_TABS = [
  { key: "Semua", label: "Semua", icon: Layers },
  { key: "Pengetahuan & Sejarah", label: "Pengetahuan & Sejarah", icon: BookOpen },
  { key: "Musik, Seni & Budaya", label: "Musik, Seni & Budaya", icon: Music },
  { key: "Teori & Tesis", label: "Teori & Tesis", icon: GraduationCap },
];

const REGIONS = ["Semua", "Boltim", "Bolsel", "Bolmut", "Bolmong", "Kotamobagu"];

export default function ArtikelPage() {
  const [activeTab, setActiveTab] = useState<string>("Semua");
  const [selectedRegion, setSelectedRegion] = useState<string>("Semua");
  const [isFypOnly, setIsFypOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchArticles();
  }, [activeTab, selectedRegion, isFypOnly]);

  async function fetchArticles() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "Semua") params.set("category", activeTab);
      if (selectedRegion !== "Semua") params.set("region", selectedRegion);
      if (isFypOnly) params.set("fyp", "true");
      if (searchQuery.trim()) params.set("search", searchQuery.trim());

      const res = await fetch(`/api/articles?${params.toString()}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchArticles();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-10 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* ── TOP HEADER & NAVIGATION ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#1f2130]">
          <div className="space-y-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#14151f] hover:bg-[#1f2130] text-gray-300 hover:text-white border border-[#262838] text-xs font-semibold transition-all mb-2 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span>Kembali ke Beranda</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <FileText className="w-8 h-8 text-purple-400" />
              <span>Portal Artikel & Publikasi Pengguna</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 max-w-xl">
              Ruang publikasi bebas untuk anggota & verifikator membagikan pengetahuan, wawasan adat, musik, sejarah, dan naskah riset Bolaang Mongondow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/u"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/25"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel Baru</span>
            </Link>
          </div>
        </div>

        {/* ── 3 TAB UTAMA & CATEGORY BAR ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#14151f] p-2.5 rounded-2xl border border-[#262838]">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORY_TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                      : "bg-[#181926] text-gray-400 hover:text-white hover:bg-[#202235]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* FYP TOGGLE BUTTON */}
          <button
            onClick={() => setIsFypOnly(!isFypOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isFypOnly
                ? "bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-md shadow-amber-500/10"
                : "bg-[#181926] border-[#292b3e] text-gray-400 hover:text-white"
            }`}
          >
            <Flame className={`w-4 h-4 ${isFypOnly ? "text-amber-400 animate-bounce" : ""}`} />
            <span>🔥 FYP (Top 50 Populer)</span>
          </button>
        </div>

        {/* ── SECONDARY FILTER: DAERAH & SEARCH BAR ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filter Daerah */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
            <span className="text-xs font-bold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" /> Daerah:
            </span>
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRegion(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
                  selectedRegion === r
                    ? "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                    : "bg-[#14151f] border border-[#262838] text-gray-400 hover:text-white"
                }`}
              >
                {r === "Semua" ? "Semua Wilayah" : r}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul atau kata kunci..."
              className="w-full bg-[#14151f] border border-[#262838] text-xs text-white placeholder-gray-500 pl-9 pr-4 py-2 rounded-xl focus:outline-none focus:border-purple-500/50"
            />
          </form>
        </div>

        {/* ── ARTICLES GRID DISPLAY ── */}
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-400 bg-[#14151f] rounded-3xl border border-[#262838]">
            Memuat daftar artikel...
          </div>
        ) : articles.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-[#14151f] rounded-3xl border border-[#262838]">
            <FileText className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Belum Ada Artikel</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Jadilah yang pertama memposting artikel pengetahuan, sejarah, atau opini di MongondowPedia.
            </p>
            <Link
              href="/u"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Artikel Sekarang</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/artikel/${art.slug}`}
                className="group bg-[#14151f] hover:bg-[#1a1c2b] border border-[#262838] hover:border-purple-500/40 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between shadow-xl space-y-4"
              >
                <div className="space-y-3">
                  {/* Cover Image / Thumbnail */}
                  {art.cover_image ? (
                    <div className="h-40 w-full rounded-2xl overflow-hidden border border-[#262838] bg-[#0c0d14]">
                      <img src={art.cover_image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-32 w-full rounded-2xl bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/20 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-purple-400/50" />
                    </div>
                  )}

                  {/* Badges Row */}
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {art.category}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-bento-surface text-gray-400 border border-bento-border">
                      📍 {art.region}
                    </span>
                  </div>

                  {/* Title & Excerpt */}
                  <div className="space-y-1.5">
                    <h2 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                      {art.title}
                    </h2>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>
                </div>

                {/* Footer Meta & Metrics */}
                <div className="pt-4 border-t border-[#232536] space-y-3">
                  {/* Author Row */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold flex items-center justify-center overflow-hidden shrink-0">
                      {art.author_avatar ? (
                        <img src={art.author_avatar} alt={art.author_name} className="w-full h-full object-cover" />
                      ) : (
                        art.author_name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="text-xs font-semibold text-gray-300 truncate">{art.author_name}</span>
                  </div>

                  {/* Metrics Counts */}
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-blue-400" /> {art.views_count}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> {art.likes_count}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-amber-400" /> {art.comments_count}</span>
                    </div>

                    {art.fyp_score > 5 && (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        🔥 FYP
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
