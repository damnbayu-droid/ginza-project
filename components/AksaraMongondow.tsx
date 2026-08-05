'use client';

import { useMemo, useState, useRef, useEffect } from "react";
import {
  Search,
  Info,
  BookOpen,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronRight,
  PenTool,
  Type,
  HelpCircle,
  Eraser,
  Undo2,
  RefreshCw,
  Layers,
} from "lucide-react";
import aksaraData from "@/data/aksara/aksara_mongondow.json";
import { transliterateToAksara, AksaraSyllable } from "@/lib/aksara-transliterate";

// ─────────────────────────────────────────────────────────────────────────
// Types & Data
// ─────────────────────────────────────────────────────────────────────────
type SyllableType = "vowel_a" | "vowel_e_i" | "vowel_o_u" | "final_consonant";

interface ExampleWord {
  id: string;
  mongondow_text: string;
  breakdown: string[];
  meaning_id: string | null;
  confidence: "verified" | "probable" | "uncertain";
  category: string;
  source: string;
  image_ref: string;
}

const DATA = aksaraData as unknown as {
  script: { name: string; academic_status: string; credit: string; sources: string[] };
  syllables: AksaraSyllable[];
  examples: ExampleWord[];
  disclaimer: string;
};

const GLYPH_BASE = "/aksara-svg/";

const FILTERS: { key: SyllableType | "all"; label: string }[] = [
  { key: "all", label: "Semua Suku Kata" },
  { key: "vowel_a", label: "Vokal Utama (A)" },
  { key: "vowel_e_i", label: "Diakritik Vokal (E / I)" },
  { key: "vowel_o_u", label: "Diakritik Vokal (O / U)" },
  { key: "final_consonant", label: "Konsonan Mati (Pamudpod)" },
];

