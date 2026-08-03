import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/ginza-db";

export async function GET() {
  const { profile, error } = await requireProfile(["verificator", "admin"]);
  if (error) return error;
  if (!supabaseAdmin) return NextResponse.json({ samples: [] });

  const { data, error: qErr } = await supabaseAdmin
    .from("voice_training_samples")
    .select("*")
    .eq("verificator_id", profile!.id)
    .order("created_at", { ascending: false });
  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });
  return NextResponse.json({ samples: data ?? [] });
}

/**
 * File audio diupload LANGSUNG dari browser ke bucket 'voice-samples'.
 * Endpoint ini hanya mencatat metadata setelah upload berhasil.
 */
export async function POST(req: NextRequest) {
  const { profile, error } = await requireProfile(["verificator", "admin"]);
  if (error) return error;
  if (!supabaseAdmin) return NextResponse.json({ error: "DB belum siap" }, { status: 503 });

  const body = await req.json();
  const { wordOrPhrase, audioUrl, transcript } = body as { wordOrPhrase: string; audioUrl: string; transcript?: string };
  if (!wordOrPhrase || !audioUrl) return NextResponse.json({ error: "wordOrPhrase & audioUrl wajib diisi" }, { status: 400 });

  const { data, error: insErr } = await supabaseAdmin
    .from("voice_training_samples")
    .insert({ verificator_id: profile!.id, word_or_phrase: wordOrPhrase, audio_url: audioUrl, transcript: transcript ?? null })
    .select()
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  await writeAuditLog({ actorId: profile!.id, actorRole: profile!.role, action: "voice_sample_submitted", targetTable: "voice_training_samples", targetId: data.id });
  return NextResponse.json({ sample: data });
}
