/**
 * bogani-thinking-phrases.ts
 * Kata/frasa Mongondow berputar utk indikator "sedang berpikir" ala Claude
 * saat menunggu jawaban Bogani AI (lihat components/homepage/BoganiThinkingIndicator.tsx).
 *
 * PENTING: ini murni gaya visual (bukan mencerminkan langkah nyata di server)
 * -- disengaja begitu supaya tidak menghambat kecepatan jawaban AI (kecepatan
 * & keakuratan jawaban tetap prioritas #1, sesuai arahan Boss Bayu). Kata2
 * di sini BUKAN dari kamus terverifikasi (lib/mongondow-vocab.ts) -- itu
 * dicek dulu dan ternyata tidak ada entri utk "berpikir/mencari/mengolah",
 * jadi daftar ini disuplai langsung oleh Boss Bayu sendiri (founder proyek,
 * sumber otoritatif), bukan tebakan/karangan sesi ini.
 */

export interface ThinkingPhase {
  /** Kata/frasa yang berputar acak selama fase ini berlangsung. */
  words: string[];
  /** SELALU tampil terakhir di fase ini sebelum pindah ke fase berikutnya. */
  closingWord: string;
}

// 3 fase, masing2 "33.3%" dari keseluruhan proses (Berpikir -> Mencari
// Jawaban -> Menampilkan Jawaban). Fase terakhir dipakai utk loop kalau
// jawaban asli ternyata lebih lama dari total durasi animasi 3 fase ini.
export const THINKING_PHASES: ThinkingPhase[] = [
  { words: ["mohuyut...", "momikir..."], closingWord: "Monontama..." },
  { words: ["kotaauanq...", "ambeaaa..."], closingWord: "monakit-in-gina..." },
  { words: ["kolionganq...", "olat-paa..."], closingWord: "moko'ontong..." },
];

// Disisipkan acak di antara kata fase (bukan sbg penutup fase) supaya tiap
// sesi obrolan terasa beda, tidak melulu urutan yang sama.
export const THINKING_VARIETY_POOL: string[] = [
  "ta-ambee...",
  "onu-tua...",
  "jiabidon...",
  "yaraciitt...",
  "jia'pa aku'oy",
  "ta'od-paa...",
  "natua-bi'ee!?...",
  "laporon-kon-pala-naa",
  "hai-ta-ambe...",
  "tu-tuu-pa-naa?",
  "mo-hebat-don-aku'oy-aaa",
  "de'eman-tua-yoo'",
  "na'anda-kabi...",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Bangun urutan kata utk satu fase: kata khas fase + 1-2 kata acak dari pool
 * variasi (dikocok bareng), lalu closingWord SELALU di posisi terakhir.
 */
export function buildPhaseQueue(phase: ThinkingPhase): string[] {
  const extraCount = 1 + Math.floor(Math.random() * 2); // 1-2 kata tambahan
  const extras = shuffle(THINKING_VARIETY_POOL).slice(0, extraCount);
  const shuffledBody = shuffle([...phase.words, ...extras]);
  return [...shuffledBody, phase.closingWord];
}

/** Kata acak dari pool variasi -- dipakai saat loop di fase terakhir. */
export function randomVarietyWord(): string {
  return THINKING_VARIETY_POOL[Math.floor(Math.random() * THINKING_VARIETY_POOL.length)];
}
