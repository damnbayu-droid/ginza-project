import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/ginza-db";

export async function GET() {
  const { profile, error } = await requireProfile();
  if (error) return error;
  return NextResponse.json({ profile });
}

export async function PATCH(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error) return error;
  if (!supabaseAdmin) return NextResponse.json({ error: "DB belum siap" }, { status: 503 });

  const body = await req.json();
  const { display_name, bio, avatar_url } = body as { display_name?: string; bio?: string; avatar_url?: string };

  const updateData = {
    id: profile!.id,
    role: profile!.role,
    ...(profile!.email ? { email: profile!.email } : {}),
    ...(display_name !== undefined ? { display_name } : {}),
    ...(bio !== undefined ? { bio } : {}),
    ...(avatar_url !== undefined ? { avatar_url } : {}),
    updated_at: new Date().toISOString(),
  };

  const { error: updErr } = await supabaseAdmin
    .from("profiles")
    .upsert(updateData, { onConflict: "id" });

  if (updErr) {
    // Try updating by email if id is fallback
    if (profile!.email) {
      await supabaseAdmin.from("gw_users").update({
        ...(display_name !== undefined ? { display_name } : {}),
      }).eq("email", profile!.email);
    }
  }

  await writeAuditLog({ actorId: profile!.id, actorRole: profile!.role, action: "profile_updated", targetTable: "profiles", targetId: profile!.id });
  return NextResponse.json({ success: true, profile: { ...profile, ...updateData } });
}
