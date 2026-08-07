'use client';

import { useState } from "react";
import Link from "next/link";
import {
  Database,
  Search,
  BookOpenText,
  ScrollText,
  ArrowLeft,
  ArrowRight,
  Eye,
  FileText,
  Layers,
  LayoutGrid,
  List,
  History,
  BookOpen,
  Languages,
  Crown,
  FileCode,
  Volume2,
  GraduationCap,
  Sparkles,
  Plus
} from "lucide-react";
import KnowledgeGraphViewer from "@/components/knowledge/KnowledgeGraphViewer";
import ContributeCTA from "@/components/knowledge/ContributeCTA";

export interface KnowledgeCategoryItem {
  id: string;
  slug: string;
  name: string;
  visit_count: number;
  description: string | null;
}

export interface KnowledgeArticleItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category_id: string;
  category_slug: string;
  category_name: string;
  visit_count: number;
  created_at: string;
  author_name: string;
}

interface KnowledgeExplorerClientProps {
  categories: KnowledgeCategoryItem[];
  articles: KnowledgeArticleItem[];
  dbReady: boolean;
}

// Icon mapping per category slug
const CATEGORY_ICONS: Record<string, any> = {
  "sejarah": History,
  "adat-budaya": BookOpen,
  "bahasa-sastra": Languages,
  "kerajaan-bolaang-mongondow": Crown,
  "aksara-naskah": FileCode,
  "pidato-bahasa-mongondow": Volume2,
  "edukasi": GraduationCap,
};

