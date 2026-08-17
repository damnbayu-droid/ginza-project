'use client';

import { useEffect, useState } from "react";
import { THINKING_PHASES, buildPhaseQueue } from "@/lib/bogani-thinking-phrases";

// Diperlambat 2x atas permintaan Boss Bayu: draf awal 32ms/900ms -> +40%
// (45ms/1260ms) -> +20% lagi dari situ (nilai final di bawah).
const TYPE_CHAR_MS = 54; // kecepatan efek ketik per karakter
const HOLD_AFTER_TYPED_MS = 1512; // jeda setelah kata selesai diketik, sebelum ganti

// Sumber ditampilkan SATU PER SATU bergantian (bukan semua sekaligus --
// terkesan datar/membosankan) -- mirip AI lain (Claude dkk) yg "membaca"
// tiap sumber sekilas satu-satu. Kecepatan berbasis POSISI PERSENTASE dlm
// satu putaran daftar sumber (bukan tick tetap/settle ke nilai lambat) --
// tiap putaran SELALU terasa cepat & dinamis, tidak pernah menetap lambat:
// 30% awal super cepat, 20% berikutnya paling cepat, 20% berikutnya agak
// lebih pelan (masih cepat), 30% sisanya cepat lagi.
function getSourceDelayMs(indexInCycle: number, totalSources: number): number {
  if (totalSources <= 0) return 35;
  const position = (indexInCycle % totalSources) / totalSources; // 0..1 dlm satu putaran
  if (position < 0.3) return 25;
  if (position < 0.5) return 20;
  if (position < 0.7) return 90;
  return 35;
}

export type RealPhase = 'berpikir' | 'mencari_jawaban';

const PHASE_INDEX: Record<RealPhase, number> = {
  berpikir: 0,
  mencari_jawaban: 1,
};

export interface BoganiThinkingDisplay {
  /** Teks kata Mongondow yg sedang "diketik" (efek ketik karakter demi karakter). */
  displayWord: string;
  /** true selagi efek ketik masih berjalan (dipakai utk kursor berkedip). */
  isTyping: boolean;
  /** Label sumber yg sedang tampil (Kamus/Knowledge/Data Percakapan), null kalau tidak ada. */
  currentSource: string | null;
}

/**
 * Hook bersama utk tampilan "sedang berpikir" Bogani AI (kata Mongondow yg
 * diketik + sumber yg dipakai, bergantian cepat) -- dipakai baik oleh
 * components/homepage/BoganiThinkingIndicator.tsx (chat teks) MAUPUN
 * components/homepage/VoiceModeOverlay.tsx (Voice Mode), supaya perilakunya
 * identik & tidak duplikat kode. `phase`/`sources` datang dari event SSE
 * server (lihat app/api/homepage/chat/route.ts#runChatPipeline) -- BUKAN
 * timer kosmetik.
 */
export function useBoganiThinkingDisplay(phase: RealPhase | null, sources: string[]): BoganiThinkingDisplay {
  const [displayWord, setDisplayWord] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [sourceIndex, setSourceIndex] = useState(0);

  const activePhase: RealPhase = phase ?? 'berpikir';
  const sourcesKey = sources.join("|");

  useEffect(() => {
    setSourceIndex(0);
    if (sources.length <= 1) return;
    let cancelled = false;
    let tick = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    function scheduleNext() {
      timeoutId = setTimeout(() => {
        if (cancelled) return;
        tick++;
        setSourceIndex((i) => (i + 1) % sources.length);
        scheduleNext();
      }, getSourceDelayMs(tick, sources.length));
    }
    scheduleNext();

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

  return {
    displayWord,
    isTyping,
    currentSource: sources.length > 0 ? sources[sourceIndex] : null,
  };
}
