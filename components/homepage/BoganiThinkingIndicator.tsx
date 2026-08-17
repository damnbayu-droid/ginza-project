'use client';

import MyAILogo from "./MyAILogo";
import { useBoganiThinkingDisplay, type RealPhase } from "@/lib/use-bogani-thinking";

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
 * Mongondow -- lihat lib/bogani-thinking-phrases.ts utk sumber kata &
 * lib/use-bogani-thinking.ts utk logika animasi (dipakai bersama dgn
 * components/homepage/VoiceModeOverlay.tsx supaya perilakunya identik).
 *
 * Fase yg TAMPIL mengikuti sinyal nyata dari server (prop `phase`), bukan
 * jadwal waktu tetap -- "berpikir" = server sedang menyiapkan konteks
 * (kamus/pengetahuan/memori, termasuk compacting kalau lagi kena giliran
 * itu), "mencari_jawaban" = sedang menunggu Gateway/provider AI (bagian
 * paling lama). Fase "menampilkan" TIDAK dirender di sini sama sekali --
 * begitu server mulai kirim teks jawaban asli, komponen ini unmount
 * otomatis (digantikan bubble teks sungguhan).
 */
export default function BoganiThinkingIndicator({ phase, sources }: BoganiThinkingIndicatorProps) {
  const { displayWord, isTyping, currentSource } = useBoganiThinkingDisplay(phase, sources);

  return (
    <div className="flex gap-3 text-sm justify-start">
      <MyAILogo size="sm" />
      <div className="p-4 rounded-2xl bg-[#212121] border border-[#2d2d2d] rounded-tl-none text-gray-400 flex flex-col gap-2 min-w-[140px] max-w-[85%]">
        <span className="text-xs italic flex items-center gap-1">
          {displayWord}
          <span className={`inline-block w-[2px] h-3 ml-0.5 bg-blue-400 align-middle ${isTyping ? "opacity-100" : "opacity-0 animate-pulse"}`} />
        </span>

        {/* Sumber sungguhan yg dipakai giliran ini (Kamus/Knowledge Base/
            kosakata) -- SEMUA ikut diputar (bukan sampel), tapi SATU PER
            SATU bergantian cepat supaya kelihatan AI benar-benar sedang
            menyusuri tiap sumber, bukan tampilan datar statis. key=currentSource
            memicu ulang animasi pop-in tiap ganti. */}
        {currentSource && (
          <div className="flex items-center gap-1.5 text-[10px] leading-tight text-gray-500">
            <span className="opacity-60 shrink-0">📄</span>
            <span key={currentSource} className="animate-pop-up-smooth truncate max-w-[260px]" title={currentSource}>
              {currentSource}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
