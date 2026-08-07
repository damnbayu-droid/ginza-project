import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import {
  listConversationsByUser,
  saveConversation,
  deleteConversation,
  moveConversationToFolder,
  renameConversation,
} from "@/lib/ginza-db";

// GET /api/public/conversations           -> semua obrolan user (semua folder)
// GET /api/public/conversations?folder=X  -> obrolan di folder X
// GET /api/public/conversations?folder=null -> obrolan tanpa folder
export async function GET(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error) return error;

  const folderParam = req.nextUrl.searchParams.get("folder");
  const folderId = folderParam === null ? undefined : folderParam === "null" ? null : folderParam;

  try {
    const conversations = await listConversationsByUser(profile!.id, folderId);
    return NextResponse.json({ conversations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST -> buat/update obrolan (dipakai sinkronisasi dari client, terpisah
// dari logChatTurn fire-and-forget di app/api/homepage/chat/route.ts supaya
// client bisa dapat id percakapan yang pasti sebelum giliran chat berikutnya).
export async function POST(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { id, title, messages } = body;
  if (!title || !Array.isArray(messages)) {
    return NextResponse.json({ error: "title dan messages wajib diisi" }, { status: 400 });
  }

  try {
    const conversationId = await saveConversation(profile!.id, id || undefined, title, messages);
    return NextResponse.json({ id: conversationId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH -> pindahkan obrolan ke folder lain, atau ganti judul
export async function PATCH(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const { id, folderId, title } = body;
  if (!id) return NextResponse.json({ error: "id wajib diisi" }, { status: 400 });

  try {
    if (folderId !== undefined) {
      await moveConversationToFolder(profile!.id, id, folderId);
    }
    if (typeof title === "string" && title.trim()) {
      await renameConversation(profile!.id, id, title);
    }
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
    await deleteConversation(profile!.id, id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
