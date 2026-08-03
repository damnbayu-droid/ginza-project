/**
 * import-aksara-to-db.ts
 * Migrasi 88 suku kata Aksara Mongondow dari data/aksara/aksara_mongondow.json
 * (skema Fase 1: glyph_svg vektor, bukan lagi screenshot PNG) ke tabel
 * Supabase `aksara_glyphs`.
 *
 * PRASYARAT: jalankan dulu supabase/migrations/20260804_aksara_glyphs.sql
 * di Supabase SQL Editor project rainfqnsazraiifprkmc.
 *
 * Jalankan: npx tsx scripts/import-aksara-to-db.ts
 */
import { loadEnvLocal } from "./_load-env";
loadEnvLocal();

// Node < 22 has no native WebSocket; @supabase/supabase-js's realtime client
// requires one to exist globally even though this script never uses realtime.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = require("ws");
}

import { createClient } from "@supabase/supabase-js";
import aksaraData from "../data/aksara/aksara_mongondow.json";

interface Syllable {
  romanization: string;
  consonant: string | null;
  vowel: string | null;
  syllable_type: "vowel_a" | "vowel_e_i" | "vowel_o_u" | "final_consonant";
  glyph_image: string;
  glyph_svg: string;
  display_order: number;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local");
    process.exit(1);
  }
  const db = createClient(url, serviceKey, { auth: { persistSession: false } });
  console.log(`🔌 Terhubung ke ${url}`);

  const { error: probeErr } = await db.from("aksara_glyphs").select("id", { count: "exact", head: true });
  if (probeErr) {
    console.error("❌ Tabel aksara_glyphs belum ada:", probeErr.message);
    console.error("   Jalankan dulu supabase/migrations/20260804_aksara_glyphs.sql di Supabase SQL Editor.");
    process.exit(1);
  }

  const syllables = (aksaraData as unknown as { syllables: Syllable[] }).syllables;
  console.log(`\n📥 Mengimpor ${syllables.length} suku kata aksara (status: verified — sumber kurasi manual)...`);

  let ok = 0, failed = 0;
  for (const s of syllables) {
    const { error } = await db.from("aksara_glyphs").upsert(
      {
        romanization: s.romanization,
        consonant: s.consonant,
        vowel: s.vowel,
        syllable_type: s.syllable_type,
        glyph_svg_path: `/aksara-svg/${s.glyph_svg}`,
        glyph_image_legacy: `/aksara/${s.glyph_image}`,
        display_order: s.display_order,
        status: "verified",
        notes: "Diimpor dari data/aksara/aksara_mongondow.json (Fase 1: vektor SVG)",
      },
      { onConflict: "romanization" }
    );
    if (error) { console.warn(`   ⚠️  ${s.romanization}: ${error.message}`); failed++; } else ok++;
  }

  console.log(`\n✅ Selesai. Berhasil: ${ok}, gagal: ${failed}`);
}

main().catch(err => {
  console.error("❌ Import gagal:", err);
  process.exit(1);
});
