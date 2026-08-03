import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listContributions, finalizeContribution } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  try {
    const contributions = await listContributions(status);
    return NextResponse.json({ contributions });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { contributionId, approve } = body as { contributionId: string; approve: boolean };
  if (!contributionId) return NextResponse.json({ error: "contributionId wajib diisi" }, { status: 400 });

  try {
    // adminId null: sistem admin owner tunggal belum punya baris di profiles
    // (lihat catatan yang sama di app/api/admin/verificators/route.ts).
    await finalizeContribution(contributionId, null, approve);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
