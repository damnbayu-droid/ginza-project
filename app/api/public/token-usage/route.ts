import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { getTokenUsageByUser } from "@/lib/ginza-db";

export async function GET() {
  const { profile, error } = await requireProfile();
  if (error) return error;

  try {
    const usage = await getTokenUsageByUser(profile!.id, 100);
    const totalTokens = usage.reduce((sum: number, u: any) => sum + (u.tokens_used ?? 0), 0);
    return NextResponse.json({ usage, totalTokens });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
