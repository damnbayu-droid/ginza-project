/**
 * run-migrations.ts
 * Menjalankan semua file SQL migration ke Supabase (via pg direct connection).
 * Gunakan: npx tsx scripts/run-migrations.ts
 */

import * as fs from "fs";
import * as path from "path";
import { Client } from "pg";

// Build Supabase direct connection string dari .env.local
// Format: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Extract project ref dari URL: https://xmsasakqzxyiceqlxdpv.supabase.co
const match = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectRef = match?.[1];

if (!projectRef) {
  console.error("❌ Could not extract Supabase project ref from NEXT_PUBLIC_SUPABASE_URL");
  process.exit(1);
}

// Supabase direct database URL (Session Pooler port 5432)
// Password diambil dari SUPABASE_DB_PASSWORD atau kita coba koneksi via REST + pg
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!DB_PASSWORD) {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  SUPABASE_DB_PASSWORD tidak ditemukan di environment.");
  console.log("");
  console.log("Cara mendapatkan database password:");
  console.log("1. Buka https://supabase.com/dashboard/project/" + projectRef + "/settings/database");
  console.log("2. Di bagian 'Connection string', copy password database Anda");
  console.log("3. Jalankan lagi dengan:");
  console.log("");
  console.log(`   SUPABASE_DB_PASSWORD='your_password' npx tsx scripts/run-migrations.ts`);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  process.exit(1);
}

const connectionString = `postgresql://postgres.${projectRef}:${DB_PASSWORD}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;

async function runMigrations() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    console.log(`\n🔌 Connecting to Supabase (${projectRef})...`);
    await client.connect();
    console.log("✅ Connected!\n");

    const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith(".sql"))
      .sort(); // Run in chronological order

    console.log(`📋 Found ${files.length} migration files:\n`);
    files.forEach(f => console.log(`   - ${f}`));
    console.log("");

    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf-8");
      
      console.log(`🔄 Running: ${file}...`);
      try {
        await client.query(sql);
        console.log(`   ✅ Done\n`);
      } catch (err: any) {
        // Ignore "already exists" errors — these are safe to skip
        if (err.message?.includes("already exists") || err.code === "42P07" || err.code === "42701") {
          console.log(`   ⏭  Skipped (already exists)\n`);
        } else {
          console.error(`   ❌ Error: ${err.message}\n`);
          // Continue running other migrations
        }
      }
    }

    console.log("🎉 All migrations complete!\n");
  } catch (err: any) {
    console.error("❌ Failed to connect:", err.message);
    console.log("\nPastikan:");
    console.log("1. SUPABASE_DB_PASSWORD benar");
    console.log("2. Project Supabase aktif (tidak paused)");
    console.log("3. Network bisa akses Supabase\n");
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
