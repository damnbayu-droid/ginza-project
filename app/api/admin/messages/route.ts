import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { listContactMessages, updateContactMessageStatus } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;

    const messages = await listContactMessages({ status });
    return NextResponse.json({ messages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID dan status wajib diisi" }, { status: 400 });
    }

    const updated = await updateContactMessageStatus(id, status);
    return NextResponse.json({ success: true, message: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memperbarui status pesan" }, { status: 500 });
  }
}
