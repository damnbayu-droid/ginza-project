import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listVoiceSamplesForAdmin, reviewVoiceSample, writeAuditLog } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  try {
    const samples = await listVoiceSamplesForAdmin(status);
    return NextResponse.json({ samples });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { sampleId, approve } = body as { sampleId: string; approve: boolean };
  if (!sampleId) return NextResponse.json({ error: "sampleId wajib diisi" }, { status: 400 });

  try {
    // reviewerId null — sama pola dgn verificator_applications: single owner-admin
    // belum punya profiles row/UUID.
    await reviewVoiceSample(sampleId, approve, null);
    await writeAuditLog({
      actorRole: "admin",
      action: approve ? "voice_sample_approved" : "voice_sample_rejected",
      targetTable: "voice_training_samples",
      targetId: sampleId,
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
