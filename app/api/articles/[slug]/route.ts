import { NextRequest, NextResponse } from "next/server";
import { isSupabaseReady, supabaseAdmin } from "@/lib/supabase";
import { getCurrentUserProfile } from "@/lib/supabase-auth-server";
import { logAudit } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug artikel tidak ditemukan" }, { status: 400 });
    }

    if (isSupabaseReady && supabaseAdmin) {
      // 1. Naikkan views_count +1
      try {
        const { data: existingArt } = await supabaseAdmin
          .from("user_articles")
          .select("views_count")
          .eq("slug", slug)
          .maybeSingle();
        if (existingArt) {
          await supabaseAdmin
            .from("user_articles")
            .update({ views_count: (existingArt.views_count || 0) + 1 })
            .eq("slug", slug);
        }
      } catch {
        // ignore
      }

      // 2. Ambil detail artikel + profil penulis + komentar & likes komentar
      const { data: article, error } = await supabaseAdmin
        .from("user_articles")
        .select("*, profiles(display_name, avatar_url, role), article_comments(*, profiles(display_name, avatar_url, role))")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !article) {
        return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
      }

      const comments = (article.article_comments || []).map((c: any) => ({
        id: c.id,
        text: c.comment_text,
        created_at: c.created_at,
        likes_count: c.likes_count || 0,
        dislikes_count: c.dislikes_count || 0,
        user_id: c.user_id,
        user_name: c.profiles?.display_name || "Pengguna Mongondow",
        user_avatar: c.profiles?.avatar_url || "",
        user_role: c.profiles?.role || "user",
      }));

      // Sort komentar terbaru di atas
      comments.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return NextResponse.json({
        article: {
          ...article,
          author_name: article.profiles?.display_name || "Kontributor Mongondow",
          author_avatar: article.profiles?.avatar_url || "",
          author_role: article.profiles?.role || "user",
          comments,
        },
      });
    }

    return NextResponse.json({ error: "Database tidak tersedia" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengambil detail artikel" }, { status: 500 });
  }
}

/**
 * POST /api/articles/[slug]
 * Actions: like, dislike, share, comment, like_comment, dislike_comment
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json().catch(() => ({}));
    const action: "like" | "dislike" | "share" | "comment" | "like_comment" | "dislike_comment" = body.action;

    if (action === "comment") {
      const profile = await getCurrentUserProfile().catch(() => null);
      if (!profile) {
        return NextResponse.json(
          { error: "Hanya pengguna terdaftar (login) yang dapat memberikan komentar", requiresAuth: true },
          { status: 401 }
        );
      }

      const text: string = (body.comment_text || "").trim();
      if (!text) {
        return NextResponse.json({ error: "Teks komentar tidak boleh kosong" }, { status: 400 });
      }

      if (isSupabaseReady && supabaseAdmin) {
        const { data: article } = await supabaseAdmin
          .from("user_articles")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (!article) {
          return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
        }

        const { data: newComment, error: commentErr } = await supabaseAdmin
          .from("article_comments")
          .insert({
            article_id: article.id,
            user_id: profile.id,
            comment_text: text,
            likes_count: 0,
            dislikes_count: 0,
          })
          .select("*, profiles(display_name, avatar_url, role)")
          .single();

        if (commentErr) {
          return NextResponse.json({ error: commentErr.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          comment: {
            id: newComment.id,
            text: newComment.comment_text,
            created_at: newComment.created_at,
            likes_count: 0,
            dislikes_count: 0,
            user_id: profile.id,
            user_name: newComment.profiles?.display_name || profile.display_name,
            user_avatar: newComment.profiles?.avatar_url || profile.avatar_url,
            user_role: newComment.profiles?.role || profile.role,
          },
        });
      }
    }

    if (action === "like_comment" || action === "dislike_comment") {
      const commentId = body.comment_id;
      if (!commentId) {
        return NextResponse.json({ error: "ID Komentar tidak valid" }, { status: 400 });
      }

      if (isSupabaseReady && supabaseAdmin) {
        const { data: comm } = await supabaseAdmin
          .from("article_comments")
          .select("likes_count, dislikes_count")
          .eq("id", commentId)
          .maybeSingle();

        if (comm) {
          const field = action === "like_comment" ? "likes_count" : "dislikes_count";
          const updatedVal = (comm[field] || 0) + 1;

          await supabaseAdmin
            .from("article_comments")
            .update({ [field]: updatedVal })
            .eq("id", commentId);

          return NextResponse.json({ success: true, updated_count: updatedVal });
        }
      }
    }

    if (action === "like" || action === "dislike" || action === "share") {
      if (isSupabaseReady && supabaseAdmin) {
        const { data: article } = await supabaseAdmin
          .from("user_articles")
          .select("likes_count, dislikes_count, shares_count")
          .eq("slug", slug)
          .maybeSingle();

        if (article) {
          const field = action === "like" ? "likes_count" : action === "dislike" ? "dislikes_count" : "shares_count";
          const updatedVal = (article[field] || 0) + 1;

          await supabaseAdmin
            .from("user_articles")
            .update({ [field]: updatedVal })
            .eq("slug", slug);

          return NextResponse.json({ success: true, updated_count: updatedVal });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses interaksi artikel" }, { status: 500 });
  }
}

/**
 * PUT /api/articles/[slug]
 * Mengedit artikel & mencatat log audit riwayat perubahan artikel
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const profile = await getCurrentUserProfile().catch(() => null);

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isSupabaseReady || !supabaseAdmin) {
      return NextResponse.json({ error: "Database tidak tersedia" }, { status: 503 });
    }

    const { data: article } = await supabaseAdmin
      .from("user_articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    const isOwner = article.author_id === profile.id;
    const roleStr = String(profile.role);
    const isAdmin = roleStr === "admin" || roleStr === "owner" || roleStr === "developer";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Anda tidak berhak mengedit artikel ini" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const title: string = (body.title || article.title).trim();
    const category: string = body.category || article.category;
    const region: string = body.region || article.region;
    const excerpt: string = (body.excerpt || article.excerpt).trim();
    const content: string = (body.content || article.content).trim();
    const coverImage: string = body.cover_image !== undefined ? body.cover_image : article.cover_image;

    const updatedData = {
      title,
      category,
      region,
      excerpt: excerpt || title,
      content,
      cover_image: coverImage,
      updated_at: new Date().toISOString(),
    };

    const { data: updatedArt, error: updateErr } = await supabaseAdmin
      .from("user_articles")
      .update(updatedData)
      .eq("id", article.id)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // CATAT KE AUDIT LOG REKAM EDITS
    await logAudit({
      action: "edit_article",
      actorEmail: profile.email,
      targetType: "user_articles",
      targetId: article.id,
      detail: {
        slug: article.slug,
        title_before: article.title,
        title_after: title,
        editor_id: profile.id,
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, article: updatedArt, slug: article.slug });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengedit artikel" }, { status: 500 });
  }
}
