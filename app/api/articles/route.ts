import { NextRequest, NextResponse } from "next/server";
import { isSupabaseReady, supabaseAdmin } from "@/lib/supabase";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";

// Fallback in-memory store jika Supabase DB lokal belum dimigrasi
const MEMORY_ARTICLES: any[] = [];

/** Helper slug generator: /artikel/{slug-judul}-{ddmmyy} */
export function generateArticleSlug(title: string): string {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 50);

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const dateSuffix = `${dd}${mm}${yy}`;

  return `${cleanTitle}-${dateSuffix}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const region = searchParams.get("region");
    const filterFyp = searchParams.get("fyp") === "true";
    const search = searchParams.get("search")?.toLowerCase().trim();

    if (isSupabaseReady && supabaseAdmin) {
      let query = supabaseAdmin
        .from("user_articles")
        .select("*, profiles(display_name, avatar_url, role), article_comments(count)")
        .eq("status", "published");

      if (category && category !== "Semua") {
        query = query.eq("category", category);
      }
      if (region && region !== "Semua") {
        query = query.eq("region", region);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (!error && data) {
        let articles = data.map((item: any) => {
          const commentsCount = item.article_comments?.[0]?.count ?? 0;
          const fypScore =
            item.views_count * 1 +
            item.shares_count * 3 +
            item.likes_count * 5 -
            item.dislikes_count * 4 +
            commentsCount * 2;

          return {
            ...item,
            comments_count: commentsCount,
            fyp_score: fypScore,
            author_name: item.profiles?.display_name || "Kontributor Mongondow",
            author_avatar: item.profiles?.avatar_url || "",
            author_role: item.profiles?.role || "user",
          };
        });

        if (filterFyp) {
          articles.sort((a, b) => b.fyp_score - a.fyp_score);
          articles = articles.slice(0, 50);
        } else {
          articles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return NextResponse.json({ articles });
      }
    }

    // Fallback data memory
    let articles = [...MEMORY_ARTICLES];
    if (category && category !== "Semua") {
      articles = articles.filter((a) => a.category === category);
    }
    if (region && region !== "Semua") {
      articles = articles.filter((a) => a.region === region);
    }
    if (filterFyp) {
      articles.sort((a, b) => (b.fyp_score || 0) - (a.fyp_score || 0));
    }
    return NextResponse.json({ articles });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengambil daftar artikel" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const profile = await getCurrentUserProfile().catch(() => null);
    if (!profile) {
      return NextResponse.json({ error: "Anda harus login untuk memposting artikel" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const title: string = (body.title || "").trim();
    const category: string = body.category || "Pengetahuan & Sejarah";
    const region: string = body.region || "Umum";
    const excerpt: string = (body.excerpt || "").trim();
    const content: string = (body.content || "").trim();
    const coverImage: string = body.cover_image || "";

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan isi artikel wajib diisi" }, { status: 400 });
    }

    const slug = generateArticleSlug(title);

    if (isSupabaseReady && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("user_articles")
        .insert({
          author_id: profile.id,
          title,
          slug,
          category,
          region,
          excerpt: excerpt || title,
          content,
          cover_image: coverImage,
          status: "published",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: `Gagal menyimpan artikel: ${error.message}` }, { status: 500 });
      }

      // Tambah poin kontribusi user +15 Pts
      try {
        await supabaseAdmin.rpc("increment_profile_score", { user_id: profile.id, amount: 15 });
      } catch {
        // ignore
      }

      return NextResponse.json({ success: true, article: data, slug });
    }

    // Fallback simpan memory
    const newArticle = {
      id: crypto.randomUUID(),
      author_id: profile.id,
      title,
      slug,
      category,
      region,
      excerpt: excerpt || title,
      content,
      cover_image: coverImage,
      views_count: 1,
      shares_count: 0,
      likes_count: 0,
      dislikes_count: 0,
      status: "published",
      created_at: new Date().toISOString(),
      author_name: profile.display_name || profile.email,
      author_avatar: profile.avatar_url,
      author_role: profile.role,
      comments_count: 0,
      fyp_score: 1,
    };
    MEMORY_ARTICLES.unshift(newArticle);

    return NextResponse.json({ success: true, article: newArticle, slug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses artikel" }, { status: 500 });
  }
}
