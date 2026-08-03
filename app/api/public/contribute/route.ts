import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { createContribution, listContributions, writeAuditLog } from "@/lib/ginza-db";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { profile, error } = await requireProfile();
  if (error) return error;
  if (!supabaseAdmin) return NextResponse.json({ contributions: [] });

  const { data, error: qErr } = await supabaseAdmin
    .from("contributions")
    .select("*")
    .eq("contributor_id", profile!.id)
    .order("created_at", { ascending: false });
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  return NextResponse.json({ contributions: data ?? [] });
}

export async function POST(req: NextRequest) {
  const { profile, error } = await requireProfile(["user", "verificator", "admin"]);
  if (error) return error;

  const body = await req.json();
  const { type, proposedData, note, targetKamusId, targetKnowledgeId } = body as {
    type: "kamus_new" | "kamus_edit" | "knowledge_new" | "knowledge_edit";
    proposedData: Record<string, unknown>;
    note?: string;
    targetKamusId?: string;
    targetKnowledgeId?: string;
  };
  if (!type || !proposedData) return NextResponse.json({ error: "type & proposedData wajib diisi" }, { status: 400 });

  try {
    const contribution = await createContribution({
      contributorId: profile!.id,
      type,
      proposedData,
      note,
      targetKamusId,
      targetKnowledgeId,
    });
    await writeAuditLog({ actorId: profile!.id, actorRole: profile!.role, action: "contribution_submitted", targetTable: "contributions", targetId: contribution.id });
    return NextResponse.json({ contribution });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
