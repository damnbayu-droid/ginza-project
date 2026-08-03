import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listKnowledgeCategories, listKnowledgeArticles, upsertKnowledgeArticle, upsertKnowledgeCategory, writeAuditLog } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const categoryId = req.nextUrl.searchParams.get("categoryId") ?? undefined;
  const status = req.nextUrl.searchParams.get("status") ?? undefined;

  try {
    const [categories, articles] = await Promise.all([
      listKnowledgeCategories(),
      listKnowledgeArticles({ categoryId, status }),
    ]);
    return NextResponse.json({ categories, articles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  try {
    if (body.type === "category") {
      const cat = await upsertKnowledgeCategory(body.category);
      await writeAuditLog({ actorRole: "admin", action: "knowledge_category_upsert", targetTable: "knowledge_categories", targetId: cat.id, afterData: cat });
      return NextResponse.json({ category: cat });
    }
    const article = await upsertKnowledgeArticle(body.article);
    await writeAuditLog({ actorRole: "admin", action: "knowledge_article_upsert", targetTable: "knowledge_articles", targetId: article.id, afterData: article });
    return NextResponse.json({ article });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
