import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listInstantReplies, upsertInstantReply, deleteInstantReply, writeAuditLog } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const rows = await listInstantReplies();
    return NextResponse.json({ replies: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { id, label, trigger_keywords, reply_variants, is_active, sort_order } = body as {
    id?: string;
    label?: string;
    trigger_keywords?: string[];
    reply_variants?: string[];
    is_active?: boolean;
    sort_order?: number;
  };

  if (!label || !Array.isArray(trigger_keywords) || !Array.isArray(reply_variants)) {
    return NextResponse.json({ error: "label, trigger_keywords, dan reply_variants wajib diisi" }, { status: 400 });
  }
  if (trigger_keywords.filter((k) => k.trim()).length === 0) {
    return NextResponse.json({ error: "Minimal 1 kata pemicu (trigger keyword) wajib diisi" }, { status: 400 });
  }
  if (reply_variants.filter((r) => r.trim()).length === 0) {
    return NextResponse.json({ error: "Minimal 1 varian jawaban wajib diisi" }, { status: 400 });
  }

  try {
    const saved = await upsertInstantReply({ id, label, trigger_keywords, reply_variants, is_active, sort_order });
    await writeAuditLog({
      actorRole: "admin",
      action: id ? "instant_reply_updated" : "instant_reply_created",
      targetTable: "bogani_instant_replies",
      targetId: saved.id,
      afterData: saved,
    });
    return NextResponse.json({ reply: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  try {
    await deleteInstantReply(id);
    await writeAuditLog({ actorRole: "admin", action: "instant_reply_deleted", targetTable: "bogani_instant_replies", targetId: id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
