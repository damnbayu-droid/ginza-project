import { NextRequest, NextResponse } from "next/server";
import { requireProfile } from "@/lib/supabase-auth-server";
import { supabaseAdmin } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/ginza-db";
import { checkFaceCaptureSet } from "@/lib/ai-vision-check";

/** Ambil bytes dari signed URL (bucket privat) & ubah jadi data URL base64 utk dikirim ke provider vision. */
async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

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
  const {
    applicantType = "warga_bmr",
    ktpImageUrl,
    fullName,
    institutionName,
    credentialUrl,
    expertise,
    faceFrontUrl,
    faceLeftUrl,
    faceRightUrl,
    consentGiven,
  } = body as {
    applicantType?: "warga_bmr" | "peneliti_eksternal";
    ktpImageUrl?: string;
    fullName: string;
    institutionName?: string;
    credentialUrl?: string;
    expertise?: string[];
    faceFrontUrl?: string;
    faceLeftUrl?: string;
    faceRightUrl?: string;
    consentGiven?: boolean;
  };

  if (!fullName) return NextResponse.json({ error: "fullName wajib diisi" }, { status: 400 });

  if (applicantType === "peneliti_eksternal") {
    if (!institutionName || !credentialUrl) {
      return NextResponse.json(
        { error: "institutionName & credentialUrl wajib diisi untuk jalur peneliti eksternal" },
        { status: 400 }
      );
    }
  } else if (!ktpImageUrl) {
    return NextResponse.json({ error: "ktpImageUrl wajib diisi untuk jalur warga BMR" }, { status: 400 });
  }

  // Foto wajah (depan/kiri/kanan) & konsen WAJIB utk semua jalur pendaftaran
  // baru — arahan Boss Bayu 2026-08-05. Ditegakkan di sini (bukan constraint
  // DB) supaya tidak merusak baris lama yang mungkin sudah ada.
  if (!faceFrontUrl || !faceLeftUrl || !faceRightUrl) {
    return NextResponse.json({ error: "Foto wajah depan, kiri, dan kanan wajib diisi" }, { status: 400 });
  }
  if (!consentGiven) {
    return NextResponse.json({ error: "Persetujuan penyimpanan foto wajah wajib dicentang" }, { status: 400 });
  }

  // Saringan AI awal (sinyal bantu, bukan gerbang otomatis) — tidak
  // memblokir pendaftaran apa pun hasilnya; admin tetap yang memutuskan.
  let aiStatus: "pending" | "passed" | "flagged" | "skipped" | "error" = "pending";
  let aiNotes = "";
  try {
    const [frontData, leftData, rightData] = await Promise.all([
      urlToDataUrl(faceFrontUrl),
      urlToDataUrl(faceLeftUrl),
      urlToDataUrl(faceRightUrl),
    ]);
    if (frontData && leftData && rightData) {
      const result = await checkFaceCaptureSet({ front: frontData, left: leftData, right: rightData });
      aiStatus = result.status;
      aiNotes = result.notes;
    } else {
      aiStatus = "error";
      aiNotes = "Gagal mengambil salah satu foto dari storage utk dicek AI.";
    }
  } catch (err: any) {
    aiStatus = "error";
    aiNotes = err?.message || "Kesalahan tak terduga saat menjalankan saringan AI.";
  }

  const { data, error: insErr } = await supabaseAdmin
    .from("verificator_applications")
    .insert({
      user_id: profile!.id,
      applicant_type: applicantType,
      ktp_image_url: ktpImageUrl ?? null,
      full_name: fullName,
      institution_name: institutionName ?? null,
      credential_url: credentialUrl ?? null,
      expertise: Array.isArray(expertise) ? expertise : [],
      face_front_url: faceFrontUrl,
      face_left_url: faceLeftUrl,
      face_right_url: faceRightUrl,
      consent_given_at: new Date().toISOString(),
      ai_face_check_status: aiStatus,
      ai_face_check_notes: aiNotes,
    })
    .select()
    .single();
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  await writeAuditLog({ actorId: profile!.id, actorRole: profile!.role, action: "verificator_application_submitted", targetTable: "verificator_applications", targetId: data.id });
  return NextResponse.json({ application: data });
}
