'use client';

import { useEffect, useState } from "react";
import MyAILogo from "./MyAILogo";
import { THINKING_PHASES, buildPhaseQueue, randomVarietyWord } from "@/lib/bogani-thinking-phrases";

// Diperlambat 2x atas permintaan Boss Bayu: draf awal 32ms/900ms -> +40%
// (45ms/1260ms) -> +20% lagi dari situ (nilai final di bawah).
const TYPE_CHAR_MS = 54; // kecepatan efek ketik per karakter
const HOLD_AFTER_TYPED_MS = 1512; // jeda setelah kata selesai diketik, sebelum ganti

/**
 * Indikator "sedang berpikir" ala Claude, tapi seluruh teksnya bahasa
 * Mongondow -- lihat lib/bogani-thinking-phrases.ts utk sumber kata &
 * catatan kenapa gaya visual (bukan progres nyata dari server).
 *
 * 3 fase berjalan otomatis via timer (Berpikir -> Mencari Jawaban ->
 * Menampilkan Jawaban). Kalau jawaban asli lebih lama dari total animasi,
 * fase terakhir loop terus (kata acak, bukan kata penutup) sampai unmount.
 */
export default function BoganiThinkingIndicator() {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function typeWord(word: string, onDone: () => void) {
      let i = 0;
      setIsTyping(true);
      setDisplayText("");
      const step = () => {
        if (cancelled) return;
        i++;
        setDisplayText(word.slice(0, i));
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
      for (let p = 0; p < THINKING_PHASES.length && !cancelled; p++) {
        const queue = buildPhaseQueue(THINKING_PHASES[p]);
        for (const word of queue) {
          if (cancelled) return;
          await new Promise<void>((resolve) => typeWord(word, resolve));
        }
      }
      // Jawaban asli ternyata lebih lama dari total animasi 3 fase --
      // tetap di fase terakhir (kata acak, bukan kata penutup) sampai
      // komponen ini unmount (jawaban nyata sudah datang).
      while (!cancelled) {
        await new Promise<void>((resolve) => typeWord(randomVarietyWord(), resolve));
      }
    }

    run();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex gap-3 text-sm justify-start">
      <MyAILogo size="sm" />
      <div className="p-4 rounded-2xl bg-[#212121] border border-[#2d2d2d] rounded-tl-none text-gray-400 flex items-center gap-1 min-w-[140px]">
        <span className="text-xs italic">
          {displayText}
          <span className={`inline-block w-[2px] h-3 ml-0.5 bg-blue-400 align-middle ${isTyping ? "opacity-100" : "opacity-0 animate-pulse"}`} />
        </span>
      </div>
    </div>
  );
}
