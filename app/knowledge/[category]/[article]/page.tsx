import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";
import { logMetricEvent } from "@/lib/ginza-db";
import MarkdownRenderer from "@/components/knowledge/MarkdownRenderer";
import ContributeCTA from "@/components/knowledge/ContributeCTA";

interface Props { params: Promise<{ category: string; article: string }> }

export async function generateMetadata({ params }: Props) {
  const { article: slug } = await params;
  if (!supabaseAdmin) return { title: "MongondowPedia" };
  const { data } = await supabaseAdmin.from("knowledge_articles").select("title, meta_description, summary").eq("slug", slug).maybeSingle();
  if (!data) return { title: "MongondowPedia" };
  return {
    title: `${data.title} — MongondowPedia`,
    description: data.meta_description ?? data.summary ?? undefined,
  };
}

export default async function KnowledgeArticlePage({ params }: Props) {
  const { category: categorySlug, article: articleSlug } = await params;
  if (!supabaseAdmin) return notFound();

  const { data: article } = await supabaseAdmin.from("knowledge_articles").select("*").eq("slug", articleSlug).eq("status", "published").maybeSingle();
  if (!article) return notFound();

  await supabaseAdmin.from("knowledge_articles").update({ view_count: (article.view_count ?? 0) + 1 }).eq("id", article.id);
  await logMetricEvent({ type: "knowledge_view", targetId: article.id, targetText: article.title });

  return (
    <div className="min-h-screen bg-[#0d0e12] text-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <Link href={`/knowledge/${categorySlug}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171821] hover:bg-[#222433] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-semibold transition-all">
          <ArrowLeft className="w-4 h-4" /> <span>Kembali ke Kategori</span>
        </Link>

        <article className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-white">{article.title}</h1>
          {article.summary && <p className="text-sm text-gray-400">{article.summary}</p>}
          <div className="pt-4 border-t border-[#212330]">
            <MarkdownRenderer content={article.content} />
          </div>
        </article>

        <ContributeCTA type="knowledge" />
      </div>
    </div>
  );
}