const CONFIDENCE_STYLE: Record<ExampleWord["confidence"], string> = {
  verified: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  probable: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  uncertain: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

const CONFIDENCE_LABEL: Record<ExampleWord["confidence"], string> = {
  verified: "Terverifikasi",
  probable: "Diperkirakan",
  uncertain: "Belum Pasti",
};

interface Point {
  x: number;
  y: number;
  width: number;
}

interface Stroke {
  points: Point[];
  color: string;
}

interface AksaraMongondowProps {
  /** romanization -> status ("draft" | "pending_review" | "verified" | "archived"), dari aksara_glyphs (DB). */
  statusMap?: Record<string, string>;
}

const STATUS_LABEL: Record<string, { label: string; dot: string }> = {
  verified: { label: "Terverifikasi", dot: "bg-emerald-500" },
  pending_review: { label: "Menunggu Verifikasi", dot: "bg-amber-500" },
  draft: { label: "Draf", dot: "bg-amber-500" },
  archived: { label: "Diarsipkan", dot: "bg-gray-500" },
};

export default function AksaraMongondow({ statusMap = {} }: AksaraMongondowProps) {
  const getStatus = (romanization: string) => statusMap[romanization] ?? "verified";
  const [activeTab, setActiveTab] = useState<"matrix" | "sandbox" | "tracing" | "quiz">("matrix");
  const [filter, setFilter] = useState<SyllableType | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<AksaraSyllable | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // ── 1. Sandbox Transliterasi Real-Time ───────────────────────────────
  const [sandboxInput, setSandboxInput] = useState("Mokodompis Bolaang Mongondow");
  const sandboxResult = useMemo(() => {
    return transliterateToAksara(sandboxInput);
  }, [sandboxInput]);

  // ── 2. Studio Latihan Menulis (Tracing Canvas) ────────────────────────
  const [tracingSyllable, setTracingSyllable] = useState<AksaraSyllable>(DATA.syllables[0]);
  const [brushWidth, setBrushWidth] = useState(8);
  const [showOverlay, setShowOverlay] = useState(true);
  const [tracingStrokes, setTracingStrokes] = useState<Stroke[]>([]);
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const redrawCanvas = (strokesList: Stroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokesList) {
      if (!stroke || stroke.points.length === 0) continue;
      ctx.strokeStyle = stroke.color;
      ctx.fillStyle = stroke.color;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.points.length === 1) {
        const p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      for (let i = 0; i < stroke.points.length - 1; i++) {
        const p1 = stroke.points[i];
        const p2 = stroke.points[i + 1];

        ctx.beginPath();
        ctx.lineWidth = p1.width;
        ctx.moveTo(p1.x, p1.y);

        if (i < stroke.points.length - 2) {
          const p3 = stroke.points[i + 2];
          const xc = (p2.x + p3.x) / 2;
          const yc = (p2.y + p3.y) / 2;
          ctx.quadraticCurveTo(p2.x, p2.y, xc, yc);
        } else {
          ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    if (activeTab === "tracing") {
      redrawCanvas(tracingStrokes);
    }
  }, [activeTab, tracingStrokes]);

  const startTracing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const initialPoint: Point = { x, y, width: brushWidth };
    const newStroke: Stroke = {
      points: [initialPoint],
      color: "#3b82f6",
    };

    currentStrokeRef.current = newStroke;
    isDrawingRef.current = true;
  };

  const drawTracing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    const newPoint: Point = { x, y, width: brushWidth };
    currentStrokeRef.current.points.push(newPoint);

    redrawCanvas([...tracingStrokes, currentStrokeRef.current]);
  };

  const stopTracing = () => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    // Ambil nilainya dulu ke variabel lokal — JANGAN baca currentStrokeRef.current
    // di dalam updater setState, karena baris di bawah menge-null-kan ref itu
    // sebelum React tentu sudah menjalankan updater-nya (race condition yang
    // menyebabkan null ikut masuk ke tracingStrokes -> crash di redrawCanvas).
    const finishedStroke = currentStrokeRef.current;
    setTracingStrokes((prev) => [...prev, finishedStroke]);
    currentStrokeRef.current = null;
    isDrawingRef.current = false;
  };

  const handleUndoTracing = () => {
    setTracingStrokes((prev) => prev.slice(0, -1));
  };

  const clearTracingCanvas = () => {
    setTracingStrokes([]);
  };

  // ── 3. Kuis Interaktif Aksara ─────────────────────────────────────────
  const [quizOn, setQuizOn] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<AksaraSyllable | null>(null);
  const [quizChoices, setQuizChoices] = useState<string[]>([]);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0 });

  const syllables = DATA.syllables;

  const filtered = useMemo(() => {
    return syllables.filter((s) => {
      const matchesType = filter === "all" || s.syllable_type === filter;
      const matchesQuery = query.trim() === "" || s.romanization.includes(query.trim().toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [syllables, filter, query]);

  function bySyllableRomanization(rom: string): AksaraSyllable | undefined {
    return syllables.find((s) => s.romanization === rom);
  }

  function newQuizQuestion() {
    const pool = syllables;
    const q = pool[Math.floor(Math.random() * pool.length)];
    const wrongPool = pool.filter((s) => s.romanization !== q.romanization);
    const wrongs: string[] = [];
    while (wrongs.length < 3 && wrongPool.length > 0) {
      const idx = Math.floor(Math.random() * wrongPool.length);
      const candidate = wrongPool[idx].romanization;
      if (!wrongs.includes(candidate)) wrongs.push(candidate);
      wrongPool.splice(idx, 1);
    }
    const choices = [...wrongs, q.romanization].sort(() => Math.random() - 0.5);
    setQuizQuestion(q);
    setQuizChoices(choices);
    setQuizFeedback(null);
  }

  function startQuiz() {
    setQuizOn(true);
    setQuizScore({ correct: 0, total: 0 });
    newQuizQuestion();
  }

  useEffect(() => {
    if (activeTab === "quiz" && (!quizOn || !quizQuestion)) {
      startQuiz();
    }
  }, [activeTab, quizOn, quizQuestion]);

  function answerQuiz(choice: string) {
    if (!quizQuestion || quizFeedback) return;
    const isCorrect = choice === quizQuestion.romanization;
    setQuizFeedback(isCorrect ? "correct" : "wrong");
    setQuizScore((prev) => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    setTimeout(newQuizQuestion, 1100);
  }

  return (
    <div className="w-full max-w-5xl mx-auto text-[#ececec]">
      {/* Header Utama Modul */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-[#212330] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <BookOpen className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Aksara Bolaang Mongondow
              </h1>
              <p className="text-xs text-gray-400">
                Modul Pembelajaran &amp; Transliterasi Aksara Bolaang Mongondow (Loloda Mokoagow / Basahan)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInfo((v) => !v)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#171822] hover:bg-[#202230] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-semibold transition-all shadow-sm"
          >
            <Info className="w-4 h-4 text-blue-400" />
            <span>{showInfo ? "Sembunyikan Pedoman" : "Pedoman & Status Akademis"}</span>
          </button>
        </div>

        {showInfo && (
          <div className="rounded-2xl bg-[#131520] border border-blue-500/30 p-5 text-xs text-gray-300 leading-relaxed space-y-3 shadow-xl animate-fadeIn">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="font-semibold text-white text-sm">{DATA.script.name}</p>
                <p className="text-gray-300">{DATA.script.academic_status}</p>
                <p className="text-gray-400 text-[11px] pt-1 border-t border-[#212333]">
                  Kredit Penyusunan: {DATA.script.credit}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs Interaktif */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-[#1c1e2b]">
        {[
          { id: "matrix", label: "Penjelajah & Matriks Suku Kata", icon: Layers },
          { id: "sandbox", label: "Transliterasi Teks Real-time", icon: Type },
          { id: "tracing", label: "Studio Latihan Menulis", icon: PenTool },
          { id: "quiz", label: "Kuis & Latihan Tebak Aksara", icon: HelpCircle },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === "quiz" && !quizOn) startQuiz();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                isActive
                  ? "bg-blue-600/20 text-blue-300 border-blue-500/40 shadow-lg shadow-blue-600/10"
                  : "bg-[#141520] text-gray-400 border-[#222434] hover:bg-[#1c1e2d] hover:text-white"
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-gray-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: MATRIKS & PENJELAJAH SAKU KATA */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "matrix" && (
        <div className="space-y-6">
          {/* Filter & Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131520] p-3 rounded-2xl border border-[#222536]">
            <div className="flex flex-wrap items-center gap-1.5">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    filter === f.key
                      ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                      : "bg-[#191b28] text-gray-300 border-[#2a2c3d] hover:bg-[#222436]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-[#191b28] border border-[#2a2c3d] rounded-xl px-3 py-1.5 w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari suku kata (mis. 'mo')"
                className="bg-transparent outline-none text-xs text-white placeholder:text-gray-500 w-full sm:w-44 font-medium"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-white text-xs">
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Grid Suku Kata */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                title={STATUS_LABEL[getStatus(s.romanization)]?.label ?? getStatus(s.romanization)}
                className={`relative flex flex-col items-center justify-between gap-1.5 rounded-2xl bg-[#f5f0e6] border-2 p-2.5 transition-all hover:-translate-y-1 hover:shadow-xl ${
                  selected?.id === s.id
                    ? "border-blue-500 ring-2 ring-blue-500/40 shadow-lg shadow-blue-500/20"
                    : "border-transparent"
                }`}
              >
                <span
                  className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${STATUS_LABEL[getStatus(s.romanization)]?.dot ?? "bg-emerald-500"}`}
                  aria-hidden
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={GLYPH_BASE + s.glyph_svg}
                  alt={s.romanization}
                  className="w-12 h-16 object-contain"
                  draggable={false}
                />
                <span className="text-[11px] font-bold text-[#2d2419] font-mono">{s.romanization}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-gray-400 bg-[#131520] rounded-2xl border border-[#222536]">
                Tidak ada suku kata yang sesuai dengan pencarian ini.
              </div>
            )}
          </div>

          {/* Detail Drawer Modal */}
          {selected && (
            <div className="rounded-2xl bg-[#131520] border border-blue-500/40 p-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 animate-fadeIn">
              <div className="flex items-center gap-4">
                <div className="bg-[#f5f0e6] p-3 rounded-2xl border border-gray-300 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={GLYPH_BASE + selected.glyph_svg}
                    alt={selected.romanization}
                    className="w-16 h-24 object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                    Detail Suku Kata Aksara
                  </span>
                  <h3 className="text-2xl font-bold text-white font-mono">{selected.romanization}</h3>
                  <p className="text-xs text-gray-300">
                    Konsonan: <strong className="text-white">{selected.consonant ?? "(Tanpa Konsonan)"}</strong> &middot; Vokal: <strong className="text-white">{selected.vowel ?? "(Konsonan Mati / Pamudpod)"}</strong>
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Kategori: {FILTERS.find((f) => f.key === selected.syllable_type)?.label}
                  </p>
                  <p className="text-[11px] flex items-center gap-1.5 pt-0.5">
                    <span className={`w-2 h-2 rounded-full ${STATUS_LABEL[getStatus(selected.romanization)]?.dot ?? "bg-emerald-500"}`} aria-hidden />
                    <span className="text-gray-300 font-semibold">
                      Status: {STATUS_LABEL[getStatus(selected.romanization)]?.label ?? getStatus(selected.romanization)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setTracingSyllable(selected);
                    setActiveTab("tracing");
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Latih Menulis Huruf Ini</span>
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-3 py-2 rounded-xl bg-[#202230] text-gray-400 hover:text-white text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: SANDBOX TRANSLITERASI REAL-TIME */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "sandbox" && (
        <div className="space-y-6">
          <div className="bg-[#131520] border border-[#222536] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Type className="w-5 h-5 text-blue-400" />
                <span>Transliterasi Teks ke Aksara Mongondow</span>
              </h2>
              <p className="text-xs text-gray-400">
                Ketikkan kata atau kalimat dalam alfabet Latin. Sistem mengonversi secara otomatis ke naskah Aksara Mongondow resmi berdasarkan 88 suku kata.
              </p>
            </div>

            <div className="relative">
              <textarea
                value={sandboxInput}
                onChange={(e) => setSandboxInput(e.target.value)}
                placeholder="Ketik teks di sini (misal: Mokodompis Bolaang Mongondow Totabuan)..."
                rows={3}
                className="w-full bg-[#181a27] border border-[#2b2e42] focus:border-blue-500 rounded-xl p-4 text-sm text-white outline-none font-medium placeholder-gray-500 transition-all"
              />
              {sandboxInput && (
                <button
                  onClick={() => setSandboxInput("")}
                  className="absolute top-3 right-3 text-xs text-gray-400 hover:text-white"
                >
                  Bersihkan
                </button>
              )}
            </div>

            {/* Rekomendasi sampel cepat */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">Contoh Kata:</span>
              {["Mokodompis", "Totabuan", "Bolaang", "Motaau", "Bogani", "Inaton", "Modayag"].map((w) => (
                <button
                  key={w}
                  onClick={() => setSandboxInput(w)}
                  className="px-3 py-1 rounded-full bg-[#191b28] hover:bg-[#25283b] text-gray-300 border border-[#292c3f] text-[11px] font-medium transition-all"
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Render Aksara Result Box */}
          <div className="bg-[#131520] border border-[#222536] rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#212333] pb-3">
              <span className="text-xs font-mono uppercase font-bold text-blue-400 tracking-wider">
                Hasil Naskah Aksara (Vector SVG)
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {sandboxResult.success ? "100% Terpetakan" : "Sebagian Huruf Tidak Terjangkau"}
              </span>
            </div>

            {sandboxResult.success ? (
              <div className="space-y-6 pt-2">
                <div className="flex flex-wrap gap-6 bg-[#0c0d14] p-5 rounded-2xl border border-[#202234]">
                  {sandboxResult.words.map((wordSyllables, wIdx) => (
                    <div key={wIdx} className="flex gap-2">
                      {wordSyllables.map((syl, sIdx) => (
                        <div
                          key={`${syl.id}-${sIdx}`}
                          className="flex flex-col items-center bg-[#f5f0e6] rounded-xl p-2 shadow-md hover:scale-105 transition-transform"
                          title={`${syl.romanization} (${syl.syllable_type})`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={GLYPH_BASE + syl.glyph_svg}
                            alt={syl.romanization}
                            className="w-10 h-14 object-contain"
                            draggable={false}
                          />
                          <span className="text-[10px] text-[#2d2419] font-bold font-mono mt-1">
                            {syl.romanization}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-gray-300">Rincian Suku Kata per Kata:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {sandboxResult.words.map((wordSyllables, wIdx) => (
                      <div key={wIdx} className="p-3 rounded-xl bg-[#191b28] border border-[#27293a] text-xs space-y-1">
                        <p className="font-bold text-white font-mono">
                          Kata #{wIdx + 1}: {wordSyllables.map((s) => s.romanization).join("-")}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          Jumlah glif: {wordSyllables.length} suku kata
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-2 bg-[#181a27] rounded-xl border border-[#292c3e] p-4">
                <p className="text-xs text-amber-400 font-semibold">
                  Teks memuat huruf Latin di luar inventori fonem Mongondow (seperti c, f, j, q, v, x, z).
                </p>
                <p className="text-[11px] text-gray-400 max-w-lg mx-auto">
                  Aksara Mongondow hanya memiliki 15 konsonan utama dan 3 baris vokal (A, E/I, O/U). Cobalah gunakan ejaan tradisional Mongondow.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: STUDIO LATIHAN MENULIS (TRACING CANVAS) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "tracing" && (
        <div className="space-y-6">
          <div className="bg-[#131520] border border-[#222536] rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#212333] pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-blue-400" />
                  <span>Studio Latihan Menulis Aksara</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Goreskan huruf di canvas untuk melatih memori otot tulisan tangan Aksara Bolaang Mongondow.
                </p>
              </div>

              {/* Syllable Picker Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-semibold">Pilih Huruf:</span>
                <select
                  value={tracingSyllable.id}
                  onChange={(e) => {
                    const found = syllables.find((s) => s.id === e.target.value);
                    if (found) {
                      setTracingSyllable(found);
                      setTracingStrokes([]);
                    }
                  }}
                  className="bg-[#191b28] border border-[#2a2c3d] text-white text-xs font-mono font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-500"
                >
                  {syllables.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.romanization} ({FILTERS.find((f) => f.key === s.syllable_type)?.label})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#181a27] p-3 rounded-xl border border-[#292c3f]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowOverlay((v) => !v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    showOverlay
                      ? "bg-blue-600/20 text-blue-300 border-blue-500/40"
                      : "bg-[#202232] text-gray-400 border-[#2f3248]"
                  }`}
                >
                  {showOverlay ? "Sembunyikan Panduan Bayangan" : "Tampilkan Panduan Bayangan"}
                </button>

                <div className="flex items-center gap-1.5 border-l border-[#292c3f] pl-3">
                  <span className="text-xs text-gray-400">Ketebalan Kuas:</span>
                  {[4, 8, 12, 16].map((w) => (
                    <button
                      key={w}
                      onClick={() => setBrushWidth(w)}
                      className={`w-7 h-7 rounded-lg border text-xs font-bold ${
                        brushWidth === w
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-[#202232] border-[#2f3248] text-gray-400"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndoTracing}
                  disabled={tracingStrokes.length === 0}
                  className="px-3 py-1.5 rounded-lg bg-[#202232] hover:bg-[#2b2d42] text-gray-300 text-xs font-semibold border border-[#2f3248] disabled:opacity-40 flex items-center gap-1.5"
                >
                  <Undo2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Urungkan</span>
                </button>
                <button
                  onClick={clearTracingCanvas}
                  className="px-3 py-1.5 rounded-lg bg-[#202232] hover:bg-[#2b2d42] text-gray-300 text-xs font-semibold border border-[#2f3248] flex items-center gap-1.5"
                >
                  <Eraser className="w-3.5 h-3.5 text-red-400" />
                  <span>Bersihkan Canvas</span>
                </button>
              </div>
            </div>

            {/* Interactive Canvas Area */}
            <div className="relative border-2 border-dashed border-[#2b2e42] rounded-2xl bg-[#f5f0e6] p-4 flex items-center justify-center min-h-[340px]">
              {/* Reference SVG Overlay */}
              {showOverlay && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={GLYPH_BASE + tracingSyllable.glyph_svg}
                    alt={tracingSyllable.romanization}
                    className="w-48 h-64 object-contain"
                  />
                </div>
              )}

              <canvas
                ref={canvasRef}
                width={700}
                height={320}
                onMouseDown={startTracing}
                onMouseMove={drawTracing}
                onMouseUp={stopTracing}
                onMouseLeave={stopTracing}
                onTouchStart={startTracing}
                onTouchMove={drawTracing}
                onTouchEnd={stopTracing}
                className="w-full h-80 cursor-crosshair rounded-xl touch-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB 4: KUIS INTERAKTIF AKSARA */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "quiz" && quizOn && quizQuestion && (
        <div className="space-y-6">
          <div className="bg-[#131520] border border-blue-500/40 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#212333] pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-400" />
                  <span>Kuis Tebak Aksara Mongondow</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Pilih bunyi romanisasi yang tepat untuk glif Aksara di bawah ini.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400">Skor Pengguna:</span>
                <p className="text-lg font-mono font-bold text-blue-400">
                  {quizScore.correct} / {quizScore.total}
                </p>
              </div>
            </div>

            {/* Display Question Image */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#0c0d14] rounded-2xl border border-[#202234]">
              <div className="bg-[#f5f0e6] p-4 rounded-2xl shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={GLYPH_BASE + quizQuestion.glyph_svg}
                  alt="Tebak Aksara"
                  className="w-24 h-36 object-contain"
                />
              </div>
              <p className="text-xs text-gray-400 mt-4">Glif Aksara manakah ini?</p>
            </div>

            {/* Choices Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quizChoices.map((choice) => {
                const isAnswer = choice === quizQuestion.romanization;
                const showState = quizFeedback && isAnswer;
                const showWrong = quizFeedback === "wrong" && !isAnswer;
                return (
                  <button
                    key={choice}
                    onClick={() => answerQuiz(choice)}
                    disabled={!!quizFeedback}
                    className={`px-4 py-3 rounded-xl text-sm font-bold font-mono border transition-all ${
                      showState
                        ? "bg-emerald-600/20 border-emerald-500 text-emerald-300"
                        : showWrong
                        ? "opacity-30 border-[#2b2e40] text-gray-500"
                        : "bg-[#181a27] border-[#292c3f] text-white hover:bg-[#222436] hover:border-blue-500/50"
                    }`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Reset */}
            <div className="flex items-center justify-between pt-2">
              {quizFeedback && (
                <div
                  className={`flex items-center gap-2 text-xs font-bold ${
                    quizFeedback === "correct" ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {quizFeedback === "correct" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>
                    {quizFeedback === "correct"
                      ? "Jawaban Anda Benar!"
                      : `Jawaban kurang tepat. Pembacaan resmi adalah "${quizQuestion.romanization}"`}
                  </span>
                </div>
              )}

              <button
                onClick={startQuiz}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1c1e2d] hover:bg-[#25283c] text-gray-300 text-xs font-semibold border border-[#2b2e42]"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                <span>Ulangi Kuis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* CONTOH KATA & FRASA BERAKSARA */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div className="mt-10 space-y-4">
        <div className="border-b border-[#212330] pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Contoh Kata &amp; Dokumentasi Naskah</span>
          </h2>
          <p className="text-xs text-gray-400">
            Contoh kosakata Bolaang Mongondow asli yang telah terverifikasi beserta segmentasi glif.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DATA.examples.map((ex) => (
            <div key={ex.id} className="rounded-2xl bg-[#131520] border border-[#222536] p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-white text-base">{ex.mongondow_text}</span>
                <span
                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${CONFIDENCE_STYLE[ex.confidence]}`}
                >
                  {CONFIDENCE_LABEL[ex.confidence]}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {ex.breakdown.map((rom, idx) => {
                  const syl = bySyllableRomanization(rom);
                  if (!syl) return null;
                  return (
                    <div key={idx} className="flex flex-col items-center bg-[#f5f0e6] rounded-xl p-1.5 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={GLYPH_BASE + syl.glyph_svg} alt={rom} className="w-8 h-12 object-contain" />
                      <span className="text-[9px] text-[#2d2419] font-bold font-mono mt-0.5">{rom}</span>
                    </div>
                  );
                })}
              </div>

              {ex.meaning_id && <p className="text-xs text-gray-300">{ex.meaning_id}</p>}

              <p className="text-[11px] text-gray-500 flex items-center gap-1 pt-1 border-t border-[#1c1e2b]">
                <ChevronRight className="w-3 h-3 text-blue-400" />
                <span>Sumber: {ex.source}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Disclaimer Footer */}
      <p className="text-[11px] text-gray-500 border-t border-[#1c1e2b] pt-4 mt-8">
        {DATA.disclaimer}
      </p>
    </div>
  );
}
