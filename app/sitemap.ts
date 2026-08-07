import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";

const BASE_URL = "https://mongondowpedia.com";

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  // ─── Halaman Utama ───────────────────────────────────────────────
  { path: "/",                      priority: 1.0, changeFrequency: "daily" },

  // ─── Konten Utama (High Value) ───────────────────────────────────
  { path: "/knowledge",             priority: 0.95, changeFrequency: "daily" },
  { path: "/kamus",                 priority: 0.95, changeFrequency: "daily" },
  { path: "/aksara-mongondow",      priority: 0.90, changeFrequency: "weekly" },
  { path: "/artikel",               priority: 0.85, changeFrequency: "daily" },
  { path: "/aksara",                priority: 0.80, changeFrequency: "weekly" },

  // ─── Konten Informasi ────────────────────────────────────────────
  { path: "/info",                  priority: 0.70, changeFrequency: "monthly" },
  { path: "/ecosystem",             priority: 0.65, changeFrequency: "monthly" },
  { path: "/panduan",               priority: 0.60, changeFrequency: "monthly" },
  { path: "/dokumentasi",           priority: 0.60, changeFrequency: "monthly" },
  { path: "/proposal",              priority: 0.55, changeFrequency: "monthly" },
  { path: "/game",                  priority: 0.50, changeFrequency: "monthly" },

  // ─── Auth & Akun ────────────────────────────────────────────────
  { path: "/login",                 priority: 0.40, changeFrequency: "yearly" },
  { path: "/akun",                  priority: 0.35, changeFrequency: "yearly" },

  // ─── Legal ──────────────────────────────────────────────────────
  { path: "/privacy",               priority: 0.20, changeFrequency: "yearly" },
  { path: "/terms",                 priority: 0.20, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  if (!supabaseAdmin) return entries;

  try {
    const [{ data: categories }, { data: articles }, { data: kamusEntries }] =
      await Promise.all([
        supabaseAdmin
          .from("knowledge_categories")
          .select("id, slug, updated_at, is_active")
          .eq("is_active", true),
        supabaseAdmin
          .from("knowledge_articles")
          .select("slug, updated_at, category_id")
          .eq("status", "published"),
        supabaseAdmin
          .from("kamus")
          .select("id, updated_at")
          .limit(500),
      ]);

    const categorySlugById = new Map(
      (categories ?? []).map((c) => [c.id, c.slug])
    );

    // ─── Knowledge Categories ──────────────────────────────────────
    for (const cat of categories ?? []) {
      entries.push({
        url: `${BASE_URL}/knowledge/${cat.slug}`,
        lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.80,
      });
    }

    // ─── Knowledge Articles ───────────────────────────────────────
    for (const art of articles ?? []) {
      const categorySlug = categorySlugById.get(art.category_id);
      if (!categorySlug) continue;
      entries.push({
        url: `${BASE_URL}/knowledge/${categorySlug}/${art.slug}`,
        lastModified: art.updated_at ? new Date(art.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.70,
      });
    }

    // ─── Kamus Entries ───────────────────────────────────────────
    // Tambahkan halaman kamus sebagai URL dengan query parameter
    // sehingga entri kamus bisa terindex oleh search engine
    if ((kamusEntries ?? []).length > 0) {
      entries.push({
        url: `${BASE_URL}/kamus`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.90,
      });
    }

  } catch {
    // DB tidak siap saat build — fallback ke rute statis saja.
  }

  return entries;
}
