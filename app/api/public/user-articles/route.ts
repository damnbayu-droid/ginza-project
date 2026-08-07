import { NextRequest, NextResponse } from "next/server";
import { isSupabaseReady, supabaseAdmin } from "@/lib/supabase";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";

export async function GET(req: NextRequest) {
  try {
    const profile = await getCurrentUserProfile().catch(() => null);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isSupabaseReady && supabaseAdmin) {
      // 1. Ambil seluruh artikel publik terpublikasi untuk menghitung peringkat ranking FYP
      const { data: allArticles } = await supabaseAdmin
        .from("user_articles")
        .select("id, views_count, shares_count, likes_count, dislikes_count, article_comments(count)")
        .neq("status", "archived");

      const fypScores = (allArticles || []).map((art: any) => {
        const commentsCount = art.article_comments?.[0]?.count ?? 0;
        const score =
          art.views_count * 1 +
          art.shares_count * 3 +
          art.likes_count * 5 -
          art.dislikes_count * 4 +
          commentsCount * 2;
        return { id: art.id, score };
      });

      // Urutkan skor FYP tertinggi
      fypScores.sort((a, b) => b.score - a.score);
      const rankMap = new Map<string, number>();
      fypScores.forEach((item, index) => {
        rankMap.set(item.id, index + 1);
      });

      // 2. Ambil artikel khusus milik user ini
      const { data: userArticles, error: dbErr } = await supabaseAdmin
        .from("user_articles")
        .select("*, article_comments(count)")
        .eq("author_id", profile.id)
        .order("created_at", { ascending: false });

      if (dbErr) {
        return NextResponse.json({ error: dbErr.message }, { status: 500 });
      }

      const articlesWithStats = (userArticles || []).map((art: any) => {
        const commentsCount = art.article_comments?.[0]?.count ?? 0;
        const fypScore =
          art.views_count * 1 +
          art.shares_count * 3 +
          art.likes_count * 5 -
          art.dislikes_count * 4 +
          commentsCount * 2;

        return {
          ...art,
          comments_count: commentsCount,
          fyp_score: fypScore,
          fyp_rank: rankMap.get(art.id) ?? 99,
        };
      });

      return NextResponse.json({ articles: articlesWithStats });
    }

    return NextResponse.json({ articles: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengambil daftar artikel pengguna" }, { status: 500 });
  }
}
