import { NextRequest, NextResponse } from "next/server";
import { getKamusStats, searchKamusEntries } from "@/lib/kamus-parser";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";
  const letter = searchParams.get("letter") || "ALL";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "60", 10);

  const stats = getKamusStats();
  const searchResult = searchKamusEntries({ query, letter, page, limit });

  return NextResponse.json({
    stats,
    data: searchResult.items,
    total: searchResult.total,
    page: searchResult.page,
    totalPages: searchResult.totalPages,
  });
}
