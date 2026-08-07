import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error || !profile) return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile.role !== "verificator" && profile.role !== "admin") {
    return NextResponse.json({ error: "Hanya Verifikator atau Admin yang dapat mengakses portal ini." }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database belum siap." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain") ?? "knowledge"; // 'knowledge' | 'kamus' | 'aksara'

  try {
    if (domain === "knowledge") {
      const { data: articles, error: err } = await supabaseAdmin
        .from("knowledge_articles")
        .select("id, title, excerpt, content, status, verification_status, verificator_notes, created_at, category_id, is_active")
        .order("created_at", { ascending: false })
        .limit(50);

      if (err) throw err;
      return NextResponse.json({ items: articles ?? [] });
    }

    if (domain === "kamus") {
      const { data: words, error: err } = await supabaseAdmin
        .from("kamus_entries")
        .select("id, word, meaning, example_sentence, status, verification_status, verificator_notes, created_at, part_of_speech, region")
        .order("created_at", { ascending: false })
        .limit(50);

      if (err) throw err;
      return NextResponse.json({ items: words ?? [] });
    }

    if (domain === "aksara") {
      const { data: aksaraItems, error: err } = await supabaseAdmin
        .from("aksara_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (err) {
        // Fallback array if table doesn't exist yet
        return NextResponse.json({ items: [] });
      }
      return NextResponse.json({ items: aksaraItems ?? [] });
    }

    return NextResponse.json({ error: "Domain tidak valid" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memuat data verifikasi" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error || !profile) return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile.role !== "verificator" && profile.role !== "admin") {
    return NextResponse.json({ error: "Hanya Verifikator atau Admin yang dapat melakukan verifikasi." }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database belum siap." }, { status: 503 });
  }

  const body = await req.json();
  const { domain, targetId, action, notes } = body as {
    domain: "knowledge" | "kamus" | "aksara";
    targetId: string;
    action: "verify" | "comment" | "reject";
    notes?: string;
  };

  if (!domain || !targetId || !action) {
    return NextResponse.json({ error: "Parameter domain, targetId, dan action wajib diisi." }, { status: 400 });
  }

  const tableMap = {
    knowledge: "knowledge_articles",
    kamus: "kamus_entries",
    aksara: "aksara_submissions",
  };

  const tableName = tableMap[domain];
  if (!tableName) return NextResponse.json({ error: "Domain tidak valid" }, { status: 400 });

  const nowIso = new Date().toISOString();

  let updatePayload: any = {};
  if (action === "verify") {
    updatePayload = {
      verification_status: "verified",
      status: "approved",
      verified_by: profile.id,
      verified_at: nowIso,
      ...(notes !== undefined ? { verificator_notes: notes } : {}),
    };
  } else if (action === "reject") {
    updatePayload = {
      verification_status: "rejected",
      status: "rejected",
      verified_by: profile.id,
      verified_at: nowIso,
      verificator_notes: notes ?? "Ditolak oleh Verifikator.",
    };
  } else if (action === "comment") {
    updatePayload = {
      verificator_notes: notes ?? "",
    };
  }

  try {
    const { error: updErr } = await supabaseAdmin.from(tableName).update(updatePayload).eq("id", targetId);
    if (updErr) throw updErr;

    // Record action log
    await supabaseAdmin.from("verificator_actions").insert({
      verificator_id: profile.id,
      target_domain: domain,
      target_id: targetId,
      action,
      notes: notes ?? null,
    }).catch(() => {});

    // Award bonus score to Verifikator (+10 pts)
    await supabaseAdmin.rpc("increment_score", { user_id: profile.id, score_delta: 10 }).catch(() => {});

    await writeAuditLog({
      actorId: profile.id,
      actorRole: profile.role,
      action: `verificator_${action}_${domain}`,
      targetTable: tableName,
      targetId,
    });

    return NextResponse.json({ success: true, action, targetId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memperbarui verifikasi" }, { status: 500 });
  }
}
