import { NextRequest, NextResponse } from "next/server";
import { getKamusStats, searchKamusEntries, getFeaturedSiderCards, type KamusEntry } from "@/lib/kamus-parser";
import { listKamusEntries, logMetricEvent } from "@/lib/ginza-db";
import { isSupabaseReady } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";
  const letter = searchParams.get("letter") || "ALL";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "60", 10);

  // Kata yang sudah terverifikasi & tersimpan di Supabase (kontribusi user yang
  // sudah di-approve, atau input admin) ikut muncul di indeks — bukan cuma
  // kata dari file .md di git repo.
  let extraEntries: KamusEntry[] = [];
  if (isSupabaseReady) {
    try {
      const dbEntries = await listKamusEntries({ status: "verified", limit: 5000 });
      extraEntries = dbEntries.map(e => ({
        word: e.word,
        firstLetter: /[A-Za-z]/.test(e.word[0]) ? e.word[0].toUpperCase() : "#",
        sourceFile: "Database (kontribusi terverifikasi)",
      }));
    } catch {
      // DB belum siap / skema belum dijalankan — diamkan, fallback ke file saja
    }
  }

  const stats = getKamusStats(false, extraEntries);
  const searchResult = searchKamusEntries({ query, letter, page, limit, extraEntries });
  const featuredCards = getFeaturedSiderCards();

  if (query.trim() && isSupabaseReady) {
    logMetricEvent({ type: "kamus_search", targetText: query.trim() }).catch(() => {});
  }

  return NextResponse.json({
    stats,
    featuredCards,
    data: searchResult.items,
    total: searchResult.total,
    page: searchResult.page,
    totalPages: searchResult.totalPages,
  });
}
