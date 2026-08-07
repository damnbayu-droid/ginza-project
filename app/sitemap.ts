import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase";

const BASE_URL = "https://mongondowpedia.com";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFrequency: "daily" },
  { path: "/knowledge", priority: 0.9, changeFrequency: "daily" },
  { path: "/kamus", priority: 0.9, changeFrequency: "daily" },
  { path: "/aksara-mongondow", priority: 0.8, changeFrequency: "weekly" },
  { path: "/aksara", priority: 0.6, changeFrequency: "weekly" },
  { path: "/panduan", priority: 0.5, changeFrequency: "monthly" },
  { path: "/dokumentasi", priority: 0.5, changeFrequency: "monthly" },
  { path: "/info", priority: 0.4, changeFrequency: "monthly" },
  { path: "/ecosystem", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
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
    const [{ data: categories }, { data: articles }] = await Promise.all([
      supabaseAdmin.from("knowledge_categories").select("id, slug, is_active").eq("is_active", true),
      supabaseAdmin.from("knowledge_articles").select("slug, updated_at, category_id").eq("status", "published"),
    ]);

    const categorySlugById = new Map((categories ?? []).map((c) => [c.id, c.slug]));

    for (const cat of categories ?? []) {
      entries.push({
        url: `${BASE_URL}/knowledge/${cat.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    for (const art of articles ?? []) {
      const categorySlug = categorySlugById.get(art.category_id);
      if (!categorySlug) continue;
      entries.push({
        url: `${BASE_URL}/knowledge/${categorySlug}/${art.slug}`,
        lastModified: art.updated_at ? new Date(art.updated_at) : new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // DB tidak siap saat build — fallback ke rute statis saja.
  }

  return entries;
}
