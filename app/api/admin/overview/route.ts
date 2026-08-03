import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { getOverviewStats } from "@/lib/ginza-db";
import { isSupabaseReady } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  if (!isSupabaseReady) {
    return NextResponse.json({
      dbConnected: false,
      message: "Supabase belum terkonfigurasi atau skema baru belum dijalankan.",
    });
  }

  try {
    const stats = await getOverviewStats();
    return NextResponse.json({ dbConnected: true, stats });
  } catch (err: any) {
    return NextResponse.json({
      dbConnected: false,
      message: err.message ?? "Gagal memuat statistik — tabel skema baru mungkin belum dibuat.",
    });
  }
}
