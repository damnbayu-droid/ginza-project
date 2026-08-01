'use client';

import { useMemo, useState } from "react";
import {
  Search,
  Info,
  BookOpen,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import aksaraData from "@/data/aksara/aksara_mongondow.json";

// ─────────────────────────────────────────────────────────────────────────
// Types (selaras dengan data/aksara/aksara_mongondow.json)
// ─────────────────────────────────────────────────────────────────────────
type SyllableType = "vowel_a" | "vowel_e_i" | "vowel_o_u" | "final_consonant";

interface Syllable {
  id: string;
  romanization: string;
  consonant: string | null;
  vowel: string | null;
  syllable_type: SyllableType;
  glyph_image: string;
  display_order: number;
}

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
  syllables: Syllable[];
  examples: ExampleWord[];
  disclaimer: string;
};

const GLYPH_BASE = "/aksara/";

const FILTERS: { key: SyllableType | "all"; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "vowel_a", label: "Vokal A" },
  { key: "vowel_e_i", label: "Vokal E / I" },
  { key: "vowel_o_u", label: "Vokal O / U" },
  { key: "final_consonant", label: "Konsonan Mati" },
];

const CONFIDENCE_STYLE: Record<ExampleWord["confidence"], string> = {
  verified: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  probable: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  uncertain: "text-amber-400 bg-amber-500/10 border-amber-500/30",
};

const CONFIDENCE_LABEL: Record<ExampleWord["confidence"], string> = {
  verified: "Terverifikasi",
  probable: "Diperkirakan",
  uncertain: "Belum pasti",
};

