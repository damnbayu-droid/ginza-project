'use client';

import Link from "next/link";
import { ArrowLeft, ScrollText } from "lucide-react";
import AksaraMongondow from "@/components/AksaraMongondow";

export default function AksaraMongondowPage() {
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

        <AksaraMongondow />
      </div>

      <footer className="text-center text-xs text-gray-600 pt-10">
        © 2026 MongondowPedia™ (Ginza Project) — Modul Aksara Bolaang Mongondow
      </footer>
    </div>
  );
}
