/**
 * import-kamus-to-db.ts
 * Migrasi data Kamus dari file (kamus/*.md, data/kamus/*.md, featured cards)
 * ke tabel Supabase `kamus_entries`.
 *
 * PRASYARAT: jalankan dulu
 *   supabase/migrations/20260803_ginza_platform_schema.sql
 * di Supabase SQL Editor project rainfqnsazraiifprkmc — tabel ini script
 * akan gagal kalau kamus_entries belum ada.
 *
 * Jalankan: npx tsx scripts/import-kamus-to-db.ts
 */
import { loadEnvLocal } from "./_load-env";
loadEnvLocal();

// Node < 22 has no native WebSocket; @supabase/supabase-js's realtime client
// requires one to exist globally even though this script never uses realtime.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = require("ws");
}

import { createClient } from "@supabase/supabase-js";
import { getIndexedKamusEntries, getFeaturedSiderCards } from "../lib/kamus-parser";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local");
    process.exit(1);
  }

  const db = createClient(url, serviceKey, { auth: { persistSession: false } });

  console.log(`🔌 Terhubung ke ${url}`);

  // Cek tabel sudah ada
  const { error: probeErr } = await db.from("kamus_entries").select("id", { count: "exact", head: true });
  if (probeErr) {
    console.error("❌ Tabel kamus_entries belum ada / bermasalah:", probeErr.message);
    console.error("   Jalankan dulu migration SQL di Supabase SQL Editor, lalu ulangi script ini.");
    process.exit(1);
  }

  // 1) Featured Sider cards (sudah punya definisi kaya: fonetik, makna, contoh, aksara)
  const featured = getFeaturedSiderCards();
  console.log(`\n📥 Mengimpor ${featured.length} kata unggulan (featured cards)...`);
  let ok = 0, failed = 0;

  for (const card of featured) {
    const { error } = await db.from("kamus_entries").upsert(
      {
        word: card.word,
        phonetic: card.phonetic,
        origin: card.origin,
        meaning: card.meaning,
        example: card.example,
        aksara_breakdown: card.aksara,
        category: card.tag ?? null,
        status: "verified", // sudah dikurasi manual sebelumnya
        source_note: "Featured Sider card (migrasi awal)",
      },
      { onConflict: "word" }
    );
    if (error) { console.warn(`   ⚠️  ${card.word}: ${error.message}`); failed++; } else ok++;
  }

  // 2) Semua kata terindeks dari kamus/*.md + data/kamus/*.md (mentah, belum diverifikasi)
  const allEntries = getIndexedKamusEntries(true);
  const featuredWords = new Set(featured.map(f => f.word.toLowerCase()));
  const rest = allEntries.filter(e => !featuredWords.has(e.word.toLowerCase()));

  console.log(`\n📥 Mengimpor ${rest.length} kata mentah lainnya (status: draft, menunggu verifikasi)...`);

  const BATCH = 200;
  for (let i = 0; i < rest.length; i += BATCH) {
    const batch = rest.slice(i, i + BATCH).map(e => ({
      word: e.word,
      status: "draft" as const,
      source_note: `Diimpor otomatis dari ${e.sourceFile}`,
    }));
    const { error } = await db.from("kamus_entries").upsert(batch, { onConflict: "word" });
    if (error) { console.warn(`   ⚠️  Batch ${i}-${i + BATCH}: ${error.message}`); failed += batch.length; }
    else ok += batch.length;
    process.stdout.write(`\r   ...${Math.min(i + BATCH, rest.length)}/${rest.length}`);
  }

  console.log(`\n\n✅ Selesai. Berhasil: ${ok}, gagal: ${failed}`);
  console.log("   Kata 'draft' perlu direview & diverifikasi verifikator/admin lewat panel Database Kamus.");
}

main().catch(err => {
  console.error("❌ Import gagal:", err);
  process.exit(1);
});