function SyllableTile({
  syllable,
  onClick,
  active,
}: {
  syllable: Syllable;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl bg-[#f5f0e6] border-2 p-2 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
        active ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-transparent"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GLYPH_BASE + syllable.glyph_image}
        alt={syllable.romanization}
        className="w-12 h-16 object-contain"
        draggable={false}
      />
      <span className="text-[11px] font-semibold text-[#3a2f22]">{syllable.romanization}</span>
    </button>
  );
}

export default function AksaraMongondow() {
  const [filter, setFilter] = useState<SyllableType | "all">("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Syllable | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  // ── Kuis ──────────────────────────────────────────────────────────────
  const [quizOn, setQuizOn] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState<Syllable | null>(null);
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

  function bySyllableRomanization(rom: string): Syllable | undefined {
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

  function answerQuiz(choice: string) {
    if (!quizQuestion || quizFeedback) return;
    const isCorrect = choice === quizQuestion.romanization;
    setQuizFeedback(isCorrect ? "correct" : "wrong");
    setQuizScore((prev) => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }));
    setTimeout(newQuizQuestion, 900);
  }

  return (
    <div className="w-full max-w-5xl mx-auto text-[#ececec]">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Aksara Bolaang Mongondow</h2>
          </div>
          <button
            onClick={() => setShowInfo((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#212121] hover:bg-[#2b2b2b] text-gray-300 hover:text-white border border-[#333] text-xs font-semibold transition-all"
          >
            <Info className="w-3.5 h-3.5" />
            {showInfo ? "Sembunyikan info" : "Asal-usul & status"}
          </button>
        </div>

        {showInfo && (
          <div className="rounded-2xl bg-[#212121] border border-amber-500/30 p-4 text-sm text-gray-300 leading-relaxed space-y-2">
            <p>{DATA.script.academic_status}</p>
            <p className="text-gray-400 text-xs">Kredit: {DATA.script.credit}</p>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              filter === f.key
                ? "bg-blue-600/20 text-white border-blue-500/30"
                : "bg-[#212121] text-gray-300 border-[#333] hover:bg-[#2b2b2b]"
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto bg-[#212121] border border-[#2f2f2f] rounded-xl px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari suku kata (mis. 'mo')"
            className="bg-transparent outline-none text-xs text-white placeholder:text-gray-500 w-40"
          />
        </div>
        <button
          onClick={startQuiz}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Mulai Kuis
        </button>
      </div>

      {/* Grid suku kata */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-6">
        {filtered.map((s) => (
          <SyllableTile
            key={s.id}
            syllable={s}
            active={selected?.id === s.id}
            onClick={() => setSelected(s)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-gray-400 py-6 text-center">
            Tidak ada suku kata yang cocok.
          </p>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="rounded-2xl bg-[#212121] border border-[#2f2f2f] p-4 mb-6 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GLYPH_BASE + selected.glyph_image}
            alt={selected.romanization}
            className="w-16 h-24 object-contain bg-[#f5f0e6] rounded-xl p-2"
          />
          <div>
            <p className="text-lg font-bold text-white">{selected.romanization}</p>
            <p className="text-xs text-gray-400">
              Konsonan: {selected.consonant ?? "(tanpa konsonan)"} &middot; Vokal: {selected.vowel ?? "(mati/tanpa vokal)"}
            </p>
            <p className="text-[11px] text-gray-500 mt-1">
              Tipe: {FILTERS.find((f) => f.key === selected.syllable_type)?.label}
            </p>
          </div>
        </div>
      )}

      {/* Kuis */}
      {quizOn && quizQuestion && (
        <div className="rounded-2xl bg-[#212121] border border-blue-500/30 p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Aksara ini dibaca apa?</p>
            <p className="text-xs text-gray-400">
              Skor: {quizScore.correct}/{quizScore.total}
            </p>
          </div>
          <div className="flex items-center justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={GLYPH_BASE + quizQuestion.glyph_image}
              alt="Tebak aksara"
              className="w-20 h-28 object-contain bg-[#f5f0e6] rounded-xl p-2"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {quizChoices.map((choice) => {
              const isAnswer = choice === quizQuestion.romanization;
              const showState = quizFeedback && isAnswer;
              const showWrong = quizFeedback === "wrong" && !isAnswer;
              return (
                <button
                  key={choice}
                  onClick={() => answerQuiz(choice)}
                  disabled={!!quizFeedback}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    showState
                      ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-300"
                      : showWrong
                      ? "opacity-40 border-[#333] text-gray-400"
                      : "bg-[#2b2b2b] border-[#333] text-white hover:bg-[#333]"
                  }`}
                >
                  {choice}
                </button>
              );
            })}
          </div>
          {quizFeedback && (
            <div
              className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${
                quizFeedback === "correct" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {quizFeedback === "correct" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {quizFeedback === "correct" ? "Benar!" : `Kurang tepat, jawabannya "${quizQuestion.romanization}"`}
            </div>
          )}
          <button
            onClick={() => setQuizOn(false)}
            className="mt-4 flex items-center gap-1.5 text-xs text-gray-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tutup kuis
          </button>
        </div>
      )}

      {/* Contoh kata */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-white mb-3">Contoh Kata & Frasa</h3>
        <div className="flex flex-col gap-3">
          {DATA.examples.map((ex) => (
            <div key={ex.id} className="rounded-2xl bg-[#212121] border border-[#2f2f2f] p-4">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <p className="font-semibold text-white">{ex.mongondow_text}</p>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${CONFIDENCE_STYLE[ex.confidence]}`}
                >
                  {CONFIDENCE_LABEL[ex.confidence]}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {ex.breakdown.map((rom, idx) => {
                  const syl = bySyllableRomanization(rom);
                  if (!syl) return null;
                  return (
                    <div key={idx} className="flex flex-col items-center bg-[#f5f0e6] rounded-lg p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={GLYPH_BASE + syl.glyph_image} alt={rom} className="w-8 h-11 object-contain" />
                      <span className="text-[9px] text-[#3a2f22] font-medium">{rom}</span>
                    </div>
                  );
                })}
              </div>
              {ex.meaning_id && <p className="text-xs text-gray-300 mb-1">{ex.meaning_id}</p>}
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                {ex.source}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-gray-500 border-t border-[#2f2f2f] pt-3">{DATA.disclaimer}</p>
    </div>
  );
}
