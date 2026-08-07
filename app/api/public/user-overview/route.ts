import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error || !profile) return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database belum siap." }, { status: 503 });
  }

  try {
    const [
      resArticles,
      resKnowledge,
      resConversations,
      resProfiles
    ] = await Promise.all([
      supabaseAdmin.from("user_articles").select("id").eq("author_id", profile.id),
      supabaseAdmin.from("knowledge_articles").select("id").eq("author_id", profile.id),
      supabaseAdmin.from("gw_conversations").select("id").eq("user_id", profile.id),
      supabaseAdmin.from("profiles").select("id, mongondow_score").order("mongondow_score", { ascending: false }),
    ]);

    const totalArticles = resArticles.data?.length ?? 0;
    const totalKnowledgeSubmitted = resKnowledge.data?.length ?? 0;
    const totalAiConversations = resConversations.data?.length ?? 0;

    const sortedProfiles = resProfiles.data ?? [];
    const totalUsers = sortedProfiles.length;

    // Find rank position of this profile
    const rankIndex = sortedProfiles.findIndex((p) => p.id === profile.id);
    const globalRank = rankIndex !== -1 ? rankIndex + 1 : totalUsers || 1;

    return NextResponse.json({
      totalArticles,
      totalKnowledgeSubmitted,
      totalAiConversations,
      score: profile.mongondow_score ?? 0,
      globalRank,
      totalUsers,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memuat overview pengguna" }, { status: 500 });
  }
}
