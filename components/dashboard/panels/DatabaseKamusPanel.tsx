'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";
import { Plus, Edit2, CheckCircle2, RotateCcw, X, UserCheck, ShieldCheck, Eye, Search, BookOpen, MessageSquareQuote, Trash2, Languages, Sparkles, Star } from "lucide-react";

export interface KamusEntryRow {
  id?: string;
  word: string;
  phonetic?: string | null;
  origin?: string | null;
  meaning?: string | null;
  example?: string | null;
  aksara_breakdown?: string | null;
  category?: string | null;
  status: "draft" | "pending_review" | "verified" | "archived";
  source_note?: string | null;
  view_count?: number;
  search_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ShortSentenceRow {
  id: string;
  mongondow: string;
  melayu_mongondow: string;
  indonesia: string;
  english: string;
  category: string;
  status: "verified" | "draft";
  created_at?: string;
}

export interface FeaturedCardRow {
  id: string;
  word: string;
  phonetic: string;
  origin: string;
  meaning: string;
  example: string;
  aksara: string;
  quote: string;
  emoji: string;
  tag: string;
  status: "verified" | "draft";
  created_at?: string;
}

const DEFAULT_SHORT_SENTENCES: ShortSentenceRow[] = [
  {
    id: "sent-1",
    mongondow: "Dega Niondon",
    melayu_mongondow: "-",
    indonesia: "Selamat Datang",
    english: "Welcome",
    category: "Sapaan & Ucapan",
    status: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "sent-2",
    mongondow: "Ko Ta'auan mu tua?",
    melayu_mongondow: "Ngana tau itu?",
    indonesia: "Apakah Kamu Tahu Itu?",
    english: "Do you know that?",
    category: "Pertanyaan Harian",
    status: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "sent-3",
    mongondow: "Mo ta'au kon mongondow iko?",
    melayu_mongondow: "Tau ba bahasa mongondow ngana?",
    indonesia: "Apakah kamu tahu berbahasa mongondow?",
    english: "Do you speak Mongondow language?",
    category: "Percakapan Harian",
    status: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "sent-4",
    mongondow: "Ako oi na'a ki ulunan bogani",
    melayu_mongondow: "Kita ini tu robot pande",
    indonesia: "Aku ini Adalah Kecerdasan Buatan",
    english: "I am Artificial Intelligence",
    category: "Perkenalan & Identity",
    status: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "sent-5",
    mongondow: "Tabe', moikit totabuan",
    melayu_mongondow: "Permisi, selamat pagi seberang",
    indonesia: "Permisi, selamat pagi kawan/saudara",
    english: "Excuse me, good morning friend",
    category: "Sapaan & Ucapan",
    status: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "sent-6",
    mongondow: "Onu habar pe ngoni?",
    melayu_mongondow: "Apa kabar ngana dorang?",
    indonesia: "Apa kabar Anda sekalian?",
    english: "How are you all doing?",
    category: "Pertanyaan Harian",
    status: "verified",
    created_at: new Date().toISOString(),
  },
];

const DEFAULT_FEATURED_CARDS: FeaturedCardRow[] = [
  {
    id: "feat-1",
    word: "Bogani",
    phonetic: "/bo.ga.ni/",
    origin: "Mongondow Native",
    meaning: "Pemimpin adat, pahlawan, dan pelindung masyarakat Bolaang Mongondow zaman dahulu yang dipilih berdasarkan keberanian, kebijaksanaan, dan kejujuran.",
    example: "Ki Bogani nokoi kon Totabuan monompagal kon masyarakat.",
    aksara: "bo-ga-ni",
    quote: "Gelar kehormatan tertinggi yang tidak diwariskan secara keturunan, melainkan atas pengakuan luhur masyarakat.",
    emoji: "🛡️",
    tag: "Populer • Tokoh Adat",
    status: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "feat-2",
    word: "Totabuan",
    phonetic: "/to.ta.bu.an/",
    origin: "Austronesia Kuno",
    meaning: "Negeri permai tanah kelahiran masyarakat Bolaang Mongondow; tanah tumpah darah yang subur dan diberkahi.",
    example: "Torang pe tanah Totabuan simukat kon rezeki.",
    aksara: "to-ta-bu-an",
    quote: "Simbol kebanggaan identitas wilayah dan ikatan persaudaraan seluruh keturunan Bolaang Mongondow.",
    emoji: "🌋",
    tag: "Terbaru • Wilayah",
    status: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "feat-3",
    word: "Arai",
    phonetic: "/a.ra.i/",
    origin: "Mongondow Native",
    meaning: "Rasa gembira, sukacita mendalam, dan rasa syukur atas nikmat dan keselamatan yang diterima.",
    example: "Arai totok pe ginisid monandoi keluarga.",
    aksara: "a-ra-i",
    quote: "Ungkapan rasa syukur yang sering digunakan dalam ritual dan pesta adat Bolaang Mongondow.",
    emoji: "✨",
    tag: "Populer • Ungkapan Rasa",
    status: "verified",
    created_at: new Date().toISOString(),
  },
  {
    id: "feat-4",
    word: "Biontu",
    phonetic: "/bi.on.tu/",
    origin: "Mongondow Native",
    meaning: "Bintang penunjuk arah; pedoman hidup dan cita-cita luhur penuntun generasi.",
    example: "Patu-patuboi Biontu oi poyapoi kon totabuan.",
    aksara: "bi-on-tu",
    quote: "Nilai filosofis yang mengajarkan setiap manusia Mongondow untuk menjadi penerang bagi lingkungannya.",
    emoji: "⭐",
    tag: "Terbaru • Filosofi",
    status: "verified",
    created_at: new Date().toISOString(),
  },
];

export default function DatabaseKamusPanel() {
  const [activeTab, setActiveTab] = useState<"words" | "sentences" | "featured">("words");

  // Single Words State
  const [entries, setEntries] = useState<KamusEntryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Editor Modal state for Words
  const [editingEntry, setEditingEntry] = useState<KamusEntryRow | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Verificators List Mini Modal state
  const [verificatorsFor, setVerificatorsFor] = useState<{ entry: KamusEntryRow; list: any[] } | null>(null);
  const [isLoadingVerificators, setIsLoadingVerificators] = useState(false);

  // Short Sentences State
  const [sentences, setSentences] = useState<ShortSentenceRow[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bogani_kamus_short_sentences");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_SHORT_SENTENCES;
  });
  const [sentenceSearch, setSentenceSearch] = useState("");
  const [sentenceCatFilter, setSentenceCatFilter] = useState("");
  const [editingSentence, setEditingSentence] = useState<ShortSentenceRow | null>(null);
  const [isNewSentence, setIsNewSentence] = useState(false);

