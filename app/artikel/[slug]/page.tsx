'use client';

import { use, useEffect, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Share2,
  MessageSquare,
  Send,
  AlertCircle,
  MapPin,
  Sparkles,
  CheckCircle2,
  Edit3
} from "lucide-react";

interface CommentItem {
  id: string;
  text: string;
  created_at: string;
  likes_count?: number;
  dislikes_count?: number;
  user_id?: string;
  user_name: string;
  user_avatar?: string;
  user_role?: string;
}

interface ArticleDetail {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  category: string;
  region: string;
  excerpt: string;
  content: string;
  cover_image?: string;
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  shares_count: number;
  created_at: string;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
  comments: CommentItem[];
}

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction State
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [userVoted, setUserVoted] = useState<"like" | "dislike" | null>(null);
  const [sharedNotice, setSharedNotice] = useState(false);

  // Comments State
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [requiresAuth, setRequiresAuth] = useState(false);

  const [currentUser, setCurrentUser] = useState<{ id?: string; email?: string; role?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => null);
  }, []);

  const canEdit = Boolean(
    currentUser &&
    article &&
    (
      currentUser.email === article.author_id ||
      currentUser.id === article.author_id ||
      currentUser.email === article.author_name ||
      currentUser.role === "admin" ||
      currentUser.role === "owner" ||
      currentUser.role === "developer"
    )
  );

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  async function fetchArticle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/articles/${slug}`);
      const data = await res.json();
      if (res.ok && data.article) {
        setArticle(data.article);
        setLikesCount(data.article.likes_count || 0);
        setDislikesCount(data.article.dislikes_count || 0);
        setSharesCount(data.article.shares_count || 0);
      } else {
        setError(data.error || "Artikel tidak ditemukan.");
      }
    } catch {
      setError("Gagal memuat artikel.");
    } finally {
      setLoading(false);
    }
  }

  async function handleInteract(action: "like" | "dislike" | "share") {
    if (action === "like") {
      if (userVoted === "like") return;
      setLikesCount((prev) => prev + 1);
      setUserVoted("like");
    } else if (action === "dislike") {
      if (userVoted === "dislike") return;
      setDislikesCount((prev) => prev + 1);
      setUserVoted("dislike");
    } else if (action === "share") {
      setSharesCount((prev) => prev + 1);
      setSharedNotice(true);
      setTimeout(() => setSharedNotice(false), 3000);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
      }
    }

    try {
      await fetch(`/api/articles/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } catch {
      // ignore
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    setCommentError(null);
    setRequiresAuth(false);

    try {
      const res = await fetch(`/api/articles/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", comment_text: commentText.trim() }),
      });

      const data = await res.json();
      setSubmittingComment(false);

      if (res.ok && data.success && data.comment) {
        setCommentText("");
        if (article) {
          setArticle({
            ...article,
            comments: [data.comment, ...article.comments],
          });
        }
      } else {
        if (res.status === 401 || data.requiresAuth) {
          setRequiresAuth(true);
          setCommentError("Hanya pengguna terdaftar (login) yang dapat memposting komentar.");
        } else {
          setCommentError(data.error || "Gagal mengirim komentar.");
        }
      }
    } catch {
      setSubmittingComment(false);
      setCommentError("Terjadi kesalahan jaringan.");
    }
  }

  async function handleCommentInteract(commentId: string, action: "like_comment" | "dislike_comment") {
    if (!article) return;

    setArticle({
      ...article,
      comments: article.comments.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            likes_count: action === "like_comment" ? (c.likes_count || 0) + 1 : c.likes_count || 0,
            dislikes_count: action === "dislike_comment" ? (c.dislikes_count || 0) + 1 : c.dislikes_count || 0,
          };
        }
        return c;
      }),
    });

    try {
      await fetch(`/api/articles/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, comment_id: commentId }),
      });
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
        <p className="text-xs text-gray-400 font-mono">Memuat konten artikel...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white p-6 flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h1 className="text-xl font-bold text-white">{error || "Artikel Tidak Ditemukan"}</h1>
        <Link href="/artikel" className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs">
          Kembali ke Portal Artikel
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white p-4 md:p-10 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Top Navigation Row & Edit Button */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#14151f] hover:bg-[#1f2130] text-gray-300 hover:text-white border border-[#262838] text-xs font-semibold transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>Kembali ke Daftar Artikel</span>
          </Link>

          {canEdit && (
            <Link
              href={`/u/tulis-artikel?edit=${slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
            >
              <Edit3 className="w-4 h-4 text-purple-400" />
              <span>Edit Artikel Ini</span>
            </Link>
          )}
        </div>

        {/* Article Container */}
        <article className="bg-[#14151f] border border-[#262838] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Header Meta */}
          <div className="space-y-4 border-b border-[#232536] pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {article.category}
              </span>
              <span className="px-3 py-1 rounded-full bg-bento-surface text-gray-300 border border-bento-border flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-purple-400" /> {article.region}
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
              {article.title}
            </h1>

            {/* Author & Date Row */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center overflow-hidden border border-purple-500/30">
                  {article.author_avatar ? (
                    <img src={article.author_avatar} alt={article.author_name} className="w-full h-full object-cover" />
                  ) : (
                    article.author_name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-bold text-white">{article.author_name}</p>
                  <p className="text-[11px] text-gray-400 uppercase font-mono">{article.author_role}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono">
                <Calendar className="w-3.5 h-3.5 text-purple-400" />
                <span>{new Date(article.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {article.cover_image && (
            <div className="w-full rounded-2xl overflow-hidden border border-[#262838] bg-[#0c0d14] max-h-96">
              <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Article Body Content */}
          <div className="prose prose-invert max-w-none text-gray-200 text-sm md:text-base leading-relaxed space-y-4 pt-2">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>

          {/* Interaction Bar (Viewer, Like, Dislike, Share) */}
          <div className="pt-6 border-t border-[#232536] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Like Button */}
              <button
                onClick={() => handleInteract("like")}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  userVoted === "like"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                    : "bg-[#181928] border-[#2b2d42] text-gray-300 hover:text-white hover:border-emerald-500/40"
                }`}
              >
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                <span>{likesCount} Suka</span>
              </button>

              {/* Dislike Button */}
              <button
                onClick={() => handleInteract("dislike")}
                className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  userVoted === "dislike"
                    ? "bg-red-500/20 border-red-500 text-red-300"
                    : "bg-[#181928] border-[#2b2d42] text-gray-300 hover:text-white hover:border-red-500/40"
                }`}
              >
                <ThumbsDown className="w-4 h-4 text-red-400" />
                <span>{dislikesCount} Tidak Suka</span>
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1.5 bg-[#181928] px-3 py-1.5 rounded-xl border border-[#262838]">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>{article.views_count || 1} Dibaca</span>
              </span>

              <button
                onClick={() => handleInteract("share")}
                className="flex items-center gap-1.5 bg-[#181928] hover:bg-[#202235] px-3.5 py-1.5 rounded-xl border border-[#262838] text-gray-300 hover:text-white transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4 text-purple-400" />
                <span>{sharesCount} Bagikan</span>
              </button>
            </div>
          </div>

          {sharedNotice && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
              <span>Tautan artikel berhasil disalin ke clipboard! Siap dibagikan.</span>
            </div>
          )}
        </article>

        {/* ── COMMENTS SECTION ── */}
        <section className="bg-[#14151f] border border-[#262838] rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#232536] pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span>Diskusi &amp; Komentar Pembaca ({article.comments.length})</span>
            </h2>
          </div>

          {/* Comment Form (Restricted to Logged In Users) */}
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              placeholder="Tuliskan pandangan atau tanggapan Anda tentang artikel ini..."
              className="w-full bg-[#181928] border border-[#2b2d42] text-xs md:text-sm text-white placeholder-gray-500 p-3.5 rounded-2xl focus:outline-none focus:border-purple-500/60 transition-all resize-none"
            />

            {commentError && (
              <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-medium flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{commentError}</span>
                </span>
                {requiresAuth && (
                  <Link href={`/login?next=/artikel/${slug}`} className="px-3 py-1 bg-purple-600 text-white font-bold text-xs rounded-lg shrink-0">
                    Masuk Akun
                  </Link>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{submittingComment ? "Kirim..." : "Kirim Komentar"}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {article.comments.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Belum ada komentar. Berikan tanggapan pertama Anda!</p>
            ) : (
              article.comments.map((c) => (
                <div key={c.id} className="bg-[#181928] border border-[#262838] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[10px] flex items-center justify-center overflow-hidden">
                        {c.user_avatar ? (
                          <img src={c.user_avatar} alt={c.user_name} className="w-full h-full object-cover" />
                        ) : (
                          c.user_name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <span className="text-xs font-bold text-white">{c.user_name}</span>
                      <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 uppercase font-mono">
                        {c.user_role}
                      </span>
                    </div>

                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(c.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed pl-8">{c.text}</p>

                  {/* Comment Like / Dislike Bar */}
                  <div className="pl-8 pt-1 flex items-center gap-3 text-[11px] text-gray-400">
                    <button
                      type="button"
                      onClick={() => handleCommentInteract(c.id, "like_comment")}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1 font-mono active:scale-95"
                      title="Sukai Komentar"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{c.likes_count || 0}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCommentInteract(c.id, "dislike_comment")}
                      className="hover:text-red-400 transition-colors flex items-center gap-1 font-mono active:scale-95"
                      title="Tidak Suka Komentar"
                    >
                      <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                      <span>{c.dislikes_count || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
