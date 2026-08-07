import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { listFoldersByUser, createFolder, renameFolder, deleteFolder } from "@/lib/ginza-db";

export async function GET() {
  const { profile, error } = await requireProfile();
  if (error) return error;

  try {
    const folders = await listFoldersByUser(profile!.id);
    return NextResponse.json({ folders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const name: string = (body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Nama folder wajib diisi" }, { status: 400 });

  try {
    const folder = await createFolder(profile!.id, name, body.color || null);
    return NextResponse.json({ folder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { id, name } = body;
  if (!id || !name) return NextResponse.json({ error: "id dan name wajib diisi" }, { status: 400 });

  try {
    await renameFolder(profile!.id, id, name);
    return NextResponse.json({ ok: true });
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
    await deleteFolder(profile!.id, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
