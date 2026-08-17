import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listDataCenterCandidates, finalizeDataCenterCandidate } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  try {
    const candidates = await listDataCenterCandidates(status);
    return NextResponse.json({ candidates });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { candidateId, approve } = body as { candidateId: string; approve: boolean };
  if (!candidateId) return NextResponse.json({ error: "candidateId wajib diisi" }, { status: 400 });

  try {
    // adminId null: sistem admin owner tunggal belum punya baris di profiles
    // (konsisten dgn pola yg sama di app/api/admin/contributions/route.ts).
    await finalizeDataCenterCandidate(candidateId, null, approve);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
