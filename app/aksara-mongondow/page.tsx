import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import AksaraMongondow from "@/components/AksaraMongondow";
import { listAksaraGlyphs } from "@/lib/ginza-db";
import { isSupabaseReady } from "@/lib/supabase";

export default async function AksaraMongondowPage() {
  // Status verifikasi per huruf (verified/pending_review/draft/archived) —
  // ditarik live dari aksara_glyphs supaya publik & peneliti bisa lihat mana
  // yang sudah terverifikasi vs masih perlu ditinjau. Gagal-aman ke {} kalau
  // DB belum siap (AksaraMongondow lalu menganggap semua "verified", sesuai
  // status dataset dasar Fase 1).
  let statusMap: Record<string, string> = {};
  if (isSupabaseReady) {
    try {
      const glyphs = await listAksaraGlyphs();
      statusMap = Object.fromEntries(glyphs.map((g) => [g.romanization, g.status]));
    } catch {
      statusMap = {};
    }
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-4 md:p-8 font-sans flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-[#1c1e2a] pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#14151e] hover:bg-[#1d1f2c] text-gray-300 hover:text-white border border-[#232536] text-xs font-semibold transition-all shadow-sm group"
          >
            <ArrowLeft className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Homepage</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/kamus"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14151e] hover:bg-[#1d1f2c] text-gray-300 hover:text-white border border-[#232536] text-xs font-semibold transition-all"
            >
              <span>Kamus Bahasa</span>
            </Link>
            <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
              <ScrollText className="w-3.5 h-3.5 text-blue-400" />
              Modul Aksara Mongondow
            </span>
          </div>
        </div>

        <AksaraMongondow statusMap={statusMap} />
      </div>

      <footer className="text-center text-xs text-gray-600 pt-10">
        © 2026 MongondowPedia™ (Ginza Project) — Modul Aksara Bolaang Mongondow
      </footer>
    </div>
  );
}
