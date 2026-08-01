'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  BookOpen, 
  Search, 
  Sparkles, 
  Volume2, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Share2,
  Bookmark,
  Languages,
  Cpu,
  Feather
} from "lucide-react";

interface KamusEntry {
  word: string;
  firstLetter: string;
  sourceFile: string;
}

interface SiderWordCard {
  word: string;
  phonetic: string;
  origin: string;
  meaning: string;
  example: string;
  aksara: string;
  quote: string;
  emoji: string;
  tag?: string;
}

interface KamusStats {
  totalWords: number;
  totalFiles: number;
  filesList: string[];
  alphabetCounts: Record<string, number>;
}

export default function KamusPage() {
  const [stats, setStats] = useState<KamusStats | null>(null);
  const [featuredCards, setFeaturedCards] = useState<SiderWordCard[]>([]);
  const [entries, setEntries] = useState<KamusEntry[]>([]);
  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [loading, setLoading] = useState(true);

  // Active AI Definition State
  const [activeWordData, setActiveWordData] = useState<SiderWordCard | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Suggestions Dropdown
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const alphabet = ["ALL", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  // Fetch Index Data
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
        if (data.featuredCards && data.featuredCards.length > 0) {
          setFeaturedCards(data.featuredCards);
        }
        setEntries(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalFiltered(data.total || 0);

        // Update instant suggestions if user is typing
        if (searchQuery.trim().length >= 2 && data.data) {
          const matched = data.data.slice(0, 6).map((item: KamusEntry) => item.word);
          setSuggestions(matched);
        } else {
          setSuggestions([]);
        }
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

  // Click outside to hide suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // AI Definition Search Trigger
  const handleAiSearch = async (targetWord?: string) => {
    const wordToSearch = (targetWord || query).trim();
    if (!wordToSearch) return;

    setShowSuggestions(false);
    setIsAiLoading(true);
    setShowDetailModal(true);

    try {
      const res = await fetch("/api/kamus/ai-define", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: wordToSearch }),
      });

      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          setActiveWordData(result.data);
        }
      }
    } catch (err) {
      console.error("Failed fetching AI definition:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Audio Text-to-Speech Pronunciation
  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const openCardDetail = (card: SiderWordCard) => {
    setActiveWordData(card);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-4 md:p-8 font-sans flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      <div className="max-w-6xl mx-auto w-full space-y-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#1c1e2a] pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14151e] hover:bg-[#1d1f2c] text-gray-300 hover:text-white border border-[#232536] text-xs font-semibold transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Homepage</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full font-semibold flex items-center gap-2 shadow-sm">
              <Cpu className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              Integrated with Bogani AI
            </span>
          </div>
        </div>

        {/* Hero Section — Inspired by Sider AI Dictionary */}
        <div className="text-center space-y-6 pt-4 pb-2">
          
          {/* Main Title */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#151722] border border-[#2b2e42] text-xs font-semibold text-emerald-400 shadow-xl">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Data Tools: Kamus Bahasa Mongondow</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Kamus Bahasa Mongondow
            </h1>

            <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
              Pandangan Baru tentang Definisi, Makna, Fonetik & Aksara Kata
            </p>
          </div>

          {/* Super Advance CTA Search Bar */}
          <div ref={searchContainerRef} className="max-w-2xl mx-auto relative z-30">
            <div className="relative flex items-center bg-[#13151f] border border-[#282b3d] focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 rounded-2xl p-2 shadow-2xl transition-all">
              <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
              <input
                type="text"
                value={query}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAiSearch();
                  }
                }}
                placeholder="Masukkan sebuah kata, langkah ke dunia baru..."
                className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none font-medium"
              />
              
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                  }}
                  className="p-1 text-gray-400 hover:text-white mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleAiSearch()}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 shrink-0 active:scale-95"
              >
                <span>Cari</span>
                <Sparkles className="w-3.5 h-3.5 text-black" />
              </button>
            </div>

            {/* Instant Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#141622] border border-[#272a3e] rounded-2xl p-2 shadow-2xl space-y-1 text-left z-40 animate-fadeIn">
                <p className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Saran Kosa Kata Terindeks:
                </p>
                {suggestions.map((wordItem, i) => (
                  <button
                    key={`${wordItem}-${i}`}
                    onClick={() => {
                      setQuery(wordItem);
                      handleAiSearch(wordItem);
                    }}
                    className="w-full px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-200 hover:bg-[#202334] hover:text-emerald-400 flex items-center justify-between transition-colors text-left"
                  >
                    <span>{wordItem}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Buka Definisi →</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Word Suggestion Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
              <span className="text-[11px] text-gray-500 font-medium">Contoh pencarian:</span>
              {["Bogani", "Totabuan", "Arai", "Biontu", "Inaton", "Modayag"].map((sample) => (
                <button
                  key={sample}
                  onClick={() => {
                    setQuery(sample);
                    handleAiSearch(sample);
                  }}
                  className="px-3 py-1 rounded-full bg-[#141520] hover:bg-[#1f2233] text-gray-300 hover:text-emerald-400 border border-[#242738] text-[11px] font-medium transition-all"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section: Definisi Terbaru & Kosa Kata Populer — Bergaya Sider AI */}
        {featuredCards.length > 0 && (
          <div className="space-y-5 pt-2">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                <Feather className="w-5 h-5 text-emerald-400" />
                <span>Definisi Terbaru & Populer</span>
              </h2>
              <p className="text-xs text-gray-400">
                Pilih kartu di bawah ini untuk menjelajah makna kata Mongondow secara mendalam.
              </p>
            </div>

            {/* Sider AI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCards.map((card, idx) => (
                <div
                  key={`${card.word}-${idx}`}
                  onClick={() => openCardDetail(card)}
                  className="p-6 rounded-3xl bg-[#11131b] hover:bg-[#161824] border border-[#202332] hover:border-emerald-500/40 transition-all duration-300 cursor-pointer shadow-xl flex flex-col justify-between space-y-5 group relative overflow-hidden"
                >
                  {/* Top Tag & Phonetic */}
                  <div className="space-y-1.5">
                    {card.tag && (
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block">
                        {card.tag}
                      </span>
                    )}

                    <h3 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors pt-1">
                      {card.word}
                    </h3>
                    
                    <p className="text-xs font-mono text-gray-400 italic">
                      {card.phonetic}
                    </p>
                  </div>

                  {/* Divider line */}
                  <div className="w-12 h-0.5 bg-[#252839] group-hover:w-full group-hover:bg-emerald-500/30 transition-all" />

                  {/* Origin & Short Meaning */}
                  <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
                    <p className="text-[11px] text-gray-400 italic">
                      <strong className="text-gray-300 not-italic">Asal:</strong> {card.origin}
                    </p>
                    <p className="line-clamp-3">
                      {card.meaning}
                    </p>
                  </div>

                  {/* Center Emoji Circle — Sider AI Style */}
                  <div className="py-2 flex justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#191b26] border border-[#2a2d40] group-hover:border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner transition-transform group-hover:scale-110">
                      {card.emoji}
                    </div>
                  </div>

                  {/* Philosophical Quote Footer */}
                  <div className="pt-3 border-t border-[#1a1c28] text-[11px] text-gray-400 italic leading-snug">
                    &ldquo;{card.quote}&rdquo;
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section: Penelusuran Seluruh Indeks Kosa Kata (A-Z) */}
        <div className="space-y-5 bg-[#11131a] border border-[#202330] p-6 rounded-3xl shadow-2xl">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2230] pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-400" />
                <span>Indeks Abjad Kosa Kata ({stats?.totalWords.toLocaleString("id-ID") || 0} Kata)</span>
              </h3>
              <p className="text-xs text-gray-400">
                Jelajahi seluruh perbendaharaan kata terindeks dari file Markdown.
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-xl bg-[#171924] border border-[#272a3a] text-gray-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-white px-1">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-xl bg-[#171924] border border-[#272a3a] text-gray-300 hover:text-white disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alphabet Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {alphabet.map((letter) => {
              const isSelected = selectedLetter === letter;
              const count = letter === "ALL" ? (stats?.totalWords || 0) : (stats?.alphabetCounts[letter] || 0);
              return (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(letter);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                      : "bg-[#171924] hover:bg-[#222536] text-gray-300 border border-[#272a3a]"
                  }`}
                >
                  <span>{letter}</span>
                  {count > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/20 text-black" : "bg-[#252838] text-gray-400"}`}>
                      {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Word Grid */}
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-7 h-7 text-emerald-400 animate-spin mx-auto" />
              <p className="text-xs text-gray-400">Memuat kosa kata Mongondow...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">
              Tidak ada kata yang sesuai dengan filter abjad ini.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {entries.map((entry, idx) => (
                <button
                  key={`${entry.word}-${idx}`}
                  onClick={() => {
                    setQuery(entry.word);
                    handleAiSearch(entry.word);
                  }}
                  className="p-3 rounded-2xl bg-[#151722] hover:bg-[#1d2030] border border-[#222534] hover:border-emerald-500/40 text-left transition-all group flex flex-col justify-between space-y-1.5"
                >
                  <span className="font-bold text-xs text-gray-200 group-hover:text-emerald-400 truncate">
                    {entry.word}
                  </span>
                  <span className="text-[9px] font-mono text-gray-500">
                    {entry.firstLetter} • {entry.sourceFile}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Definition Detail Modal (Sider AI Breakdown Card) */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#12141d] border border-[#26293c] rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            {/* Close Button */}
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-[#1c1f2e] text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {isAiLoading ? (
              <div className="py-20 text-center space-y-4">
                <Sparkles className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
                <p className="text-sm font-bold text-white">Bogani AI sedang memproses analisis kata...</p>
                <p className="text-xs text-gray-400">Mengekstrak fonetik, etimologi, dan arti bahasa Mongondow.</p>
              </div>
            ) : activeWordData ? (
              <div className="space-y-6">
                
                {/* Header Info */}
                <div className="flex items-start justify-between border-b border-[#212436] pb-4 pr-8">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        {activeWordData.word}
                      </h2>
                      
                      {/* Audio Reader Button */}
                      <button
                        onClick={() => handleSpeak(activeWordData.word)}
                        className={`p-2 rounded-xl border transition-all ${
                          isSpeaking 
                            ? "bg-emerald-500 text-black border-emerald-400 animate-pulse" 
                            : "bg-[#1a1d2b] text-emerald-400 border-[#2b2f45] hover:bg-[#252a3f]"
                        }`}
                        title="Dengarkan Pengucapan"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm font-mono text-emerald-400 italic">
                      {activeWordData.phonetic}
                    </p>
                  </div>

                  <div className="text-3xl p-3 rounded-2xl bg-[#191c28] border border-[#2a2e42] shrink-0">
                    {activeWordData.emoji || "📘"}
                  </div>
                </div>

                {/* Transliterasi Aksara Mongondow */}
                <div className="p-4 rounded-2xl bg-[#171926] border border-[#272b3d] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                    Ejaan / Aksara Mongondow Breakdown
                  </span>
                  <p className="text-lg font-mono font-bold text-white tracking-wider">
                    {activeWordData.aksara}
                  </p>
                </div>

                {/* Origin / Etymology */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Languages className="w-4 h-4 text-emerald-400" />
                    <span>Etimologi & Asal Kata</span>
                  </h4>
                  <p className="text-xs md:text-sm text-gray-300 leading-relaxed bg-[#161824] p-3.5 rounded-2xl border border-[#242738]">
                    {activeWordData.origin}
                  </p>
                </div>

                {/* Indonesian Meaning */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>Definisi & Arti (Bahasa Indonesia)</span>
                  </h4>
                  <p className="text-sm text-white font-medium leading-relaxed bg-[#161824] p-4 rounded-2xl border border-[#242738]">
                    {activeWordData.meaning}
                  </p>
                </div>

                {/* Example Sentence */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Feather className="w-4 h-4 text-emerald-400" />
                    <span>Contoh Kalimat Frasa</span>
                  </h4>
                  <p className="text-xs md:text-sm text-gray-300 italic bg-[#161824] p-3.5 rounded-2xl border border-[#242738]">
                    &ldquo;{activeWordData.example}&rdquo;
                  </p>
                </div>

                {/* Bogani AI Quote Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 text-xs text-emerald-300 italic flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>&ldquo;{activeWordData.quote}&rdquo;</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-600 pt-8 border-t border-[#171924] mt-8">
        © 2026 MongondowPedia™ (Ginza Project) — Kamus Bahasa Mongondow (Integrated with Bogani AI)
      </footer>
    </div>
  );
}
