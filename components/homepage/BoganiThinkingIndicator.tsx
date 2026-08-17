'use client';

import { useEffect, useState } from "react";
import MyAILogo from "./MyAILogo";
import { THINKING_PHASES, buildPhaseQueue } from "@/lib/bogani-thinking-phrases";

// Diperlambat 2x atas permintaan Boss Bayu: draf awal 32ms/900ms -> +40%
// (45ms/1260ms) -> +20% lagi dari situ (nilai final di bawah).
const TYPE_CHAR_MS = 54; // kecepatan efek ketik per karakter
const HOLD_AFTER_TYPED_MS = 1512; // jeda setelah kata selesai diketik, sebelum ganti

// Sumber ditampilkan SATU PER SATU bergantian (bukan semua sekaligus spt
// draf pertama -- terkesan datar/membosankan) -- mirip AI lain (Claude dkk)
// yg "membaca" tiap sumber sekilas satu-satu. Kecepatan berbasis POSISI
// PERSENTASE dlm satu putaran daftar sumber (bukan tick tetap/settle ke
// nilai lambat spt draf kedua, 220ms dirasa Boss Bayu terlalu lambat) --
// tiap putaran (walau daftar sumbernya pendek/panjang atau sudah diulang
// berkali-kali krn Gateway lama menjawab) SELALU terasa cepat & dinamis,
// tidak pernah menetap ke ritme lambat: 30% awal super cepat, 20%
// berikutnya paling cepat, 20% berikutnya agak lebih pelan (masih cepat),
// 30% sisanya cepat lagi.
function getSourceDelayMs(indexInCycle: number, totalSources: number): number {
  if (totalSources <= 0) return 35;
  const position = (indexInCycle % totalSources) / totalSources; // 0..1 dlm satu putaran
  if (position < 0.3) return 25;
  if (position < 0.5) return 20;
  if (position < 0.7) return 90;
  return 35;
}

type RealPhase = 'berpikir' | 'mencari_jawaban';

const PHASE_INDEX: Record<RealPhase, number> = {
  berpikir: 0,
  mencari_jawaban: 1,
};

interface BoganiThinkingIndicatorProps {
  /**
   * Fase NYATA giliran ini, dikirim server lewat event SSE `phase` (lihat
   * app/api/homepage/chat/route.ts#runChatPipeline) -- BUKAN lagi timer
   * kosmetik tetap 33/33/33 spt versi sebelumnya. null = event pertama dari
   * server belum sampai (baru mulai kirim request), dianggap "berpikir".
   */
  phase: RealPhase | null;
  /**
   * Kamus/Knowledge Base/kosakata yg BENAR-BENAR dipakai server menyusun
   * prompt giliran ini (event SSE `sources`) -- SEMUA ditampilkan apa
   * adanya, bukan cuplikan/sample, atas permintaan eksplisit Boss Bayu
   * (bukan cuma efek visual spt kompetitor -- ini sumber sungguhan).
   */
  sources: string[];
}

/**
 * Indikator "sedang berpikir" ala Claude, tapi seluruh teksnya bahasa
 * Mongondow -- lihat lib/bogani-thinking-phrases.ts utk sumber kata.
 *
 * Fase yg TAMPIL sekarang mengikuti sinyal nyata dari server (prop `phase`,
 * di-retrigger tiap event SSE `phase` masuk), bukan jadwal waktu tetap --
 * "berpikir" = server sedang menyiapkan konteks (kamus/pengetahuan/memori,
 * termasuk compacting kalau lagi kena giliran itu), "mencari_jawaban" =
 * sedang menunggu Gateway/provider AI (bagian paling lama). Fase
 * "menampilkan" TIDAK dirender di sini sama sekali -- begitu server mulai
 * kirim teks jawaban asli, komponen ini unmount otomatis (digantikan bubble
 * teks sungguhan), jadi tidak perlu kata Mongondow tersendiri utk itu.
 * Selama fase yg sama masih berlangsung (mis. Gateway lambat menjawab),
 * kata dalam fase itu diputar ulang terus -- bukan lompat ke fase lain
 * sendiri spt versi timer lama.
 */
export default function BoganiThinkingIndicator({ phase, sources }: BoganiThinkingIndicatorProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  const activePhase: RealPhase = phase ?? 'berpikir';
  const [sourceIndex, setSourceIndex] = useState(0);
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
      const phaseData = THINKING_PHASES[PHASE_INDEX[activePhase]];
      // Loop TERUS selama fase ini masih aktif -- efek ini di-retrigger tiap
      // `activePhase` berubah (lihat dependency array), jadi pindah fase
      // beneran dikendalikan server, bukan jadwal internal.
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

  return (
    <div className="flex gap-3 text-sm justify-start">
      <MyAILogo size="sm" />
      <div className="p-4 rounded-2xl bg-[#212121] border border-[#2d2d2d] rounded-tl-none text-gray-400 flex flex-col gap-2 min-w-[140px] max-w-[85%]">
        <span className="text-xs italic flex items-center gap-1">
          {displayText}
          <span className={`inline-block w-[2px] h-3 ml-0.5 bg-blue-400 align-middle ${isTyping ? "opacity-100" : "opacity-0 animate-pulse"}`} />
        </span>

        {/* Sumber sungguhan yg dipakai giliran ini (Kamus/Knowledge Base/
            kosakata) -- SEMUA ikut diputar (bukan sampel), tapi SATU PER
            SATU bergantian cepat (bukan ditumpuk sekaligus) supaya kelihatan
            AI benar-benar sedang menyusuri tiap sumber, bukan tampilan datar
            statis. key=sourceIndex memicu ulang animasi pop-in tiap ganti. */}
        {sources.length > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] leading-tight text-gray-500">
            <span className="opacity-60 shrink-0">📄</span>
            <span
              key={sourceIndex}
              className="animate-pop-up-smooth truncate max-w-[260px]"
              title={sources[sourceIndex]}
            >
              {sources[sourceIndex]}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
