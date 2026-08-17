import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { callGateway } from "@/app/api/homepage/chat/route";

/**
 * Job harian "AI Farming Knowledge" (permintaan Boss Bayu, 2026-08-18):
 * baca giliran chat baru (gw_data_center, source_type "chat_memory_fact",
 * disimpan tiap giliran lewat syncToDataCenter() di app/api/homepage/chat/route.ts),
 * pakai 1 panggilan AI murah utk MENYARING mana yg genuinely berisi calon
 * fakta baru (terutama saat AI sendiri mengaku tidak tahu) supaya HANYA itu
 * yg masuk antrean review verifikator -- bukan membanjiri mereka dgn semua
 * giliran chat (banyak dari itu cuma sapaan/obrolan biasa). Baris yg TIDAK
 * menarik ditandai selesai diproses tanpa perlu ditinjau manusia sama sekali.
 *
 * Baris yg lolos jadi "manual_review_required = true" langsung bisa dipakai
 * AI menjawab (lewat getConversationDataContext() di homepage/chat/route.ts,
 * SELALU dilabeli "belum terverifikasi") -- TIDAK menunggu verifikator, sesuai
 * keputusan eksplisit Boss Bayu (verifikator situs ini kewalahan/lansia,
 * gerbang wajib-review dulu akan bikin fitur ini nyaris tak pernah kepakai).
 * Verifikator tetap bisa approve/reject belakangan lewat panel admin
 * (components/dashboard/panels/DataCenterPanel.tsx) kapan pun sempat --
 * itu jalur PENGUATAN, bukan gerbang wajib.
 */

const BATCH_SIZE = 80;
const RAW_TEXT_TRUNCATE = 500;

export const maxDuration = 60;

interface ExtractionVerdict {
  index: number;
  interesting: boolean;
  candidateFact?: string;
  suggestedCategory?: string;
  confidence?: number;
}

function buildExtractionPrompt(rows: { id: string; raw_text: string }[]): string {
  const numbered = rows
    .map((r, i) => `[${i}] ${(r.raw_text || "").slice(0, RAW_TEXT_TRUNCATE)}`)
    .join("\n\n");

  return `[TUGAS INTERNAL: TRIASE PENGETAHUAN -- BUKAN PERTANYAAN DARI USER]
Anda BUKAN sedang menjawab pengguna. Anda sedang meninjau kutipan giliran chat MongondowPedia (Bogani AI) di bawah, satu per satu, untuk menentukan mana yang berisi CALON FAKTA BARU yang layak ditinjau manusia (verifikator) untuk ditambahkan ke Knowledge Base/Kamus resmi -- terutama giliran di mana Bogani AI SENDIRI mengaku tidak tahu/tidak punya data (itu petunjuk kuat ada celah pengetahuan).

BUKAN calon fakta baru (interesting: false): sapaan, obrolan basa-basi, pertanyaan yang sudah dijawab lengkap & yakin dari Kamus/Knowledge Base yang sudah ada, atau permintaan yang tidak mengandung informasi faktual apa pun.

ADALAH calon fakta baru (interesting: true): nama orang/tempat/jabatan spesifik yang disebut tapi Bogani AI mengaku tidak tahu, koreksi/tambahan info yang diberikan pengguna sendiri, atau topik faktual yang jelas belum tercakup Knowledge Base.

Giliran yang perlu ditinjau (diberi nomor indeks):
${numbered}

Balas HANYA dengan JSON array (tanpa markdown code fence, tanpa komentar), satu objek per giliran, urut sesuai indeks aslinya:
[{"index": 0, "interesting": true, "candidateFact": "ringkasan singkat calon fakta dalam Bahasa Indonesia, netral, maks 200 karakter", "suggestedCategory": "kamus|knowledge|lainnya", "confidence": 0.0-1.0}, ...]
Untuk giliran yang interesting:false, cukup {"index": N, "interesting": false} -- field lain boleh dikosongkan.`;
}

