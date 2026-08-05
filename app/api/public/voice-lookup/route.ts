import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Lookup publik (anonim, tanpa login) untuk rekaman suara ASLI verifikator
 * yang sudah disetujui admin -- dipakai sbg "opsi 1" pengganti TTS sintetis:
 * kalau kata/frasa yang diminta sudah pernah direkam & disetujui, kembalikan
 * URL audio-nya (diputar apa adanya oleh klien); kalau tidak ada, klien jatuh
 * ke Web Speech API seperti biasa (lihat lib/mongondow-voice.ts).
 *
 * PENTING soal keamanan: tabel voice_training_samples RLS-nya cuma izinkan
 * verifikator lihat rekaman miliknya sendiri + admin lihat semua -- TIDAK ada
 * akses publik. Endpoint ini sengaja pakai supabaseAdmin (service role, bypass
 * RLS) supaya publik BISA memutar rekaman yg approved, tapi query di bawah
 * WAJIB selalu memfilter eq("status","approved") secara eksplisit di kode --
 * RLS tidak menolong di sini karena service role melewatinya. Field yang
 * dikembalikan ke klien juga dibatasi ketat (cuma url + transkrip), tidak
 * pernah verificator_id/reviewed_by/status mentah.
 *
 * Bucket 'voice-samples' privat, audio_url yg tersimpan adalah signed URL
 * (kedaluwarsa 30 hari sejak diupload verifikator -- lihat
 * VerificatorDashboard.tsx). Supaya tidak pernah mengembalikan link basi,
 * path objek diekstrak ulang dari audio_url lalu di-signed FRESH di sini
 * (1 jam) tiap kali dipanggil, alih-alih memakai audio_url yg tersimpan
 * apa adanya.
 */

function extractStoragePath(audioUrl: string): string | null {
  // Format signed URL Supabase: .../storage/v1/object/sign/voice-samples/<path>?token=...
  const match = audioUrl.match(/\/object\/sign\/voice-samples\/([^?]+)/);
  if (match) return decodeURIComponent(match[1]);
  // Fallback: kalau bukan URL (data lama yg gagal di-sign saat upload), anggap
  // seluruh string memang sudah path objek mentah.
  if (!audioUrl.startsWith("http")) return audioUrl;
  return null;
}

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get("word")?.trim();
  if (!word || word.length > 120) {
    return NextResponse.json({ found: false });
  }
  if (!supabaseAdmin) {
    return NextResponse.json({ found: false });
  }

  // Cocokkan persis dulu (case-sensitive -- data kamus pakai huruf besar/kecil
  // & diakritik yg berarti, mis. "ḷ"/"í"), baru coba tanpa memandang huruf
  // besar/kecil sbg jaring pengaman kedua.
  let { data } = await supabaseAdmin
    .from("voice_training_samples")
    .select("audio_url, transcript, word_or_phrase")
    .eq("status", "approved")
    .eq("word_or_phrase", word)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) {
    // Escape wildcard LIKE ("%", "_") supaya kata yg kebetulan mengandungnya
    // dicocokkan literal, bukan dianggap pola.
    const escaped = word.replace(/[%_]/g, (c) => `\\${c}`);
    const ci = await supabaseAdmin
      .from("voice_training_samples")
      .select("audio_url, transcript, word_or_phrase")
      .eq("status", "approved")
      .ilike("word_or_phrase", escaped)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    data = ci.data;
  }

  if (!data?.audio_url) {
    return NextResponse.json({ found: false });
  }

  const path = extractStoragePath(data.audio_url);
  if (!path) {
    return NextResponse.json({ found: false });
  }

  const { data: signed, error: signErr } = await supabaseAdmin.storage
    .from("voice-samples")
    .createSignedUrl(path, 60 * 60);

  if (signErr || !signed?.signedUrl) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({
    found: true,
    url: signed.signedUrl,
    transcript: data.transcript ?? null,
  });
}
