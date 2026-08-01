'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Search, RefreshCw, Layers, FileText, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

interface KamusEntry {
  word: string;
  firstLetter: string;
  sourceFile: string;
}

interface KamusStats {
  totalWords: number;
  totalFiles: number;
  filesList: string[];
  alphabetCounts: Record<string, number>;
}

export default function KamusPage() {
  const [stats, setStats] = useState<KamusStats | null>(null);
  const [entries, setEntries] = useState<KamusEntry[]>([]);
  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [loading, setLoading] = useState(true);

  const alphabet = ["ALL", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  const fetchKamusData = async (searchQuery: string, letter: string, currentPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        letter,
        page: currentPage.toString(),
        limit: "60",
      });
      const res = await fetch(`/api/kamus?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setEntries(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalFiltered(data.total || 0);
      }
    } catch (err) {
      console.error("Failed fetching kamus data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKamusData(query, selectedLetter, page);
  }, [query, selectedLetter, page]);

  const handleSearchChange = (val: string) => {
    setQuery(val);
    setPage(1);
  };

  const handleLetterSelect = (letter: string) => {
    setSelectedLetter(letter);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-4 md:p-8 font-sans flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#1c1e2a] pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14151e] hover:bg-[#1d1f2c] text-gray-300 hover:text-white border border-[#232536] text-xs font-semibold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Kembali ke Homepage</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Indeks Kamus Aktif
            </span>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#11131a] border border-[#202330] p-6 rounded-3xl shadow-2xl">
          <div className="space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Kamus Bahasa Mongondow
            </h1>
            <p className="text-xs md:text-sm text-gray-400 max-w-xl leading-relaxed">
              Indeks kosa kata resmi MongondowPedia yang terhubung langsung sebagai basis pengetahuan **Bogani AI**.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="bg-[#181a24] border border-[#292c3d] p-4 rounded-2xl text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Kosa Kata</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {stats ? stats.totalWords.toLocaleString("id-ID") : "..."}
              </p>
            </div>
            <div className="bg-[#181a24] border border-[#292c3d] p-4 rounded-2xl text-center">
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">File Sumber</p>
              <p className="text-2xl font-extrabold text-blue-400 font-mono mt-0.5">
                {stats ? stats.totalFiles : "..."}
              </p>
            </div>
          </div>
        </div>

        {/* Search & Alphabet Filter Controls */}
        <div className="space-y-4 bg-[#11131a] border border-[#202330] p-5 rounded-3xl">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari kosa kata Mongondow (misal: 'adií', 'boḷoi', 'bui')..."
              className="w-full pl-11 pr-4 py-3 bg-[#171924] border border-[#292c3d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-2xl text-sm text-white placeholder-gray-500 outline-none transition-all"
            />
            {query && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-4 top-3.5 text-xs text-gray-400 hover:text-white font-medium bg-[#252838] px-2 py-0.5 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* Alphabet Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {alphabet.map((letter) => {
              const isSelected = selectedLetter === letter;
              const count = letter === "ALL" ? (stats?.totalWords || 0) : (stats?.alphabetCounts[letter] || 0);
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterSelect(letter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                      : "bg-[#181a24] hover:bg-[#232636] text-gray-300 border border-[#272a3a]"
                  }`}
                >
                  <span>{letter}</span>
                  {count > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/20 text-black" : "bg-[#272a3a] text-gray-400"}`}>
                      {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Info & Pagination Header */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <p>
            Menampilkan <span className="font-semibold text-white">{totalFiltered.toLocaleString("id-ID")}</span> kata
            {selectedLetter !== "ALL" && <span> untuk abjad <strong className="text-emerald-400">{selectedLetter}</strong></span>}
            {query && <span> dengan kata kunci &ldquo;<strong className="text-white">{query}</strong>&rdquo;</span>}
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-lg bg-[#14151e] border border-[#232536] text-gray-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-white">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-lg bg-[#14151e] border border-[#232536] text-gray-300 hover:text-white disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Words Grid Display */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <p className="text-xs text-gray-400 font-medium">Memuat kosa kata Kamus Mongondow...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center bg-[#11131a] border border-[#202330] rounded-3xl space-y-3">
            <FileText className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-sm font-semibold text-white">Tidak ada kata yang cocok.</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Coba gunakan kata kunci lain atau pilih abjad <strong className="text-emerald-400">ALL</strong> untuk melihat seluruh daftar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {entries.map((entry, idx) => (
              <div
                key={`${entry.word}-${idx}`}
                className="p-3 bg-[#13151f] hover:bg-[#1b1e2c] border border-[#202332] hover:border-emerald-500/40 rounded-2xl transition-all duration-200 group flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors break-words">
                    {entry.word}
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {entry.firstLetter}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
                  <FileText className="w-3 h-3 shrink-0" />
                  <span className="truncate">{entry.sourceFile}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 pt-4">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-xl bg-[#14151e] border border-[#232536] text-xs font-semibold text-white hover:bg-[#1f2130] disabled:opacity-40 transition-colors"
            >
              Sebelumnya
            </button>
            <span className="text-xs font-mono text-gray-400 px-3">
              Halaman {page} dari {totalPages}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 rounded-xl bg-[#14151e] border border-[#232536] text-xs font-semibold text-white hover:bg-[#1f2130] disabled:opacity-40 transition-colors"
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-600 pt-8">
        © 2026 MongondowPedia™ (Ginza Project) — Modul Kamus Bahasa Mongondow
      </footer>
    </div>
  );
}
