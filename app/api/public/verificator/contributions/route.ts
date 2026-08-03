import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";
import { castContributionVote, writeAuditLog } from "@/lib/ginza-db";

export async function GET() {
  const { profile, error } = await requireProfile(["verificator", "admin"]);
  if (error) return error;
  if (!supabaseAdmin) return NextResponse.json({ contributions: [] });

  const { data, error: qErr } = await supabaseAdmin
    .from("contributions")
    .select("*, profiles:contributor_id (display_name), contribution_votes (verificator_id, vote)")
    .in("status", ["pending", "quorum_reached"])
    .order("created_at", { ascending: false });
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  return NextResponse.json({ contributions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { profile, error } = await requireProfile(["verificator", "admin"]);
  if (error) return error;

  const body = await req.json();
  const { contributionId, vote } = body as { contributionId: string; vote: "approve" | "reject" };
  if (!contributionId || !vote) return NextResponse.json({ error: "contributionId & vote wajib diisi" }, { status: 400 });

  try {
    await castContributionVote(contributionId, profile!.id, vote);
    await writeAuditLog({ actorId: profile!.id, actorRole: profile!.role, action: `contribution_vote_${vote}`, targetTable: "contributions", targetId: contributionId });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
