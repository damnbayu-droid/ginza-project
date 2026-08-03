import { NextResponse } from "next/server";
import { getTrendingUsers } from "@/lib/ginza-db";
import { isSupabaseReady } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseReady) return NextResponse.json({ users: [] });
  try {
    const users = await getTrendingUsers(10);
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ users: [] });
  }
}
