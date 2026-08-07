/**
 * ginza-db.ts
 * Data layer terpusat untuk skema baru Ginza Project / MongondowPedia
 * (profiles, kamus_entries, knowledge_articles, contributions, dst — lihat
 * supabase/migrations/20260803_ginza_platform_schema.sql).
 *
 * Semua fungsi di sini pakai `supabaseAdmin` (service role, bypass RLS) dan
 * HANYA boleh dipanggil dari server (API routes / Server Components) —
 * jangan pernah di-import dari komponen 'use client'.
 */
import { supabaseAdmin, isSupabaseReady } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────

export type UserRole = "user" | "verificator" | "admin";

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  mongondow_score: number;
  is_banned: boolean;
  banned_reason: string | null;
  banned_at: string | null;
  created_at: string;
  updated_at: string;
  email?: string; // di-join dari auth.users saat perlu
}

export interface VerificatorApplication {
  id: string;
  user_id: string;
  applicant_type: "warga_bmr" | "peneliti_eksternal";
  ktp_image_url: string | null;
  institution_name: string | null;
  credential_url: string | null;
  expertise: string[];
  face_front_url: string | null;
  face_left_url: string | null;
  face_right_url: string | null;
  consent_given_at: string | null;
  ai_face_check_status: "pending" | "passed" | "flagged" | "skipped" | "error";
  ai_face_check_notes: string | null;
  full_name: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export interface KamusEntryRow {
  id: string;
  word: string;
  phonetic: string | null;
  origin: string | null;
  meaning: string | null;
  example: string | null;
  aksara_breakdown: string | null;
  category: string | null;
  status: "draft" | "pending_review" | "verified" | "archived";
  view_count: number;
  search_count: number;
  created_by: string | null;
  source_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeCategory {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  display_order: number;
  visit_count: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface KnowledgeArticleRow {
  id: string;
  category_id: string;
  slug: string;
  title: string;
  summary: string | null;
  content: string;
  cover_image_url: string | null;
  meta_description: string | null;
  status: "draft" | "pending_review" | "published" | "archived";
  view_count: number;
  created_by: string | null;
  source_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContributionRow {
  id: string;
  contributor_id: string;
  contribution_type: "kamus_new" | "kamus_edit" | "knowledge_new" | "knowledge_edit";
  target_kamus_id: string | null;
  target_knowledge_id: string | null;
  proposed_data: Record<string, unknown>;
  note: string | null;
  status: "pending" | "quorum_reached" | "approved" | "rejected";
  admin_approved: boolean;
  admin_reviewed_by: string | null;
  admin_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AksaraGlyphRow {
  id: string;
  romanization: string;
  consonant: string | null;
  vowel: string | null;
  syllable_type: "vowel_a" | "vowel_e_i" | "vowel_o_u" | "final_consonant";
  glyph_svg_path: string;
  glyph_image_legacy: string | null;
  unicode_pua_codepoint: string | null;
  display_order: number;
  status: "draft" | "pending_review" | "verified" | "archived";
  notes: string | null;
  source_reference: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditLogRow {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  before_data: unknown;
  after_data: unknown;
  created_at: string;
}

function assertDb() {
  if (!isSupabaseReady || !supabaseAdmin) {
    throw new Error(
      "[ginza-db] Supabase belum terkonfigurasi, atau tabel skema baru belum dibuat. " +
      "Jalankan supabase/migrations/20260803_ginza_platform_schema.sql di Supabase SQL Editor dulu."
    );
  }
  return supabaseAdmin;
}

// ── Audit log (immutable — hanya insert) ────────────────────────────────

export async function writeAuditLog(entry: {
  actorId?: string | null;
  actorRole?: string | null;
  action: string;
  targetTable?: string;
  targetId?: string;
  beforeData?: unknown;
  afterData?: unknown;
}) {
  const db = assertDb();
  const { error } = await db.from("audit_logs").insert({
    actor_id: entry.actorId ?? null,
    actor_role: entry.actorRole ?? null,
    action: entry.action,
    target_table: entry.targetTable ?? null,
    target_id: entry.targetId ?? null,
    before_data: entry.beforeData ?? null,
    after_data: entry.afterData ?? null,
  });
  if (error) console.warn("[ginza-db] gagal menulis audit_log:", error.message);
}

export async function listAuditLogs(limit = 200) {
  const db = assertDb();
  const { data, error } = await db
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as AuditLogRow[];
}

// ── Profiles / Users ─────────────────────────────────────────────────────

export async function listProfiles(opts: { role?: UserRole; search?: string } = {}) {
  const db = assertDb();
  let q = db.from("profiles").select("*").order("created_at", { ascending: false });
  if (opts.role) q = q.eq("role", opts.role);
  if (opts.search) q = q.ilike("display_name", `%${opts.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function getProfile(id: string) {
  const db = assertDb();
  const { data, error } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function upsertProfile(data: {
  id: string;
  display_name?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
}) {
  const db = assertDb();
  const { error } = await db.from("profiles").upsert(
    {
      id: data.id,
      display_name: data.display_name ?? null,
      avatar_url: data.avatar_url ?? null,
      role: data.role ?? "user",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

export async function setUserBanStatus(userId: string, banned: boolean, reason?: string) {
  const db = assertDb();
  const { error } = await db
    .from("profiles")
    .update({
      is_banned: banned,
      banned_reason: banned ? (reason ?? null) : null,
      banned_at: banned ? new Date().toISOString() : null,
    })
    .eq("id", userId);
  if (error) throw error;
}

export async function setUserRole(userId: string, role: UserRole) {
  const db = assertDb();
  const { error } = await db.from("profiles").update({ role }).eq("id", userId);
  if (error) throw error;
}

export async function getTokenUsageByUser(userId: string, limit = 50) {
  const db = assertDb();
  const { data, error } = await db
    .from("token_usage")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getTrendingUsers(limit = 10) {
  const db = assertDb();
  const { data, error } = await db
    .from("profiles")
    .select("id, display_name, avatar_url, mongondow_score")
    .eq("is_banned", false)
    .order("mongondow_score", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

// ── Verificator applications ────────────────────────────────────────────

export async function listVerificatorApplications(status?: string) {
  const db = assertDb();
  let q = db.from("verificator_applications").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as VerificatorApplication[];
}

export async function reviewVerificatorApplication(
  appId: string,
  approve: boolean,
  reviewerId: string | null,
  notes?: string
) {
  const db = assertDb();
  const { data: app, error: fetchErr } = await db
    .from("verificator_applications")
    .select("*")
    .eq("id", appId)
    .single();
  if (fetchErr) throw fetchErr;

  const { error } = await db
    .from("verificator_applications")
    .update({
      status: approve ? "approved" : "rejected",
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes ?? null,
    })
    .eq("id", appId);
  if (error) throw error;

  if (approve) {
    await setUserRole(app.user_id, "verificator");
  }
}

export interface VoiceTrainingSample {
  id: string;
  verificator_id: string;
  word_or_phrase: string;
  audio_url: string;
  transcript: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  created_at: string;
}

/** Semua sampel suara (lintas verifikator) utk panel admin — beda dari GET publik yang cuma punya sendiri. */
export async function listVoiceSamplesForAdmin(status?: string) {
  const db = assertDb();
  let q = db
    .from("voice_training_samples")
    .select("*, profiles:verificator_id (display_name, avatar_url)")
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as (VoiceTrainingSample & { profiles: { display_name: string | null; avatar_url: string | null } | null })[];
}

export async function reviewVoiceSample(sampleId: string, approve: boolean, reviewerId: string | null) {
  const db = assertDb();
  const { error } = await db
    .from("voice_training_samples")
    .update({ status: approve ? "approved" : "rejected", reviewed_by: reviewerId })
    .eq("id", sampleId);
  if (error) throw error;
}

// ── Kamus ────────────────────────────────────────────────────────────────

export async function listKamusEntries(opts: { search?: string; status?: string; limit?: number } = {}) {
  const db = assertDb();
  let q = db.from("kamus_entries").select("*").order("word", { ascending: true });
  if (opts.status) q = q.eq("status", opts.status);
  if (opts.search) q = q.ilike("word", `%${opts.search}%`);
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as KamusEntryRow[];
}

export async function upsertKamusEntry(entry: Partial<KamusEntryRow> & { word: string }) {
  const db = assertDb();
  const { data, error } = await db
    .from("kamus_entries")
    .upsert(entry, { onConflict: "word" })
    .select()
    .single();
  if (error) throw error;
  return data as KamusEntryRow;
}

export async function verifyKamusEntry(entryId: string, verificatorId: string, note?: string) {
  const db = assertDb();
  const { error: voteErr } = await db
    .from("kamus_verifications")
    .insert({ entry_id: entryId, verificator_id: verificatorId, note: note ?? null });
  if (voteErr && voteErr.code !== "23505") throw voteErr; // ignore duplicate verifikasi

  const { error } = await db.from("kamus_entries").update({ status: "verified" }).eq("id", entryId);
  if (error) throw error;
}

/**
 * Verifikasi langsung oleh admin (owner tunggal, tidak punya baris di
 * profiles) — beda dari verifyKamusEntry yang mencatat verifikator spesifik
 * di kamus_verifications. Dipakai dari panel Database Kamus Admin.
 */
export async function adminVerifyKamusEntry(entryId: string, status: KamusEntryRow["status"] = "verified") {
  const db = assertDb();
  const { error } = await db.from("kamus_entries").update({ status }).eq("id", entryId);
  if (error) throw error;
}

export async function getVerificatorsForEntry(entryId: string) {
  const db = assertDb();
  const { data, error } = await db
    .from("kamus_verifications")
    .select("verificator_id, verified_at, note, profiles:verificator_id (display_name, avatar_url)")
    .eq("entry_id", entryId);
  if (error) throw error;
  return data ?? [];
}

import aksaraFallbackData from "../data/aksara/aksara_mongondow.json";

function getFallbackAksaraGlyphs(status?: string): AksaraGlyphRow[] {
  const syllables = (aksaraFallbackData as any).syllables || [];
  const rows: AksaraGlyphRow[] = syllables.map((s: any) => ({
    id: s.id || s.romanization,
    romanization: s.romanization,
    consonant: s.consonant || null,
    vowel: s.vowel || null,
    syllable_type: s.syllable_type,
    glyph_svg_path: `/aksara-svg/${s.glyph_svg}`,
    glyph_image_legacy: `/aksara/${s.glyph_image}`,
    unicode_pua_codepoint: null,
    display_order: s.display_order || 10,
    status: "verified",
    notes: "Aksara Mongondow (Fase 1: Vektor SVG)",
    source_reference: (aksaraFallbackData as any).script?.credit ?? null,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  if (status) {
    return rows.filter((r) => r.status === status);
  }
  return rows;
}

// ── Aksara Mongondow (Database Huruf/Abjad) ─────────────────────────────

export async function listAksaraGlyphs(opts: { status?: string } = {}) {
  const db = assertDb();
  try {
    let q = db.from("aksara_glyphs").select("*").order("display_order", { ascending: true });
    if (opts.status) q = q.eq("status", opts.status);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as AksaraGlyphRow[];
  } catch (err: any) {
    console.warn("[listAksaraGlyphs] Database table missing or query error, returning fallback JSON data:", err?.message || err);
    return getFallbackAksaraGlyphs(opts.status);
  }
}

export async function upsertAksaraGlyph(glyph: Partial<AksaraGlyphRow> & { romanization: string; syllable_type: AksaraGlyphRow["syllable_type"]; glyph_svg_path: string }) {
  const db = assertDb();
  const { data, error } = await db
    .from("aksara_glyphs")
    .upsert(glyph, { onConflict: "romanization" })
    .select()
    .single();
  if (error) throw error;
  return data as AksaraGlyphRow;
}

export async function adminVerifyAksaraGlyph(glyphId: string, status: AksaraGlyphRow["status"] = "verified") {
  const db = assertDb();
  const { error } = await db.from("aksara_glyphs").update({ status }).eq("id", glyphId);
  if (error) throw error;
}

export async function verifyAksaraGlyph(glyphId: string, verificatorId: string, note?: string) {
  const db = assertDb();
  const { error: voteErr } = await db
    .from("aksara_glyph_verifications")
    .insert({ glyph_id: glyphId, verificator_id: verificatorId, note: note ?? null });
  if (voteErr && voteErr.code !== "23505") throw voteErr;

  const { error } = await db.from("aksara_glyphs").update({ status: "verified" }).eq("id", glyphId);
  if (error) throw error;
}

export async function getVerificatorsForGlyph(glyphId: string) {
  const db = assertDb();
  try {
    const { data, error } = await db
      .from("aksara_glyph_verifications")
      .select("verificator_id, verified_at, note, profiles:verificator_id (display_name, avatar_url)")
      .eq("glyph_id", glyphId);
    if (error) throw error;
    return data ?? [];
  } catch (err: any) {
    console.warn("[getVerificatorsForGlyph] Missing table or query error:", err?.message || err);
    return [];
  }
}

// ── Knowledge ────────────────────────────────────────────────────────────

export async function listKnowledgeCategories() {
  const db = assertDb();
  const { data, error } = await db
    .from("knowledge_categories")
    .select("*")
    .order("visit_count", { ascending: false })
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as KnowledgeCategory[];
}

export async function upsertKnowledgeCategory(cat: Partial<KnowledgeCategory> & { slug: string; name: string }) {
  const db = assertDb();
  const { data, error } = await db
    .from("knowledge_categories")
    .upsert(cat, { onConflict: "slug" })
    .select()
    .single();
  if (error) throw error;
  return data as KnowledgeCategory;
}

export async function listKnowledgeArticles(opts: { categoryId?: string; status?: string } = {}) {
  const db = assertDb();
  let q = db.from("knowledge_articles").select("*").order("created_at", { ascending: false });
  if (opts.categoryId) q = q.eq("category_id", opts.categoryId);
  if (opts.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as KnowledgeArticleRow[];
}

export async function upsertKnowledgeArticle(article: Partial<KnowledgeArticleRow> & { slug: string; title: string; content: string; category_id: string }) {
  const db = assertDb();
  const { data, error } = await db
    .from("knowledge_articles")
    .upsert(article, { onConflict: "slug" })
    .select()
    .single();
  if (error) throw error;
  return data as KnowledgeArticleRow;
}

export async function incrementKnowledgeVisit(categoryId: string) {
  const db = assertDb();
  const { data } = await db.from("knowledge_categories").select("visit_count").eq("id", categoryId).single();
  if (data) {
    await db.from("knowledge_categories").update({ visit_count: (data.visit_count ?? 0) + 1 }).eq("id", categoryId);
  }
}

// ── Contributions ────────────────────────────────────────────────────────

export async function listContributions(status?: string) {
  const db = assertDb();
  let q = db.from("contributions").select("*, profiles:contributor_id (display_name, avatar_url)").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createContribution(input: {
  contributorId: string;
  type: ContributionRow["contribution_type"];
  targetKamusId?: string;
  targetKnowledgeId?: string;
  proposedData: Record<string, unknown>;
  note?: string;
}) {
  const db = assertDb();
  const { data, error } = await db
    .from("contributions")
    .insert({
      contributor_id: input.contributorId,
      contribution_type: input.type,
      target_kamus_id: input.targetKamusId ?? null,
      target_knowledge_id: input.targetKnowledgeId ?? null,
      proposed_data: input.proposedData,
      note: input.note ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as ContributionRow;
}

export async function castContributionVote(contributionId: string, verificatorId: string, vote: "approve" | "reject") {
  const db = assertDb();
  const { error } = await db
    .from("contribution_votes")
    .upsert({ contribution_id: contributionId, verificator_id: verificatorId, vote }, { onConflict: "contribution_id,verificator_id" });
  if (error) throw error;
}

/**
 * Finalisasi kontribusi oleh admin: menyatukan proposed_data ke tabel asli
 * (kamus_entries / knowledge_articles), menambah skor kontributor, dan
 * mencatat audit log. Hanya boleh dipanggil setelah status = 'quorum_reached'.
 */
export async function finalizeContribution(contributionId: string, adminId: string | null, approve: boolean) {
  const db = assertDb();
  const { data: contribution, error: fetchErr } = await db
    .from("contributions")
    .select("*")
    .eq("id", contributionId)
    .single();
  if (fetchErr) throw fetchErr;

  if (!approve) {
    const { error } = await db
      .from("contributions")
      .update({ status: "rejected", admin_approved: false, admin_reviewed_by: adminId, admin_reviewed_at: new Date().toISOString() })
      .eq("id", contributionId);
    if (error) throw error;
    await writeAuditLog({ actorId: adminId, actorRole: "admin", action: "contribution_rejected", targetTable: "contributions", targetId: contributionId });
    return;
  }

  const proposed = contribution.proposed_data as Record<string, unknown>;

  if (contribution.contribution_type === "kamus_new" || contribution.contribution_type === "kamus_edit") {
    const entry = await upsertKamusEntry({
      id: contribution.target_kamus_id ?? undefined,
      word: proposed.word as string,
      phonetic: proposed.phonetic as string | undefined,
      origin: proposed.origin as string | undefined,
      meaning: proposed.meaning as string | undefined,
      example: proposed.example as string | undefined,
      category: proposed.category as string | undefined,
      status: "verified",
      created_by: contribution.contributor_id,
    });

    // Catat verifikator yang vote "approve" sbg kamus_verifications, supaya
    // kata dari jalur Kontribusi juga tampil atribusi verifikatornya (bukan
    // cuma kata yang diverifikasi langsung dari panel Database Kamus).
    const { data: approveVotes } = await db
      .from("contribution_votes")
      .select("verificator_id")
      .eq("contribution_id", contributionId)
      .eq("vote", "approve");
    if (approveVotes && approveVotes.length > 0) {
      await db.from("kamus_verifications").upsert(
        approveVotes.map(v => ({ entry_id: entry.id, verificator_id: v.verificator_id, note: "Disetujui lewat voting kontribusi" })),
        { onConflict: "entry_id,verificator_id", ignoreDuplicates: true }
      );
    }

    await writeAuditLog({ actorId: adminId, actorRole: "admin", action: "kamus_entry_merged_from_contribution", targetTable: "kamus_entries", targetId: entry.id, afterData: entry });
  } else if (contribution.contribution_type === "knowledge_new" || contribution.contribution_type === "knowledge_edit") {
    const article = await upsertKnowledgeArticle({
      id: contribution.target_knowledge_id ?? undefined,
      slug: proposed.slug as string,
      title: proposed.title as string,
      content: proposed.content as string,
      summary: proposed.summary as string | undefined,
      category_id: proposed.category_id as string,
      status: "published",
      created_by: contribution.contributor_id,
    });
    await writeAuditLog({ actorId: adminId, actorRole: "admin", action: "knowledge_article_merged_from_contribution", targetTable: "knowledge_articles", targetId: article.id, afterData: article });
  }

  const { error } = await db
    .from("contributions")
    .update({ status: "approved", admin_approved: true, admin_reviewed_by: adminId, admin_reviewed_at: new Date().toISOString() })
    .eq("id", contributionId);
  if (error) throw error;

  // Naikkan skor kontributor — dasar algoritma Trending Users (lihat catatan di bawah)
  const { data: contributor } = await db.from("profiles").select("mongondow_score").eq("id", contribution.contributor_id).single();
  if (contributor) {
    const weight = contribution.contribution_type.startsWith("kamus") ? 10 : 15; // knowledge lebih berat krn lebih panjang
    await db.from("profiles").update({ mongondow_score: (contributor.mongondow_score ?? 0) + weight }).eq("id", contribution.contributor_id);
  }
}

// ── Metrics ──────────────────────────────────────────────────────────────

export async function logMetricEvent(event: {
  type: "kamus_search" | "kamus_click" | "knowledge_view" | "ai_question";
  targetId?: string;
  targetText?: string;
  userId?: string;
}) {
  const db = assertDb();
  await db.from("metrics_events").insert({
    event_type: event.type,
    target_id: event.targetId ?? null,
    target_text: event.targetText ?? null,
    user_id: event.userId ?? null,
  });
}

export async function getTopMetrics(eventType: "kamus_search" | "kamus_click" | "knowledge_view" | "ai_question", limit = 10) {
  const db = assertDb();
  const { data, error } = await db
    .from("metrics_events")
    .select("target_text")
    .eq("event_type", eventType)
    .not("target_text", "is", null)
    .limit(5000); // ambil recent lalu agregasi di JS (cukup utk skala awal)
  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const key = (row.target_text ?? "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// ── Overview aggregate ───────────────────────────────────────────────────

export async function getOverviewStats() {
  const db = assertDb();
  const [
    { count: totalUsers },
    { count: totalVerificators },
    { count: pendingVerificatorApps },
    { count: totalKamus },
    { count: verifiedKamus },
    { count: totalKnowledge },
    { count: pendingContributions },
    { count: totalContributions },
    { count: unreadMessages },
    { count: totalMessages },
    { count: totalUserArticles },
    { count: totalAksara },
  ] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "verificator"),
    db.from("verificator_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    db.from("kamus_entries").select("*", { count: "exact", head: true }),
    db.from("kamus_entries").select("*", { count: "exact", head: true }).eq("status", "verified"),
    db.from("knowledge_articles").select("*", { count: "exact", head: true }).eq("status", "published"),
    db.from("contributions").select("*", { count: "exact", head: true }).in("status", ["pending", "quorum_reached"]),
    db.from("contributions").select("*", { count: "exact", head: true }),
    db.from("contact_messages").select("*", { count: "exact", head: true }).eq("status", "unread"),
    db.from("contact_messages").select("*", { count: "exact", head: true }),
    db.from("user_articles").select("*", { count: "exact", head: true }),
    db.from("aksara_submissions").select("*", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    totalVerificators: totalVerificators ?? 0,
    pendingVerificatorApps: pendingVerificatorApps ?? 0,
    totalKamus: totalKamus ?? 0,
    verifiedKamus: verifiedKamus ?? 0,
    totalKnowledge: totalKnowledge ?? 0,
    pendingContributions: pendingContributions ?? 0,
    totalContributions: totalContributions ?? 0,
    unreadMessages: unreadMessages ?? 0,
    totalMessages: totalMessages ?? 0,
    totalUserArticles: totalUserArticles ?? 0,
    totalAksara: totalAksara ?? 0,
  };
}

// ── Conversations (riwayat chat AI) ─────────────────────────────────────

export async function listConversationsByUser(userId: string) {
  const db = assertDb();
  const { data, error } = await db
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveConversation(userId: string, conversationId: string | undefined, title: string, messages: unknown[]) {
  const db = assertDb();
  if (conversationId) {
    const { error } = await db.from("conversations").update({ title, messages }).eq("id", conversationId).eq("user_id", userId);
    if (error) throw error;
    return conversationId;
  }
  const { data, error } = await db.from("conversations").insert({ user_id: userId, title, messages }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

// ── Contact Messages (Pesan Masuk & Email Forwarding) ───────────────────

export interface ContactMessageRow {
  id: string;
  name: string;
  email: string;
  whatsapp: string | null;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  resend_id: string | null;
  forwarded_to: string | null;
  created_at: string;
  updated_at: string;
}

export async function listContactMessages(opts: { status?: string } = {}) {
  const db = assertDb();
  let q = db.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (opts.status) q = q.eq("status", opts.status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as ContactMessageRow[];
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  whatsapp?: string;
  message: string;
  resendId?: string;
  forwardedTo?: string;
}) {
  const db = assertDb();
  const { data, error } = await db
    .from("contact_messages")
    .insert({
      name: input.name,
      email: input.email,
      whatsapp: input.whatsapp || null,
      message: input.message,
      resend_id: input.resendId || null,
      forwarded_to: input.forwardedTo || null,
      status: "unread"
    })
    .select()
    .single();
  if (error) throw error;
  return data as ContactMessageRow;
}

export async function updateContactMessageStatus(id: string, status: ContactMessageRow["status"]) {
  const db = assertDb();
  const { data, error } = await db
    .from("contact_messages")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ContactMessageRow;
}
