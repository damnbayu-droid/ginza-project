import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/auth";
import { saveToDataCenter } from "@/lib/data-center";
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import fs from "fs";
import path from "path";

const RAW_TEXT_MAX_LENGTH = 20000;

const projectRoot = process.cwd();
const dbJsonPath = path.resolve(projectRoot, "db.json");

// 1. GET ALL RECORDS (Enforces Admin Auth)
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("gw_data_center")
      .select("*, gw_client_apps(name)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[api-data-center] Fetch error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map nested join to clean format
    const mapped = (data || []).map((row: any) => ({
      ...row,
      app_name: row.gw_client_apps?.name || "Internal / Global"
    }));

    return NextResponse.json(mapped);
  } else {
    // Local fallback
    if (fs.existsSync(dbJsonPath)) {
      const db = JSON.parse(fs.readFileSync(dbJsonPath, "utf8"));
      const records = db.dataCenter || [];
      const apps = db.clientApps || [];

      const mapped = records.map((r: any) => {
        const app = apps.find((a: any) => a.id === r.client_app_id);
        return {
          ...r,
          app_name: app ? app.name : "Internal / Global"
        };
      }).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return NextResponse.json(mapped);
    }
    return NextResponse.json([]);
  }
}

// 2. INSERT MANUAL DOCUMENT (Enforces Admin Auth)
// Dipakai jalur "Tambah Pengetahuan dari Lirik/Dokumen" (form admin,
// KnowledgeCandidatesPanel.tsx) sejak 2026-08-18 -- beda dari
// chat_memory_fact yg disaring AI dulu (banyak noise obrolan biasa), baris
// dari sini SELALU manual_review_required=true krn admin sendiri yg
// SENGAJA menyalin kontennya utk ditinjau -- langsung masuk antrean review
// yg sama tanpa menunggu cron harian (lihat lib/ginza-db.ts#listDataCenterCandidates).
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "owner") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rateCheck = await checkRateLimit(ip, RATE_LIMITS.MANUAL_KNOWLEDGE);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak permintaan. Coba lagi setelah ${rateCheck.resetAt.toISOString()}.` },
      { status: 429, headers: { "Retry-After": rateCheck.resetAt.toISOString() } }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { raw_text, file, fileMimeType, tags, language, document_type, title, source_url } = body;

    const trimmedText = typeof raw_text === "string" ? raw_text.trim() : "";
    if (!trimmedText && !file) {
      return NextResponse.json({ error: "Isi teks atau file wajib diisi" }, { status: 400 });
    }
    if (trimmedText.length > RAW_TEXT_MAX_LENGTH) {
      return NextResponse.json({ error: `Teks maksimal ${RAW_TEXT_MAX_LENGTH} karakter` }, { status: 400 });
    }

    const dataCenterId = await saveToDataCenter({
      client_app_id: null, // manual documents uploaded by admin are null-scoped
      field_key: null,
      source_type: "manual_document",
      source_url: typeof source_url === "string" && source_url.trim() ? source_url.trim() : null,
      document_type: document_type || "manual_document",
      raw_text: trimmedText || null,
      language: language || "id",
      tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
      fileBase64: file || null,
      fileMimeType: fileMimeType || null,
      manual_review_required: true,
      confidence_score: 1.0,
      extracted_data: {
        title: typeof title === "string" ? title.trim().slice(0, 200) : null,
        candidate_fact: (typeof title === "string" && title.trim()) || trimmedText.slice(0, 150) || null,
        submitted_by_admin: true,
      },
    });

    if (!dataCenterId) {
      return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data_center_id: dataCenterId }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process manual upload" }, { status: 500 });
  }
}
