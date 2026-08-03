import { NextResponse } from "next/server";
import { listKnowledgeCategories, listKnowledgeArticles } from "@/lib/ginza-db";
import { isSupabaseReady } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseReady) {
    return NextResponse.json({ ready: false, categories: [] });
  }
  try {
    const categories = await listKnowledgeCategories();
    const activeCategories = categories.filter(c => c.is_active);
    const articles = await listKnowledgeArticles({ status: "published" });

    const withCounts = activeCategories.map(c => ({
      ...c,
      articleCount: articles.filter(a => a.category_id === c.id).length,
    }));

    return NextResponse.json({ ready: true, categories: withCounts });
  } catch (err: any) {
    return NextResponse.json({ ready: false, categories: [], message: err.message });
  }
}
