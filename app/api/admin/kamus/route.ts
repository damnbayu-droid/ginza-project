import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listKamusEntries, upsertKamusEntry, adminVerifyKamusEntry, getVerificatorsForEntry, writeAuditLog } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const search = req.nextUrl.searchParams.get("search") ?? undefined;
  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const entryId = req.nextUrl.searchParams.get("entryId");

  try {
    if (entryId) {
      const verificators = await getVerificatorsForEntry(entryId);
      return NextResponse.json({ verificators });
    }
    const entries = await listKamusEntries({ search, status, limit: 500 });
    return NextResponse.json({ entries });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  try {
    const entry = await upsertKamusEntry(body);
    await writeAuditLog({ actorRole: "admin", action: "kamus_entry_upsert", targetTable: "kamus_entries", targetId: entry.id, afterData: entry });
    return NextResponse.json({ entry });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { entryId, status } = body as { entryId: string; status?: "verified" | "archived" | "draft" | "pending_review" };
  if (!entryId) return NextResponse.json({ error: "entryId wajib diisi" }, { status: 400 });

  try {
    // admin memverifikasi langsung (tanpa perlu jadi baris di profiles verifikator)
    await adminVerifyKamusEntry(entryId, status ?? "verified");
    await writeAuditLog({ actorRole: "admin", action: "kamus_entry_verified_by_admin", targetTable: "kamus_entries", targetId: entryId, afterData: { admin: session!.email } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
