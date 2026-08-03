import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/ginza-db";

export async function GET() {
  const { profile, error } = await requireProfile();
  if (error) return error;
  if (!supabaseAdmin) return NextResponse.json({ application: null });

  const { data } = await supabaseAdmin
    .from("verificator_applications")
    .select("*")
    .eq("user_id", profile!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({ application: data ?? null });
}

/**
 * File KTP diupload LANGSUNG dari browser ke bucket 'ktp-verifikator'
 * (lib/supabase-browser-auth.ts, RLS mengizinkan pemilik folder sendiri).
 * Endpoint ini hanya mencatat metadata setelah upload berhasil.
 */
export async function POST(req: NextRequest) {
  const { profile, error } = await requireProfile(["user", "verificator"]);
  if (error) return error;
  if (!supabaseAdmin) return NextResponse.json({ error: "DB belum siap" }, { status: 503 });

  const body = await req.json();
  const { ktpImageUrl, fullName } = body as { ktpImageUrl: string; fullName: string };
  if (!ktpImageUrl || !fullName) return NextResponse.json({ error: "ktpImageUrl & fullName wajib diisi" }, { status: 400 });

  const { data, error: insErr } = await supabaseAdmin
    .from("verificator_applications")
    .insert({ user_id: profile!.id, ktp_image_url: ktpImageUrl, full_name: fullName })
    .select()
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  await writeAuditLog({ actorId: profile!.id, actorRole: profile!.role, action: "verificator_application_submitted", targetTable: "verificator_applications", targetId: data.id });
  return NextResponse.json({ application: data });
}
