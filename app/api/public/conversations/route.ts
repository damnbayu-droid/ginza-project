import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { listConversationsByUser } from "@/lib/ginza-db";

export async function GET() {
  const { profile, error } = await requireProfile();
  if (error) return error;

  try {
    const conversations = await listConversationsByUser(profile!.id);
    return NextResponse.json({ conversations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
