import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans flex flex-col justify-between">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-[#212330] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171821] hover:bg-[#222433] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-semibold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Page Utama</span>
          </Link>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full font-semibold">
            Pusat Pengetahuan
          </span>
        </div>

        {/* Header Content */}
        <div className="space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Knowledge Base MongondowPedia</h1>
          <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
            Pusat basis pengetahuan, arsip sejarah, dan ensiklopedia Mongondow. Halaman ini dipersiapkan dan siap untuk disesuaikan.
          </p>
        </div>

        {/* Content Box */}
        <div className="p-8 rounded-3xl bg-[#14151e] border border-[#232536] text-center space-y-4 shadow-2xl">
          <p className="text-sm font-semibold text-gray-300">
            🧠 Halaman Knowledge Base siap untuk diisi dengan materi Markdown.
          </p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Anda dapat menaruh file-file Markdown dokumentasi pengetahuan di folder <code className="text-blue-400 bg-black/40 px-2 py-0.5 rounded">data/knowledge/</code> agar mudah dipelajari oleh Bogani AI.
          </p>
        </div>
      </div>

      <footer className="text-center text-xs text-gray-600 pt-8">
        © 2026 MongondowPedia™ (Ginza Project) — Knowledge Base Module
      </footer>
    </div>
  );
}