export default function KnowledgeExplorerClient({
  categories,
  articles,
  dbReady
}: KnowledgeExplorerClientProps) {
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("Semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter items based on active category tab and search query
  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      activeCategorySlug === "Semua" || art.category_slug === activeCategorySlug;
    const matchesSearch =
      !searchQuery.trim() ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#0d0e12] text-white p-4 md:p-10 font-sans selection:bg-blue-500 selection:text-white flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-8">

        {/* ── 1. HEADER KNOWLEDGE BASE ── */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#212330]">
          <div className="space-y-1.5">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#171821] hover:bg-[#222433] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-semibold transition-all mb-2 shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-blue-400" />
              <span>Kembali ke Page Utama</span>
            </Link>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Database className="w-8 h-8 text-blue-400 shrink-0" />
              <span>Knowledge Base &amp; Ensiklopedia MongondowPedia</span>
            </h1>

            <p className="text-xs md:text-sm text-gray-400 max-w-2xl leading-relaxed">
              Ensiklopedia sejarah, adat budaya, bahasa &amp; sastra, serta seni Bolaang Mongondow — disusun dari arsip komunitas dan diverifikasi verifikator MongondowPedia.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/aksara-mongondow"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <ScrollText className="w-4 h-4 text-blue-400" />
              <span>Aksara Mongondow</span>
            </Link>

            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3.5 py-2.5 rounded-xl font-semibold hidden sm:inline-block">
              Pusat Pengetahuan
            </span>
          </div>
        </div>

        {/* ── 2. CATEGORY TAB BAR (Menggantikan Card Grid Kategori) ── */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            <button
              onClick={() => setActiveCategorySlug("Semua")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
                activeCategorySlug === "Semua"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-[#14151e] text-gray-400 hover:text-white hover:bg-[#1c1e2b] border border-[#232536]"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Semua Kategori</span>
            </button>

            {categories.map((cat) => {
              const IconComponent = CATEGORY_ICONS[cat.slug] || BookOpenText;
              const isActive = activeCategorySlug === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 active:scale-95 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "bg-[#14151e] text-gray-400 hover:text-white hover:bg-[#1c1e2b] border border-[#232536]"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* ── 3. TOOLBAR: SEARCH & LIST/GRID VIEW MODE FILTER ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#14151e] p-3 rounded-2xl border border-[#232536]">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pengetahuan, sejarah, naskah, atau aksara..."
                className="w-full pl-10 pr-4 py-2 bg-[#0d0e12] border border-[#232536] focus:border-blue-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
                >
                  Batal
                </button>
              )}
            </div>

            {/* List / Grid Mode Toggle */}
            <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
              <span className="text-xs text-gray-400 font-medium">Mode Tampilan:</span>
              <div className="flex items-center gap-1 bg-[#0d0e12] p-1 rounded-xl border border-[#232536]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1c29]"
                  }`}
                  title="Tampilan Grid"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>

                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1c29]"
                  }`}
                  title="Tampilan List"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. ISI KNOWLEDGE TERPUBLIKASI (DI BAWAH TAB) ── */}
        {!dbReady && (
          <div className="p-6 rounded-3xl bg-[#14151e] border border-[#232536] text-sm text-gray-400">
            Kategori pengetahuan belum tersedia — database belum terhubung. Jalankan migration &amp; script import dulu.
          </div>
        )}

        {filteredArticles.length === 0 ? (
          /* Empty state saat belum ada dokumen terpublikasi di kategori terpilih */
          <div className="p-16 text-center space-y-4 bg-[#14151e] rounded-3xl border border-[#232536]">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
              <BookOpenText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Belum Ada Dokumen Pengetahuan Terpublikasi</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              {searchQuery
                ? "Tidak ada pengetahuan yang cocok dengan pencarian Anda."
                : `Belum ada arsip pengetahuan terpublikasi pada kategori ${activeCategorySlug === "Semua" ? "ini" : activeCategorySlug}.`}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* ── GRID MODE KNOWLEDGE CONTENT (2 Kolom di Mobile / HP Mode) ── */
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {filteredArticles.map((art) => {
              const IconComp = CATEGORY_ICONS[art.category_slug] || BookOpenText;

              return (
                <Link
                  key={art.id}
                  href={`/knowledge/${art.category_slug}/${art.slug}`}
                  className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#14151e] hover:bg-[#191b26] border border-[#232536] hover:border-blue-500/40 transition-all duration-200 shadow-xl flex flex-col justify-between gap-3 sm:gap-5 group relative overflow-hidden active:scale-[0.98]"
                >
                  <div className="space-y-2.5 sm:space-y-4">
                    {/* Top Row: Icon & Visit Count */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                      <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                        <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-gray-400 bg-[#0d0e12] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-[#232536] shrink-0">
                        <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                        <span>{art.visit_count} <span className="hidden sm:inline">kunjungan</span></span>
                      </span>
                    </div>

                    {/* Category Tag & Title */}
                    <div className="space-y-1 sm:space-y-2">
                      <span className="text-[9px] sm:text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                        {art.category_name}
                      </span>
                      <h3 className="text-xs sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gray-400 leading-relaxed line-clamp-2 sm:line-clamp-3">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Footer Link */}
                  <div className="pt-2.5 sm:pt-4 border-t border-[#1f2130] flex items-center justify-between text-[10px] sm:text-xs font-semibold text-blue-400 group-hover:text-blue-300">
                    <span className="truncate">Baca Pengetahuan</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* ── LIST MODE KNOWLEDGE CONTENT ── */
          <div className="space-y-3">
            {filteredArticles.map((art) => {
              const IconComp = CATEGORY_ICONS[art.category_slug] || BookOpenText;

              return (
                <Link
                  key={art.id}
                  href={`/knowledge/${art.category_slug}/${art.slug}`}
                  className="p-4 sm:p-5 rounded-2xl bg-[#14151e] hover:bg-[#191b26] border border-[#232536] hover:border-blue-500/40 transition-all duration-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                          {art.category_name}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Eye className="w-3 h-3 text-blue-400" /> {art.visit_count} kunjungan
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {art.title}
                      </h3>

                      <p className="text-xs text-gray-400 line-clamp-1">
                        {art.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[#1c1e2b] text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0 self-end sm:self-center">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* ── 5. INTERACTIVE KNOWLEDGE GRAPH & CONTRIBUTE CTA ── */}
        <div className="space-y-8 pt-4">
          <KnowledgeGraphViewer />
          <ContributeCTA type="knowledge" />
        </div>

        {/* ── 6. FOOTER ── */}
        <footer className="text-center text-xs text-gray-600 pt-8 border-t border-[#1f2130]">
          © 2026 MongondowPedia™ (Ginza Project) — Knowledge Base Module
        </footer>
      </div>
    </main>
  );
}
