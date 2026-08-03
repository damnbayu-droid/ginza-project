import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getTopMetrics } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const [kamusSearch, kamusClick, knowledgeView, aiQuestion] = await Promise.all([
      getTopMetrics("kamus_search", 10),
      getTopMetrics("kamus_click", 10),
      getTopMetrics("knowledge_view", 10),
      getTopMetrics("ai_question", 10),
    ]);
    return NextResponse.json({ kamusSearch, kamusClick, knowledgeView, aiQuestion });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
