/**
 * import-knowledge-to-db.ts
 * Migrasi artikel Knowledge dari file (.md) ke tabel Supabase
 * `knowledge_categories` + `knowledge_articles`.
 *
 * PRASYARAT: jalankan dulu supabase/migrations/20260803_ginza_platform_schema.sql
 * di Supabase SQL Editor project rainfqnsazraiifprkmc.
 *
 * Jalankan: npx tsx scripts/import-knowledge-to-db.ts
 */
import { loadEnvLocal } from "./_load-env";
loadEnvLocal();

// Node < 22 has no native WebSocket; @supabase/supabase-js's realtime client
// requires one to exist globally even though this script never uses realtime.
if (!globalThis.WebSocket) {
  globalThis.WebSocket = require("ws");
}

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Kategori tambahan di luar 6 yang sudah di-seed migration (admin tetap bebas
// menambah/mengubah lewat panel Database Knowledge nanti — ini hanya starting point).
const EXTRA_CATEGORIES: { slug: string; name: string; order: number }[] = [
  { slug: "adat-budaya", name: "Adat & Budaya", order: 15 },
  { slug: "bahasa-sastra", name: "Bahasa & Sastra", order: 25 },
  { slug: "aksara-naskah", name: "Aksara & Naskah", order: 35 },
  { slug: "pidato-bahasa-mongondow", name: "Pidato Bahasa Mongondow", order: 45 },
];

// file utama (root knowledge/) — sudah tersintesis rapi, layak "published"
const CURATED_FILES: { file: string; categorySlug: string; title?: string }[] = [
  { file: "Sejarah_Bolaang_Mongondow.md", categorySlug: "sejarah" },
  { file: "Adat_dan_Budaya_Mongondow.md", categorySlug: "adat-budaya" },
  { file: "Bahasa_dan_Sastra_Mongondow.md", categorySlug: "bahasa-sastra" },
  { file: "Bahasa_Mongondow_Kuno_Acuan_Utama.md", categorySlug: "bahasa-sastra" },
  { file: "Aksara_Bolaang_Mongondow.md", categorySlug: "aksara-naskah" },
  { file: "Pidato_Peran_PKK_Kon_Pembangunan.md", categorySlug: "pidato-bahasa-mongondow" },
  { file: "Pidato_Peran_Masyarakat_Kon_Pombanganan_Lipu.md", categorySlug: "pidato-bahasa-mongondow" },
];

// arsip_download/*.md — teks mentah/OCR, masuk sbg "pending_review" (belum
// tampil publik) supaya admin/verifikator kurasi dulu sebelum dipublikasikan.
const ARSIP_MAP: Record<string, string> = {
  "01_wh_questions_mongondow.md": "edukasi",
  "02_distribusi_konsonan_pendahuluan.md": "bahasa-sastra",
  "03_adat_istiadat_bolaang_mongondow.md": "adat-budaya",
  "04_kisah_raja_raja_bolaang_mongondow.md": "kerajaan-bolaang-mongondow",
  "05_mengenal_bolaang_mongondow.md": "sejarah",
  "06_ungkapan_dan_peribahasa_mongondow.md": "bahasa-sastra",
  "07_knowladge_mongondow.md": "edukasi",
  "08_bahan_ajar_mulok_kelas_3.md": "edukasi",
  "09_morfologi_dan_sintaksis_bahasa_bolmong.md": "bahasa-sastra",
  "10_sastra_lisan_bolaang_mongondow.md": "bahasa-sastra",
  "11_analisis_pemekaran_daerah_bappenas.md": "edukasi",
  "12_migrasi_kisah_raja_raja_bolango.md": "kerajaan-bolaang-mongondow",
  "13_tumbuhnya_nasionalisme_gorontalo.md": "sejarah",
  "14_minahasa_wanua_dan_kawanua.md": "sejarah",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseMarkdown(content: string): { title: string; summary: string } {
  const lines = content.split("\n");
  let title = "Tanpa Judul";
  for (const line of lines) {
    const m = line.match(/^#\s+(.+)/);
    if (m) { title = m[1].trim(); break; }
  }

  // Ambil paragraf pertama yang bukan heading/blockquote/tabel sbg ringkasan SEO
  let summary = "";
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#") || t.startsWith(">") || t.startsWith("|") || t.startsWith("-")) continue;
    summary = t.replace(/\*\*/g, "").replace(/\*/g, "");
    break;
  }
  return { title, summary: summary.slice(0, 300) };
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

  const { error: probeErr } = await db.from("knowledge_categories").select("id", { count: "exact", head: true });
  if (probeErr) {
    console.error("❌ Tabel knowledge_categories belum ada:", probeErr.message);
    console.error("   Jalankan dulu migration SQL di Supabase SQL Editor, lalu ulangi script ini.");
    process.exit(1);
  }

  // 1) Tambah kategori ekstra (idempotent — upsert by slug)
  console.log(`\n📁 Menambah ${EXTRA_CATEGORIES.length} kategori tambahan...`);
  for (const cat of EXTRA_CATEGORIES) {
    const { error } = await db.from("knowledge_categories").upsert(
      { slug: cat.slug, name: cat.name, display_order: cat.order },
      { onConflict: "slug" }
    );
    if (error) console.warn(`   ⚠️  ${cat.slug}: ${error.message}`);
  }

  const { data: categories, error: catErr } = await db.from("knowledge_categories").select("id, slug");
  if (catErr || !categories) throw catErr;
  const categoryIdBySlug = new Map(categories.map(c => [c.slug, c.id as string]));

  const knowledgeDir = path.join(process.cwd(), "knowledge");
  let ok = 0, failed = 0, skipped = 0;

  // 2) File kurasi utama -> published
  console.log(`\n📥 Mengimpor ${CURATED_FILES.length} artikel utama (status: published)...`);
  for (const entry of CURATED_FILES) {
    const filePath = path.join(knowledgeDir, entry.file);
    if (!fs.existsSync(filePath)) { console.warn(`   ⚠️  Tidak ditemukan: ${entry.file}`); skipped++; continue; }
    const content = fs.readFileSync(filePath, "utf-8");
    const { title, summary } = parseMarkdown(content);
    const categoryId = categoryIdBySlug.get(entry.categorySlug);
    if (!categoryId) { console.warn(`   ⚠️  Kategori ${entry.categorySlug} tidak ditemukan utk ${entry.file}`); skipped++; continue; }

    const { error } = await db.from("knowledge_articles").upsert(
      {
        category_id: categoryId,
        slug: slugify(title),
        title,
        summary,
        content,
        meta_description: summary,
        status: "published",
        source_note: `Diimpor dari knowledge/${entry.file}`,
      },
      { onConflict: "slug" }
    );
    if (error) { console.warn(`   ⚠️  ${entry.file}: ${error.message}`); failed++; } else { console.log(`   ✅ ${title}`); ok++; }
  }

  // 3) Arsip mentah -> pending_review (menunggu kurasi admin/verifikator)
  const arsipDir = path.join(knowledgeDir, "arsip_download");
  const arsipFiles = fs.existsSync(arsipDir) ? fs.readdirSync(arsipDir).filter(f => f.endsWith(".md")) : [];
  console.log(`\n📥 Mengimpor ${arsipFiles.length} arsip mentah (status: pending_review)...`);

  for (const file of arsipFiles) {
    const categorySlug = ARSIP_MAP[file] ?? "edukasi";
    const categoryId = categoryIdBySlug.get(categorySlug);
    if (!categoryId) { console.warn(`   ⚠️  Kategori ${categorySlug} tidak ditemukan utk ${file}`); skipped++; continue; }

    const content = fs.readFileSync(path.join(arsipDir, file), "utf-8");
    const { title, summary } = parseMarkdown(content);

    const { error } = await db.from("knowledge_articles").upsert(
      {
        category_id: categoryId,
        slug: slugify(path.basename(file, ".md")),
        title,
        summary,
        content,
        meta_description: summary,
        status: "pending_review",
        source_note: `Diimpor dari knowledge/arsip_download/${file} — arsip mentah, perlu kurasi sebelum publish`,
      },
      { onConflict: "slug" }
    );
    if (error) { console.warn(`   ⚠️  ${file}: ${error.message}`); failed++; } else ok++;
  }

  console.log(`\n\n✅ Selesai. Berhasil: ${ok}, gagal: ${failed}, dilewati: ${skipped}`);
  console.log("   Artikel 'pending_review' perlu dikurasi lewat panel Database Knowledge sebelum tampil publik.");
}

main().catch(err => {
  console.error("❌ Import gagal:", err);
  process.exit(1);
});
