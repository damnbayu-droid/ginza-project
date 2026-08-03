import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listVerificatorApplications, reviewVerificatorApplication, writeAuditLog } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  try {
    const apps = await listVerificatorApplications(status);
    return NextResponse.json({ applications: apps });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { applicationId, approve, notes } = body as { applicationId: string; approve: boolean; notes?: string };
  if (!applicationId) return NextResponse.json({ error: "applicationId wajib diisi" }, { status: 400 });

  try {
    // reviewerId dari sesi admin tunggal — belum ada profiles row utk owner,
    // jadi disimpan sbg null + dicatat via actor_role di audit log.
    await reviewVerificatorApplication(applicationId, approve, null, notes);
    await writeAuditLog({
      actorRole: "admin",
      action: approve ? "verificator_application_approved" : "verificator_application_rejected",
      targetTable: "verificator_applications",
      targetId: applicationId,
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
