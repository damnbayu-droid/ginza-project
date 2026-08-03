import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { listKnowledgeArticles } from "@/lib/ginza-db";

interface Props { params: Promise<{ category: string }> }

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  if (!supabaseAdmin) return { title: "Knowledge — MongondowPedia" };
  const { data: cat } = await supabaseAdmin.from("knowledge_categories").select("name, description").eq("slug", category).maybeSingle();
  return {
    title: cat ? `${cat.name} — Knowledge Base MongondowPedia` : "Knowledge — MongondowPedia",
    description: cat?.description ?? `Artikel pengetahuan Bolaang Mongondow kategori ${category}.`,
  };
}

export default async function KnowledgeCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  if (!supabaseAdmin) return notFound();

  const { data: category } = await supabaseAdmin.from("knowledge_categories").select("*").eq("slug", slug).maybeSingle();
  if (!category) return notFound();

  // Catat kunjungan tab ini — dipakai utk urutan "tab terpopuler tampil duluan"
  await supabaseAdmin.from("knowledge_categories").update({ visit_count: (category.visit_count ?? 0) + 1 }).eq("id", category.id);

  const articles = await listKnowledgeArticles({ categoryId: category.id, status: "published" });

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <Link href="/knowledge" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171821] hover:bg-[#222433] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-semibold transition-all">
          <ArrowLeft className="w-4 h-4" /> <span>Kembali ke Knowledge Base</span>
        </Link>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{category.name}</h1>
          {category.description && <p className="text-sm text-gray-400 mt-2 max-w-2xl">{category.description}</p>}
        </div>

        {articles.length === 0 ? (
          <div className="p-6 rounded-3xl bg-[#14151e] border border-[#232536] text-sm text-gray-400">
            Belum ada artikel di kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {articles.map(a => (
              <Link
                key={a.id}
                href={`/knowledge/${slug}/${a.slug}`}
                className="p-5 rounded-2xl bg-[#14151e] hover:bg-[#191b26] border border-[#232536] hover:border-blue-500/40 transition-all flex flex-col gap-2 group"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">{a.title}</h3>
                {a.summary && <p className="text-xs text-gray-400 line-clamp-2">{a.summary}</p>}
                <span className="text-[10px] text-gray-500 mt-1">{a.view_count} dibaca</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
