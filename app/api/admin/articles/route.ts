import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { isSupabaseReady, supabaseAdmin } from "@/lib/supabase";
import { writeAuditLog } from "@/lib/ginza-db";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const region = searchParams.get("region");

    if (isSupabaseReady && supabaseAdmin) {
      let query = supabaseAdmin
        .from("user_articles")
        .select("*, profiles(display_name, avatar_url, role), article_comments(count)");

      if (status && status !== "Semua") {
        query = query.eq("status", status);
      }
      if (category && category !== "Semua") {
        query = query.eq("category", category);
      }
      if (region && region !== "Semua") {
        query = query.eq("region", region);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,slug.ilike.%${search}%`);
      }

      const { data, error: dbErr } = await query.order("created_at", { ascending: false });

      if (dbErr) {
        return NextResponse.json({ error: dbErr.message }, { status: 500 });
      }

      const articles = (data || []).map((art: any) => {
        const commentsCount = art.article_comments?.[0]?.count ?? 0;
        const fypScore =
          art.views_count * 1 +
          art.shares_count * 3 +
          art.likes_count * 5 -
          art.dislikes_count * 4 +
          commentsCount * 2;

        return {
          ...art,
          comments_count: commentsCount,
          fyp_score: fypScore,
          author_name: art.profiles?.display_name || "Pengguna",
          author_avatar: art.profiles?.avatar_url || "",
          author_role: art.profiles?.role || "user",
        };
      });

      return NextResponse.json({ articles });
    }

    return NextResponse.json({ articles: [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal mengambil daftar artikel admin" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { session, error } = await requireAdmin(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { articleId, action, title, content, warningMessage } = body as {
      articleId: string;
      action: "warning" | "ban" | "unban" | "edit" | "like";
      title?: string;
      content?: string;
      warningMessage?: string;
    };

    if (!articleId || !action) {
      return NextResponse.json({ error: "articleId & action wajib diisi" }, { status: 400 });
    }

    if (isSupabaseReady && supabaseAdmin) {
      if (action === "warning") {
        await supabaseAdmin
          .from("user_articles")
          .update({
            status: "warning",
            excerpt: warningMessage ? `[⚠️ PERINGATAN ADMIN: ${warningMessage}]` : undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", articleId);

        await writeAuditLog({
          actorRole: "admin",
          action: "article_warning_issued",
          targetTable: "user_articles",
          targetId: articleId,
          afterData: { warningMessage },
        });
      } else if (action === "ban") {
        await supabaseAdmin
          .from("user_articles")
          .update({ status: "banned", updated_at: new Date().toISOString() })
          .eq("id", articleId);

        await writeAuditLog({
          actorRole: "admin",
          action: "article_banned",
          targetTable: "user_articles",
          targetId: articleId,
        });
      } else if (action === "unban") {
        await supabaseAdmin
          .from("user_articles")
          .update({ status: "published", updated_at: new Date().toISOString() })
          .eq("id", articleId);

        await writeAuditLog({
          actorRole: "admin",
          action: "article_unbanned",
          targetTable: "user_articles",
          targetId: articleId,
        });
      } else if (action === "edit") {
        if (!title || !content) {
          return NextResponse.json({ error: "Judul & isi artikel wajib diisi" }, { status: 400 });
        }
        await supabaseAdmin
          .from("user_articles")
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq("id", articleId);

        await writeAuditLog({
          actorRole: "admin",
          action: "article_edited_by_admin",
          targetTable: "user_articles",
          targetId: articleId,
        });
      } else if (action === "like") {
        const { data: art } = await supabaseAdmin.from("user_articles").select("likes_count").eq("id", articleId).single();
        if (art) {
          await supabaseAdmin.from("user_articles").update({ likes_count: (art.likes_count || 0) + 1 }).eq("id", articleId);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Database tidak siap" }, { status: 500 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses aksi sensor artikel" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const articleId = searchParams.get("articleId");
    if (!articleId) {
      return NextResponse.json({ error: "articleId wajib diisi" }, { status: 400 });
    }

    if (!isSupabaseReady || !supabaseAdmin) {
      return NextResponse.json({ error: "Database tidak siap" }, { status: 500 });
    }

    const { data: existing } = await supabaseAdmin
      .from("user_articles")
      .select("id, title, slug, author_id")
      .eq("id", articleId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    // article_comments punya ON DELETE CASCADE ke user_articles, jadi
    // komentar ikut terhapus otomatis -- lihat 20260808_user_articles.sql.
    const { error: delErr } = await supabaseAdmin.from("user_articles").delete().eq("id", articleId);
    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    await writeAuditLog({
      actorRole: "admin",
      action: "article_deleted_by_admin",
      targetTable: "user_articles",
      targetId: articleId,
      beforeData: existing,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal menghapus artikel" }, { status: 500 });
  }
}
