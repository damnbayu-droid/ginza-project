'use client';

import { useEffect, useState } from "react";
import { THINKING_PHASES, buildPhaseQueue } from "@/lib/bogani-thinking-phrases";

// Diperlambat 2x atas permintaan Boss Bayu: draf awal 32ms/900ms -> +40%
// (45ms/1260ms) -> +20% lagi dari situ -> 54ms/1512ms -> dipercepat 2x
// (2026-08-18) -> 27ms/756ms -> dipercepat 2x LAGI (2026-08-18, "pas") ->
// nilai final di bawah.
const TYPE_CHAR_MS = 14; // kecepatan efek ketik per karakter (kata Mongondow)
const HOLD_AFTER_TYPED_MS = 378; // jeda setelah kata selesai diketik, sebelum ganti

// Jeda antar-huruf efek ketik utk SUMBER (Kamus/Knowledge/dst) -- SENGAJA
// efek TYPE (ketik karakter-demi-karakter), BUKAN pop-in/scale spt draf
// sebelumnya (Boss Bayu: "muncul dari bawah ke atas, frame membesar-mengecil,
// tidak enak dipandang"). Kecepatan per-KARAKTER (bukan per-item) berbasis
// POSISI PERSENTASE dlm satu putaran daftar sumber -- setiap item ketiknya
// beda kecepatan tergantung posisinya, jadi ritmenya terasa hidup/dinamis.
// Rasio 30/15/35/25% dipertahankan; nilai ms dipercepat 50% dari draf pertama
// (35/220/150/80) -> dipercepat 2x (2026-08-18) -> 9/55/38/20 -> dipercepat
// 2x LAGI (2026-08-18, "pas") -> nilai final di bawah.
const HOLD_AFTER_SOURCE_TYPED_MS = 33;
function getSourceCharDelayMs(indexInCycle: number, totalSources: number): number {
  if (totalSources <= 0) return 5;
  const position = (indexInCycle % totalSources) / totalSources; // 0..1 dlm satu putaran
  if (position < 0.30) return 5;
  if (position < 0.45) return 28;
  if (position < 0.80) return 19;
  return 10;
}

export type RealPhase = 'berpikir' | 'mencari_jawaban';

const PHASE_INDEX: Record<RealPhase, number> = {
  berpikir: 0,
  mencari_jawaban: 1,
};

export interface BoganiThinkingDisplay {
  /** Teks kata Mongondow yg sedang "diketik" (efek ketik karakter demi karakter). */
  displayWord: string;
  /** true selagi efek ketik kata Mongondow masih berjalan (dipakai utk kursor berkedip). */
  isTyping: boolean;
  /** Label sumber yg sedang "diketik" (efek ketik, bukan pop-in) -- string kosong kalau belum mulai/tidak ada sumber. */
  displaySource: string;
  /** true selagi efek ketik sumber masih berjalan. */
  isSourceTyping: boolean;
}

/**
 * Hook bersama utk tampilan "sedang berpikir" Bogani AI (kata Mongondow +
 * sumber yg dipakai, dua-duanya efek KETIK karakter-demi-karakter) --
 * dipakai baik oleh components/homepage/BoganiThinkingIndicator.tsx (chat
 * teks) MAUPUN components/homepage/VoiceModeOverlay.tsx (Voice Mode), supaya
 * perilakunya identik & tidak duplikat kode. `phase`/`sources` datang dari
 * event SSE server (lihat app/api/homepage/chat/route.ts#runChatPipeline) --
 * BUKAN timer kosmetik.
 */
export function useBoganiThinkingDisplay(phase: RealPhase | null, sources: string[]): BoganiThinkingDisplay {
  const [displayWord, setDisplayWord] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [displaySource, setDisplaySource] = useState("");
  const [isSourceTyping, setIsSourceTyping] = useState(false);

  const activePhase: RealPhase = phase ?? 'berpikir';
  const sourcesKey = sources.join("|");

  useEffect(() => {
    if (sources.length === 0) {
      setDisplaySource("");
      return;
    }
    let cancelled = false;
    let sourceIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeSource(text: string, charDelayMs: number, onDone: () => void) {
      let i = 0;
      setIsSourceTyping(true);
      setDisplaySource("");
      const step = () => {
        if (cancelled) return;
        i++;
        setDisplaySource(text.slice(0, i));
        if (i < text.length) {
          timeoutId = setTimeout(step, charDelayMs);
        } else {
          setIsSourceTyping(false);
          timeoutId = setTimeout(() => {
            if (!cancelled) onDone();
          }, HOLD_AFTER_SOURCE_TYPED_MS);
        }
      };
      step();
    }

    async function run() {
      while (!cancelled) {
        const charDelay = getSourceCharDelayMs(sourceIndex, sources.length);
        const text = sources[sourceIndex % sources.length];
        await new Promise<void>((resolve) => typeSource(text, charDelay, resolve));
        sourceIndex++;
      }
    }

    run();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourcesKey]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeWord(word: string, onDone: () => void) {
      let i = 0;
      setIsTyping(true);
      setDisplayWord("");
      const step = () => {
        if (cancelled) return;
        i++;
        setDisplayWord(word.slice(0, i));
        if (i < word.length) {
          timeoutId = setTimeout(step, TYPE_CHAR_MS);
        } else {
          setIsTyping(false);
          timeoutId = setTimeout(() => {
            if (!cancelled) onDone();
          }, HOLD_AFTER_TYPED_MS);
        }
      };
      step();
    }

    async function run() {
      const phaseData = THINKING_PHASES[PHASE_INDEX[activePhase]];
      // Loop TERUS selama fase ini masih aktif -- efek ini di-retrigger tiap
      // `activePhase` berubah, jadi pindah fase beneran dikendalikan server.
      while (!cancelled) {
        const queue = buildPhaseQueue(phaseData);
        for (const word of queue) {
          if (cancelled) return;
          await new Promise<void>((resolve) => typeWord(word, resolve));
        }
      }
    }

    run();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [activePhase]);

  return { displayWord, isTyping, displaySource, isSourceTyping };
}
