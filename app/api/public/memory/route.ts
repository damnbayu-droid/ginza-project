import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { listUserMemory, deleteUserMemory, upsertUserMemory } from "@/lib/ginza-db";

// GET -> daftar memori yang Bogani AI simpan ttg user ini (utk ditampilkan
// di panel Settings, biar transparan & bisa dihapus user kapan saja).
export async function GET() {
  const { profile, error } = await requireProfile();
  if (error) return error;

  try {
    const memory = await listUserMemory(profile!.id);
    return NextResponse.json({ memory });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST -> tambah memori manual (mis. user ketik "ingat: aku suka kopi pahit")
export async function POST(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const content: string = (body.content || "").trim();
  if (!content) return NextResponse.json({ error: "content wajib diisi" }, { status: 400 });

  try {
    const id = await upsertUserMemory(profile!.id, content, body.category || "general");
    return NextResponse.json({ id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error) return error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  try {
    await deleteUserMemory(profile!.id, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