function parseExtractionResponse(text: string): ExtractionVerdict[] | null {
  try {
    const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((v) => typeof v?.index === "number" && typeof v?.interesting === "boolean");
  } catch {
    return null;
  }
}

async function exportDailySnapshot(rows: unknown[]): Promise<string | null> {
  if (!supabaseAdmin || rows.length === 0) return null;
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const path = `knowledge-farming-exports/${today}.json`;
    const buffer = Buffer.from(JSON.stringify(rows, null, 2), "utf-8");
    const { error } = await supabaseAdmin.storage
      .from("data-center-files")
      .upload(path, buffer, { contentType: "application/json", cacheControl: "3600", upsert: true });
    if (error) {
      console.warn("[extract-knowledge] Storage export failed:", error.message);
      return null;
    }
    return path;
  } catch (e) {
    console.warn("[extract-knowledge] Storage export error:", e);
    return null;
  }
}

export async function GET(req: NextRequest) {
  // Pola standar Vercel Cron: header Authorization: Bearer $CRON_SECRET
  // otomatis disertakan Vercel di tiap pemicu terjadwal (lihat vercel.json).
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET;
  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase belum dikonfigurasi" }, { status: 503 });
  }

  const { data: candidates, error: fetchError } = await supabaseAdmin
    .from("gw_data_center")
    .select("id, raw_text, extracted_data")
    .eq("source_type", "chat_memory_fact")
    .eq("manual_review_required", false)
    .eq("review_status", "pending")
    .order("created_at", { ascending: true })
    .limit(500); // ambil lebih banyak drpd BATCH_SIZE, filter yg belum diproses cron dulu di JS

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const unprocessed = (candidates || [])
    .filter((r) => !(r.extracted_data as Record<string, unknown> | null)?.cron_reviewed)
    .slice(0, BATCH_SIZE);

  if (unprocessed.length === 0) {
    return NextResponse.json({ processed: 0, promoted: 0, message: "Tidak ada giliran baru utk ditriase." });
  }

  const prompt = buildExtractionPrompt(unprocessed.map((r) => ({ id: r.id, raw_text: r.raw_text || "" })));
  const result = await callGateway(req, prompt, undefined);
  const verdicts = result?.text ? parseExtractionResponse(result.text) : null;

  if (!verdicts) {
    // Gagal mengurai -- JANGAN tandai apa pun sbg terproses, coba lagi besok
    // dgn baris yg sama (masih "pending" & belum cron_reviewed).
    console.warn("[extract-knowledge] Gagal parse respons AI, tidak ada baris ditandai. raw:", result?.text?.slice(0, 300));
    return NextResponse.json({ processed: 0, promoted: 0, error: "Gagal mengurai respons AI, akan dicoba lagi besok." }, { status: 200 });
  }

  let promoted = 0;
  for (const verdict of verdicts) {
    const row = unprocessed[verdict.index];
    if (!row) continue;
    const baseExtracted = (row.extracted_data as Record<string, unknown>) || {};

    if (verdict.interesting) {
      promoted++;
      await supabaseAdmin
        .from("gw_data_center")
        .update({
          manual_review_required: true,
          confidence_score: typeof verdict.confidence === "number" ? verdict.confidence : null,
          extracted_data: {
            ...baseExtracted,
            cron_reviewed: true,
            candidate_fact: verdict.candidateFact || null,
            suggested_category: verdict.suggestedCategory || null,
          },
        })
        .eq("id", row.id);
    } else {
      await supabaseAdmin
        .from("gw_data_center")
        .update({ extracted_data: { ...baseExtracted, cron_reviewed: true } })
        .eq("id", row.id);
    }
  }

  const exportPath = await exportDailySnapshot(unprocessed);

  return NextResponse.json({
    processed: unprocessed.length,
    promoted,
    exportPath,
  });
}
