import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { listAksaraGlyphs, upsertAksaraGlyph, adminVerifyAksaraGlyph, getVerificatorsForGlyph, writeAuditLog } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status") ?? undefined;
  const glyphId = req.nextUrl.searchParams.get("glyphId");

  try {
    if (glyphId) {
      const verificators = await getVerificatorsForGlyph(glyphId);
      return NextResponse.json({ verificators });
    }
    const glyphs = await listAksaraGlyphs({ status });
    return NextResponse.json({ glyphs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  try {
    const glyph = await upsertAksaraGlyph(body);
    await writeAuditLog({ actorRole: "admin", action: "aksara_glyph_upsert", targetTable: "aksara_glyphs", targetId: glyph.id, afterData: glyph });
    return NextResponse.json({ glyph });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin(req);
  if (error) return error;

  const body = await req.json();
  const { glyphId, status } = body as { glyphId: string; status?: "verified" | "archived" | "draft" | "pending_review" };
  if (!glyphId) return NextResponse.json({ error: "glyphId wajib diisi" }, { status: 400 });

  try {
    await adminVerifyAksaraGlyph(glyphId, status ?? "verified");
    await writeAuditLog({ actorRole: "admin", action: "aksara_glyph_verified_by_admin", targetTable: "aksara_glyphs", targetId: glyphId, afterData: { admin: session!.email } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
