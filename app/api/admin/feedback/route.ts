import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { listFeedbackSubmissions, updateFeedbackSubmissionStatus } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;

    const feedback = await listFeedbackSubmissions({ status });
    return NextResponse.json({ feedback });
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

    const updated = await updateFeedbackSubmissionStatus(id, status);
    return NextResponse.json({ success: true, feedback: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memperbarui status feedback" }, { status: 500 });
  }
}
