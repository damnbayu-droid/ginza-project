import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { profile, error } = await requireProfile();
  if (error || !profile) return error ?? NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (profile.role !== "verificator" && profile.role !== "admin") {
    return NextResponse.json({ error: "Hanya Verifikator atau Admin yang dapat mengakses data ini." }, { status: 403 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Database belum siap." }, { status: 503 });
  }

  try {
    const [
      resKnw,
      resKamus,
      resAksara,
      resActions
    ] = await Promise.all([
      supabaseAdmin.from("knowledge_articles").select("id, verification_status, status"),
      supabaseAdmin.from("kamus_entries").select("id, verification_status, status"),
      supabaseAdmin.from("aksara_submissions").select("id, verification_status, status"),
      supabaseAdmin.from("verificator_actions").select("id, action").eq("verificator_id", profile.id),
    ]);

    const knw = resKnw.data ?? [];
    const knwVerified = knw.filter((i) => i.verification_status === "verified" || i.status === "published").length;
    const knwPending = knw.length - knwVerified;

    const kamus = resKamus.data ?? [];
    const kamusVerified = kamus.filter((i) => i.verification_status === "verified" || i.status === "approved").length;
    const kamusPending = kamus.length - kamusVerified;

    const aksara = resAksara.data ?? [];
    const aksaraVerified = aksara.filter((i) => i.verification_status === "verified" || i.status === "approved").length;
    const aksaraPending = aksara.length - aksaraVerified;

    const actions = resActions.data ?? [];
    const verifiedActionsCount = actions.filter((a) => a.action === "verify").length;
    const commentedActionsCount = actions.filter((a) => a.action === "comment").length;
    const rejectedActionsCount = actions.filter((a) => a.action === "reject").length;

    return NextResponse.json({
      knowledge: { total: knw.length, verified: knwVerified, pending: knwPending },
      kamus: { total: kamus.length, verified: kamusVerified, pending: kamusPending },
      aksara: { total: aksara.length, verified: aksaraVerified, pending: aksaraPending },
      actions: {
        total: actions.length,
        verified: verifiedActionsCount,
        commented: commentedActionsCount,
        rejected: rejectedActionsCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memuat overview verifikator" }, { status: 500 });
  }
}
