import Link from "next/link";
import { ArrowLeft, Database, BookOpenText, ScrollText } from "lucide-react";
import { listKnowledgeCategories, listKnowledgeArticles } from "@/lib/ginza-db";
import { isSupabaseReady } from "@/lib/supabase";
import ContributeCTA from "@/components/knowledge/ContributeCTA";
import KnowledgeGraphViewer from "@/components/knowledge/KnowledgeGraphViewer";

export const metadata = {
  title: "Knowledge Base MongondowPedia — Ensiklopedia Bolaang Mongondow",
  description: "Pusat pengetahuan sejarah, adat budaya, bahasa, dan seni Bolaang Mongondow — disusun komunitas & diverifikasi.",
};

export default async function KnowledgePage() {
  let categories: Awaited<ReturnType<typeof listKnowledgeCategories>> = [];
  let articleCounts = new Map<string, number>();
  let dbReady = false;

  if (isSupabaseReady) {
    try {
      const [cats, articles] = await Promise.all([
        listKnowledgeCategories(),
        listKnowledgeArticles({ status: "published" }),
      ]);
      categories = cats.filter(c => c.is_active);
      for (const a of articles) {
        articleCounts.set(a.category_id, (articleCounts.get(a.category_id) ?? 0) + 1);
      }
      dbReady = true;
    } catch {
      dbReady = false;
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        <div className="flex items-center justify-between border-b border-[#212330] pb-6">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171821] hover:bg-[#222433] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-semibold transition-all">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Page Utama</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/aksara-mongondow"
              className="px-4 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <ScrollText className="w-4 h-4 text-blue-400" />
              <span>Aksara Mongondow</span>
            </Link>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full font-semibold">
              Pusat Pengetahuan
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Database className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Knowledge Base MongondowPedia</h1>
          <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
            Ensiklopedia sejarah, adat budaya, bahasa & sastra, serta seni Bolaang Mongondow — disusun dari arsip komunitas
            dan diverifikasi verifikator MongondowPedia.
          </p>
        </div>

        {!dbReady && (
          <div className="p-6 rounded-3xl bg-[#14151e] border border-[#232536] text-sm text-gray-400">
            Kategori pengetahuan belum tersedia — database belum terhubung. Jalankan migration &amp; script import
            (<code className="text-blue-400">scripts/import-knowledge-to-db.ts</code>) dulu.
          </div>
        )}

        {dbReady && categories.length === 0 && (
          <div className="p-6 rounded-3xl bg-[#14151e] border border-[#232536] text-sm text-gray-400">
            Belum ada kategori aktif. Admin bisa menambah tab dari panel Database Knowledge.
          </div>
        )}

        {dbReady && categories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                href={`/knowledge/${cat.slug}`}
                className="p-6 rounded-3xl bg-[#14151e] hover:bg-[#191b26] border border-[#232536] hover:border-blue-500/40 transition-all shadow-xl flex flex-col gap-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <BookOpenText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">{cat.visit_count} kunjungan</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-400">{articleCounts.get(cat.id) ?? 0} artikel</p>
              </Link>
            ))}
          </div>
        )}

        {/* Visualisasi Interactive Knowledge Graphify */}
        <KnowledgeGraphViewer />

        <ContributeCTA type="knowledge" />
      </div>

      <footer className="text-center text-xs text-gray-600 pt-8">
        © 2026 MongondowPedia™ (Ginza Project) — Knowledge Base Module
      </footer>
    </div>
  );
}
