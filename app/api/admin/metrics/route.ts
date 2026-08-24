import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getTopMetrics, getButtonClickCounts, getChatUsageStats, type MetricsPeriod } from "@/lib/ginza-db";

const VALID_PERIODS: MetricsPeriod[] = ["day", "week", "month", "all"];

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const periodParam = req.nextUrl.searchParams.get("period");
  const period: MetricsPeriod = VALID_PERIODS.includes(periodParam as MetricsPeriod) ? (periodParam as MetricsPeriod) : "all";

  try {
    const [kamusSearch, kamusClick, knowledgeView, aiQuestion, buttonClicks, chatUsage] = await Promise.all([
      getTopMetrics("kamus_search", 10),
      getTopMetrics("kamus_click", 10),
      getTopMetrics("knowledge_view", 10),
      getTopMetrics("ai_question", 10),
      getButtonClickCounts(period),
      getChatUsageStats(period),
    ]);
    return NextResponse.json({ kamusSearch, kamusClick, knowledgeView, aiQuestion, buttonClicks, chatUsage, period });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