  // Featured / Trending Cards State
  const [featuredCards, setFeaturedCards] = useState<FeaturedCardRow[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bogani_featured_word_cards");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return DEFAULT_FEATURED_CARDS;
  });
  const [editingFeatured, setEditingFeatured] = useState<FeaturedCardRow | null>(null);
  const [isNewFeatured, setIsNewFeatured] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bogani_kamus_short_sentences", JSON.stringify(sentences));
    }
  }, [sentences]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bogani_featured_word_cards", JSON.stringify(featuredCards));
    }
  }, [featuredCards]);

  function loadData() {
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/kamus?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setEntries(d.entries);
      })
      .catch((e) => setError(String(e)));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Single Word Handlers
  const handleCreateNew = () => {
    setIsNewEntry(true);
    setEditingEntry({
      word: "",
      phonetic: "",
      origin: "Mongondow",
      meaning: "",
      example: "",
      category: "Kata Benda",
      aksara_breakdown: "",
      status: "draft",
      source_note: "Dibuat oleh Admin",
    });
  };

  const handleEdit = (entry: KamusEntryRow) => {
    setIsNewEntry(false);
    setEditingEntry({ ...entry });
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editingEntry.word.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/kamus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEntry),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(`Gagal menyimpan kata: ${data.error || "Terjadi kesalahan"}`);
      } else {
        setEditingEntry(null);
        loadData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleWordStatus = async (entry: KamusEntryRow) => {
    const newStatus = entry.status === "verified" ? "draft" : "verified";
    try {
      const res = await fetch("/api/admin/kamus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...entry, status: newStatus }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowVerificators = async (entry: KamusEntryRow) => {
    setVerificatorsFor({ entry, list: [] });
    setIsLoadingVerificators(true);
    try {
      const res = await fetch(`/api/admin/verificators?word=${encodeURIComponent(entry.word)}`);
      const d = await res.json();
      setVerificatorsFor({ entry, list: d.verificators || [] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVerificators(false);
    }
  };

  // Short Sentence Handlers
  const handleCreateNewSentence = () => {
    setIsNewSentence(true);
    setEditingSentence({
      id: `sent-${Date.now()}`,
      mongondow: "",
      melayu_mongondow: "",
      indonesia: "",
      english: "",
      category: "Percakapan Harian",
      status: "verified",
      created_at: new Date().toISOString(),
    });
  };

  const handleEditSentence = (item: ShortSentenceRow) => {
    setIsNewSentence(false);
    setEditingSentence({ ...item });
  };

  const handleSaveSentence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSentence || !editingSentence.mongondow.trim() || !editingSentence.indonesia.trim()) return;

    if (isNewSentence) {
      setSentences([editingSentence, ...sentences]);
    } else {
      setSentences(sentences.map((s) => (s.id === editingSentence.id ? editingSentence : s)));
    }
    setEditingSentence(null);
  };

  const handleToggleSentenceStatus = (id: string) => {
    setSentences(
      sentences.map((s) =>
        s.id === id ? { ...s, status: s.status === "verified" ? "draft" : "verified" } : s
      )
    );
  };

  const handleDeleteSentence = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kalimat pendek ini?")) {
      setSentences(sentences.filter((s) => s.id !== id));
    }
  };

  // Featured Card Handlers
  const handleCreateNewFeatured = () => {
    setIsNewFeatured(true);
    setEditingFeatured({
      id: `feat-${Date.now()}`,
      word: "",
      phonetic: "",
      origin: "Mongondow Native",
      meaning: "",
      example: "",
      aksara: "",
      quote: "",
      emoji: "✨",
      tag: "Populer",
      status: "verified",
      created_at: new Date().toISOString(),
    });
  };

  const handleEditFeatured = (card: FeaturedCardRow) => {
    setIsNewFeatured(false);
    setEditingFeatured({ ...card });
  };

  const handleSaveFeatured = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeatured || !editingFeatured.word.trim() || !editingFeatured.meaning.trim()) return;

    if (isNewFeatured) {
      setFeaturedCards([editingFeatured, ...featuredCards]);
    } else {
      setFeaturedCards(featuredCards.map((c) => (c.id === editingFeatured.id ? editingFeatured : c)));
    }
    setEditingFeatured(null);
  };

  const handleToggleFeaturedStatus = (id: string) => {
    setFeaturedCards(
      featuredCards.map((c) =>
        c.id === id ? { ...c, status: c.status === "verified" ? "draft" : "verified" } : c
      )
    );
  };

  const handleDeleteFeatured = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kartu populer ini?")) {
      setFeaturedCards(featuredCards.filter((c) => c.id !== id));
    }
  };

  // Filtered Short Sentences
  const filteredSentences = sentences.filter((s) => {
    const matchSearch =
      !sentenceSearch ||
      s.mongondow.toLowerCase().includes(sentenceSearch.toLowerCase()) ||
      s.indonesia.toLowerCase().includes(sentenceSearch.toLowerCase()) ||
      s.melayu_mongondow.toLowerCase().includes(sentenceSearch.toLowerCase()) ||
      s.english.toLowerCase().includes(sentenceSearch.toLowerCase());
    const matchCat = !sentenceCatFilter || s.category === sentenceCatFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Database Kamus &amp; Definisi Terbaru / Populer"
        subtitle="Kelola kosa kata, frasa Dialek Totabuan, serta kartu Definisi Terbaru &amp; Populer yang tampil di halaman /kamus."
      />

      {/* Sub-Tab Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-bento-border pb-2">
        <button
          onClick={() => setActiveTab("words")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "words"
              ? "bg-bento-accent text-white shadow-md"
              : "bg-bento-surface text-bento-text-secondary hover:text-bento-text-primary border border-bento-border"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Kosa Kata Single Word ({entries?.length ?? 0} Kata)</span>
        </button>

        <button
          onClick={() => setActiveTab("sentences")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "sentences"
              ? "bg-bento-accent text-white shadow-md"
              : "bg-bento-surface text-bento-text-secondary hover:text-bento-text-primary border border-bento-border"
          }`}
        >
          <MessageSquareQuote className="w-4 h-4 text-emerald-300" />
          <span>Frasa &amp; Kalimat Pendek ({sentences.length} Kalimat)</span>
        </button>

        <button
          onClick={() => setActiveTab("featured")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "featured"
              ? "bg-bento-accent text-white shadow-md"
              : "bg-bento-surface text-bento-text-secondary hover:text-bento-text-primary border border-bento-border"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Definisi Terbaru &amp; Populer ({featuredCards.filter((c) => c.status === "verified").length} Kartu Tampil di /kamus)</span>
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: KOSA KATA (SINGLE WORDS) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "words" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-bento-text-secondary" />
                <input
                  type="text"
                  placeholder="Cari kata, makna, atau fonetik..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && loadData()}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-bento-border bg-bento-surface text-xs text-bento-text-primary placeholder:text-bento-text-secondary outline-none focus:border-bento-accent"
                />
              </div>
              <Button onClick={loadData} variant="default" className="!py-2 text-xs">
                Cari
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-bento-border bg-bento-surface text-xs font-medium text-bento-text-primary outline-none"
              >
                <option value="">Semua Status</option>
                <option value="verified">Verified (Terverifikasi)</option>
                <option value="draft">Draft (Konsep)</option>
                <option value="pending_review">Pending Review</option>
              </select>

              <Button onClick={handleCreateNew} variant="primary" className="!py-2 text-xs flex items-center gap-1.5 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>+ Tambah Kata Baru</span>
              </Button>
            </div>
          </div>

          {!entries && !error && <LoadingState label="Memuat database kamus..." />}
          {error && <ErrorState message={error} />}

          {entries && (
            <Card className="!p-0 border border-bento-border overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bento-surface-lighter text-bento-text-secondary border-b border-bento-border font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5">Kata (Mongondow)</th>
                      <th className="p-3.5">Fonetik</th>
                      <th className="p-3.5">Aksara Breakdown</th>
                      <th className="p-3.5">Kategori</th>
                      <th className="p-3.5">Makna &amp; Contoh</th>
                      <th className="p-3.5">Status &amp; Verifikator</th>
                      <th className="p-3.5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bento-border/50 text-bento-text-primary">
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-bento-text-secondary">
                          Tidak ada data kata kamus yang ditemukan.
                        </td>
                      </tr>
                    ) : (
                      entries.map((entry) => (
                        <tr key={entry.word} className="hover:bg-bento-surface-lighter/50 transition-colors">
                          <td className="p-3.5 font-bold text-bento-accent">
                            {entry.word}
                            {entry.origin && (
                              <span className="ml-1.5 text-[10px] font-normal text-bento-text-secondary">
                                ({entry.origin})
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-bento-text-secondary">{entry.phonetic || "-"}</td>
                          <td className="p-3.5 font-mono text-[11px] text-bento-text-secondary">{entry.aksara_breakdown || "-"}</td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded border border-bento-border bg-bento-surface-lighter text-[10px] font-semibold">
                              {entry.category || "Umum"}
                            </span>
                          </td>
                          <td className="p-3.5 max-w-xs">
                            <p className="line-clamp-2 font-medium">{entry.meaning || "-"}</p>
                            {entry.example && (
                              <p className="line-clamp-1 text-[11px] text-bento-text-secondary italic mt-0.5">
                                &quot;{entry.example}&quot;
                              </p>
                            )}
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-col gap-1 items-start">
                              <Badge tone={entry.status === "verified" ? "success" : entry.status === "pending_review" ? "warning" : "default"}>
                                {entry.status === "verified" ? "Verified" : entry.status === "pending_review" ? "Pending" : "Draft"}
                              </Badge>

                              <button
                                onClick={() => handleShowVerificators(entry)}
                                className="text-[10px] text-bento-accent hover:underline flex items-center gap-1 font-medium mt-0.5"
                                title="Lihat siapa saja verifikator kata ini"
                              >
                                <UserCheck className="w-3 h-3" />
                                <span>Verifikator</span>
                              </button>
                            </div>
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleWordStatus(entry)}
                                className={`p-1.5 rounded-lg border text-[11px] transition-colors flex items-center gap-1 ${
                                  entry.status === "verified"
                                    ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                    : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                }`}
                                title={entry.status === "verified" ? "Kembalikan ke Draft" : "Verifikasi kata"}
                              >
                                {entry.status === "verified" ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => handleEdit(entry)}
                                className="p-1.5 rounded-lg border border-bento-border text-bento-text-secondary hover:text-bento-accent hover:bg-bento-surface-lighter transition-colors"
                                title="Edit kata ini"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: FRASA & KALIMAT PENDEK (SHORT SENTENCES MULTI-LANGUAGE) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "sentences" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-bento-text-secondary" />
                <input
                  type="text"
                  placeholder="Cari kalimat dalam Mongondow, Melayu, Indonesia, atau Inggris..."
                  value={sentenceSearch}
                  onChange={(e) => setSentenceSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-bento-border bg-bento-surface text-xs text-bento-text-primary placeholder:text-bento-text-secondary outline-none focus:border-bento-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sentenceCatFilter}
                onChange={(e) => setSentenceCatFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-bento-border bg-bento-surface text-xs font-medium text-bento-text-primary outline-none"
              >
                <option value="">Semua Kategori</option>
                <option value="Sapaan & Ucapan">Sapaan &amp; Ucapan</option>
                <option value="Pertanyaan Harian">Pertanyaan Harian</option>
                <option value="Percakapan Harian">Percakapan Harian</option>
                <option value="Perkenalan & Identity">Perkenalan &amp; Identity</option>
              </select>

              <Button onClick={handleCreateNewSentence} variant="primary" className="!py-2 text-xs flex items-center gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4" />
                <span>+ Tambah Kalimat Pendek</span>
              </Button>
            </div>
          </div>

          <Card className="!p-0 border border-bento-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-bento-surface-lighter text-bento-text-secondary border-b border-bento-border font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5">Bahasa Mongondow</th>
                    <th className="p-3.5">Dialek Totabuan (Percakapan)</th>
                    <th className="p-3.5">Bahasa Indonesia</th>
                    <th className="p-3.5">Bahasa Inggris (English)</th>
                    <th className="p-3.5">Kategori</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bento-border/50 text-bento-text-primary">
                  {filteredSentences.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-bento-text-secondary">
                        Belum ada data kalimat pendek yang ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredSentences.map((s) => (
                      <tr key={s.id} className="hover:bg-bento-surface-lighter/50 transition-colors">
                        <td className="p-3.5 font-bold text-bento-accent max-w-xs">{s.mongondow}</td>
                        <td className="p-3.5 max-w-xs font-medium text-bento-text-secondary">
                          {s.melayu_mongondow || "-"}
                        </td>
                        <td className="p-3.5 max-w-xs font-semibold">{s.indonesia}</td>
                        <td className="p-3.5 max-w-xs text-bento-text-secondary italic">{s.english || "-"}</td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded border border-bento-border bg-bento-surface-lighter text-[10px] font-semibold text-bento-accent">
                            {s.category}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <Badge tone={s.status === "verified" ? "success" : "default"}>
                            {s.status === "verified" ? "Verified" : "Draft"}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleSentenceStatus(s.id)}
                              className={`p-1.5 rounded-lg border text-[11px] transition-colors ${
                                s.status === "verified"
                                  ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                  : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                              title={s.status === "verified" ? "Set ke Draft" : "Set ke Verified"}
                            >
                              {s.status === "verified" ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => handleEditSentence(s)}
                              className="p-1.5 rounded-lg border border-bento-border text-bento-text-secondary hover:text-bento-accent hover:bg-bento-surface-lighter transition-colors"
                              title="Edit kalimat pendek ini"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteSentence(s.id)}
                              className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                              title="Hapus kalimat pendek ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: DEFINISI TERBARU & POPULER (FEATURED CARDS MANAGEMENT) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "featured" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-bento-border pb-3">
            <div>
              <h3 className="text-base font-bold text-bento-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Manajemen Definisi Terbaru &amp; Populer (Tampil di /kamus)</span>
              </h3>
              <p className="text-xs text-bento-text-secondary mt-0.5">
                Kata dan definisi yang diatur di sini akan otomatis tampil secara publik pada kartu rekomendasi halaman /kamus.
              </p>
            </div>

            <Button onClick={handleCreateNewFeatured} variant="primary" className="!py-2 text-xs flex items-center gap-1.5 shadow-sm bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4" />
              <span>+ Tambah Definisi Populer Baru</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredCards.map((card) => (
              <Card
                key={card.id}
                className={`!p-5 border transition-all ${
                  card.status === "verified"
                    ? "border-amber-500/30 bg-bento-surface shadow-sm"
                    : "border-bento-border/50 bg-bento-surface-lighter/40 opacity-60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded border border-amber-500/20">
                          {card.tag}
                        </span>
                        <Badge tone={card.status === "verified" ? "success" : "default"}>
                          {card.status === "verified" ? "Tampil di /kamus" : "Draft"}
                        </Badge>
                      </div>

                      <h4 className="text-lg font-bold text-bento-accent flex items-center gap-2">
                        <span>{card.emoji}</span>
                        <span>{card.word}</span>
                        <span className="text-xs font-mono text-bento-text-secondary font-normal">{card.phonetic}</span>
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleFeaturedStatus(card.id)}
                        className={`p-1.5 rounded-lg border text-[11px] transition-colors ${
                          card.status === "verified"
                            ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            : "border-bento-border text-bento-text-secondary hover:text-bento-text-primary"
                        }`}
                        title={card.status === "verified" ? "Sembunyikan dari /kamus" : "Tampilkan di /kamus"}
                      >
                        {card.status === "verified" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <RotateCcw className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleEditFeatured(card)}
                        className="p-1.5 rounded-lg border border-bento-border text-bento-text-secondary hover:text-bento-accent hover:bg-bento-surface-lighter transition-colors"
                        title="Edit kartu definisi ini"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteFeatured(card.id)}
                        className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Hapus kartu definisi ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-bento-text-primary leading-relaxed bg-bento-surface-lighter/50 p-3 rounded-xl border border-bento-border/50 font-medium">
                    {card.meaning}
                  </p>

                  {card.quote && (
                    <p className="text-[11px] text-amber-400/90 italic bg-amber-500/5 p-2.5 rounded-lg border border-amber-500/10">
                      &quot;{card.quote}&quot;
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-bento-text-secondary font-mono pt-1">
                    <span>Aksara: {card.aksara}</span>
                    <span>Asal: {card.origin}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL POPUP EDITOR FOR SINGLE WORD */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {editingEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingEntry(null)}
        >
          <div
            className="bg-bento-surface border border-bento-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-bento-border pb-3">
              <h3 className="text-base font-bold text-bento-text-primary flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-bento-accent" />
                <span>{isNewEntry ? "Tambah Kata Baru" : `Edit Kata: ${editingEntry.word}`}</span>
              </h3>
              <button
                onClick={() => setEditingEntry(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Kata Mongondow *</label>
                  <input
                    required
                    value={editingEntry.word}
                    onChange={(e) => setEditingEntry({ ...editingEntry, word: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm font-bold text-bento-accent outline-none focus:border-bento-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Fonetik IPA / Pengucapan</label>
                  <input
                    value={editingEntry.phonetic || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, phonetic: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm font-mono outline-none focus:border-bento-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Aksara Breakdown</label>
                  <input
                    value={editingEntry.aksara_breakdown || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, aksara_breakdown: e.target.value })}
                    placeholder="Contoh: bo-ga-ni"
                    className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Kategori Kata</label>
                  <select
                    value={editingEntry.category || "Kata Benda"}
                    onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none font-medium"
                  >
                    <option value="Kata Benda">Kata Benda (Noun)</option>
                    <option value="Kata Kerja">Kata Kerja (Verb)</option>
                    <option value="Kata Sifat">Kata Sifat (Adjective)</option>
                    <option value="Kata Sapaan">Kata Sapaan (Greeting)</option>
                    <option value="Ungkapan Adat">Ungkapan Adat (Idiom)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Makna / Definisi *</label>
                <textarea
                  required
                  rows={3}
                  value={editingEntry.meaning || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, meaning: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm leading-relaxed outline-none focus:border-bento-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Contoh Kalimat</label>
                <input
                  value={editingEntry.example || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, example: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-bento-border">
                <Button onClick={() => setEditingEntry(null)} type="button" variant="default" className="!py-2 text-xs">
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving} className="!py-2 text-xs shadow-sm">
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL POPUP EDITOR FOR SHORT SENTENCE */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {editingSentence && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingSentence(null)}
        >
          <div
            className="bg-bento-surface border border-bento-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-bento-border pb-3">
              <h3 className="text-base font-bold text-bento-text-primary flex items-center gap-2">
                <Languages className="w-4 h-4 text-emerald-400" />
                <span>{isNewSentence ? "Tambah Kalimat Pendek Baru" : "Edit Kalimat Pendek"}</span>
              </h3>
              <button
                onClick={() => setEditingSentence(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSentence} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  1. Kalimat Bahasa Mongondow *
                </label>
                <input
                  required
                  value={editingSentence.mongondow}
                  onChange={(e) => setEditingSentence({ ...editingSentence, mongondow: e.target.value })}
                  placeholder="Contoh: Mo ta'au kon mongondow iko?"
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm font-bold text-bento-accent outline-none focus:border-bento-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  2. Dialek Totabuan (Percakapan Lokal)
                </label>
                <input
                  value={editingSentence.melayu_mongondow}
                  onChange={(e) => setEditingSentence({ ...editingSentence, melayu_mongondow: e.target.value })}
                  placeholder="Contoh: Tau ba bahasa mongondow ngana?"
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm font-medium outline-none focus:border-bento-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  3. Bahasa Indonesia *
                </label>
                <input
                  required
                  value={editingSentence.indonesia}
                  onChange={(e) => setEditingSentence({ ...editingSentence, indonesia: e.target.value })}
                  placeholder="Contoh: Apakah kamu tahu berbahasa mongondow?"
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm font-semibold outline-none focus:border-bento-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  4. Bahasa Inggris (English Translation)
                </label>
                <input
                  value={editingSentence.english}
                  onChange={(e) => setEditingSentence({ ...editingSentence, english: e.target.value })}
                  placeholder="Contoh: Do you speak Mongondow language?"
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Kategori Kalimat</label>
                <select
                  value={editingSentence.category}
                  onChange={(e) => setEditingSentence({ ...editingSentence, category: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none font-medium"
                >
                  <option value="Sapaan & Ucapan">Sapaan &amp; Ucapan</option>
                  <option value="Pertanyaan Harian">Pertanyaan Harian</option>
                  <option value="Percakapan Harian">Percakapan Harian</option>
                  <option value="Perkenalan & Identity">Perkenalan &amp; Identity</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-bento-border">
                <Button onClick={() => setEditingSentence(null)} type="button" variant="default" className="!py-2 text-xs">
                  Batal
                </Button>
                <Button type="submit" variant="primary" className="!py-2 text-xs shadow-sm bg-emerald-600 hover:bg-emerald-700">
                  Simpan Kalimat Pendek
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MODAL POPUP EDITOR FOR FEATURED CARD */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {editingFeatured && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingFeatured(null)}
        >
          <div
            className="bg-bento-surface border border-bento-border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-bento-border pb-3">
              <h3 className="text-base font-bold text-bento-text-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{isNewFeatured ? "Tambah Definisi Terbaru / Populer Baru" : `Edit Kartu: ${editingFeatured.word}`}</span>
              </h3>
              <button
                onClick={() => setEditingFeatured(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFeatured} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Kata Mongondow *</label>
                  <input
                    required
                    value={editingFeatured.word}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, word: e.target.value })}
                    placeholder="Contoh: Bogani"
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm font-bold text-bento-accent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Fonetik IPA</label>
                  <input
                    value={editingFeatured.phonetic}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, phonetic: e.target.value })}
                    placeholder="Contoh: /bo.ga.ni/"
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Emoji / Ikon</label>
                  <input
                    value={editingFeatured.emoji}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, emoji: e.target.value })}
                    placeholder="🛡️"
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Asal-Usul Rumpun</label>
                  <input
                    value={editingFeatured.origin}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, origin: e.target.value })}
                    placeholder="Contoh: Austronesia Kuno"
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Aksara Breakdown</label>
                  <input
                    value={editingFeatured.aksara}
                    onChange={(e) => setEditingFeatured({ ...editingFeatured, aksara: e.target.value })}
                    placeholder="Contoh: bo-ga-ni"
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Tag / Label Populer</label>
                <input
                  value={editingFeatured.tag}
                  onChange={(e) => setEditingFeatured({ ...editingFeatured, tag: e.target.value })}
                  placeholder="Contoh: Populer • Tokoh Adat"
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Makna &amp; Penjelasan Lengkap *</label>
                <textarea
                  required
                  rows={3}
                  value={editingFeatured.meaning}
                  onChange={(e) => setEditingFeatured({ ...editingFeatured, meaning: e.target.value })}
                  placeholder="Tuliskan makna dan definisi kata secara lengkap..."
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm leading-relaxed outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Kutipan / Catatan Adat Penting</label>
                <input
                  value={editingFeatured.quote}
                  onChange={(e) => setEditingFeatured({ ...editingFeatured, quote: e.target.value })}
                  placeholder="Contoh: Gelar kehormatan tertinggi yang tidak diwariskan secara keturunan..."
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Contoh Kalimat Penggunaan</label>
                <input
                  value={editingFeatured.example}
                  onChange={(e) => setEditingFeatured({ ...editingFeatured, example: e.target.value })}
                  placeholder="Contoh: Ki Bogani nokoi kon Totabuan..."
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-bento-border">
                <Button onClick={() => setEditingFeatured(null)} type="button" variant="default" className="!py-2 text-xs">
                  Batal
                </Button>
                <Button type="submit" variant="primary" className="!py-2 text-xs shadow-sm bg-amber-600 hover:bg-amber-700">
                  Simpan Kartu Definisi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* MINI MODAL LIST VERIFIKATOR KATA */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {verificatorsFor && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setVerificatorsFor(null)}
        >
          <div
            className="bg-bento-surface border border-bento-border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-bento-border bg-bento-surface-lighter flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-bento-text-primary">
                    Verifikator: &quot;{verificatorsFor.entry.word}&quot;
                  </h4>
                  <p className="text-[11px] text-bento-text-secondary">Daftar verifikator terdaftar yang mengonfirmasi kata ini.</p>
                </div>
              </div>
              <button
                onClick={() => setVerificatorsFor(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto">
              {isLoadingVerificators ? (
                <LoadingState />
              ) : verificatorsFor.list.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <UserCheck className="w-8 h-8 text-bento-text-secondary mx-auto opacity-50" />
                  <p className="text-xs text-bento-text-secondary">
                    Kata ini belum dikonfirmasi oleh verifikator komunitas (diverifikasi langsung oleh Admin).
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {verificatorsFor.list.map((v: any, i: number) => (
                    <li key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-bento-border bg-bento-surface-lighter/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-bento-accent/20 text-bento-accent font-bold text-xs flex items-center justify-center uppercase">
                          {(v.profiles?.display_name || "V")[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-bento-text-primary">
                            {v.profiles?.display_name || "Verifikator Adat"}
                          </p>
                          <p className="text-[10px] text-bento-text-secondary font-mono">
                            {v.verified_at ? new Date(v.verified_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                        Confirmed
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 border-t border-bento-border bg-bento-surface-lighter text-right">
              <Button onClick={() => setVerificatorsFor(null)} variant="default" className="!py-1 !px-3 text-xs">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
