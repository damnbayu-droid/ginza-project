'use client';

import { useState, useEffect } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";
import {
  FileText,
  Search,
  Filter,
  ShieldAlert,
  Ban,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Edit2,
  ExternalLink,
  MapPin,
  Eye,
  AlertTriangle
} from "lucide-react";

interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  category: string;
  region: string;
  excerpt: string;
  content: string;
  views_count: number;
  likes_count: number;
  dislikes_count: number;
  comments_count: number;
  fyp_score: number;
  status: "published" | "warning" | "banned";
  created_at: string;
  author_name: string;
  author_avatar?: string;
  author_role?: string;
}

export default function ArtikelManagementPanel() {
  const [articles, setArticles] = useState<AdminArticle[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters & Advance Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [regionFilter, setRegionFilter] = useState("Semua");

  // Modals & Sensor State
  const [selectedArticle, setSelectedArticle] = useState<AdminArticle | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const [commentText, setCommentText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadArticles();
  }, [statusFilter, categoryFilter, regionFilter]);

  async function loadArticles() {
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "Semua") params.set("status", statusFilter);
      if (categoryFilter !== "Semua") params.set("category", categoryFilter);
      if (regionFilter !== "Semua") params.set("region", regionFilter);

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setArticles(data.articles || []);
      } else {
        setError(data.error || "Gagal memuat artikel.");
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data.");
    }
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadArticles();
  }

  async function executeSensorAction(action: "warning" | "ban" | "unban" | "edit" | "like") {
    if (!selectedArticle) return;
    setProcessing(true);
    setActionSuccess(null);

    try {
      const res = await fetch("/api/admin/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: selectedArticle.id,
          action,
          title: editTitle.trim(),
          content: editContent.trim(),
          warningMessage: warningMessage.trim(),
        }),
      });

      const data = await res.json();
      setProcessing(false);

      if (res.ok && data.success) {
        setActionSuccess(`Aksi ${action.toUpperCase()} berhasil diterapkan.`);
        loadArticles();
        if (action === "like") {
          setSelectedArticle({
            ...selectedArticle,
            likes_count: selectedArticle.likes_count + 1,
          });
        }
      } else {
        alert(data.error || "Gagal memproses aksi.");
      }
    } catch (err: any) {
      setProcessing(false);
      alert(`Gagal: ${err.message}`);
    }
  }

  async function handleAdminComment(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedArticle || !commentText.trim()) return;

    setProcessing(true);
    try {
      const res = await fetch(`/api/articles/${selectedArticle.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "comment", comment_text: `[ADMIN VERIFIED]: ${commentText.trim()}` }),
      });

      setProcessing(false);
      if (res.ok) {
        setCommentText("");
        setActionSuccess("Komentar Admin berhasil ditambahkan!");
        loadArticles();
      } else {
        alert("Gagal menambahkan komentar Admin.");
      }
    } catch {
      setProcessing(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!articles) return <LoadingState />;

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Kelola Artikel Publik (Admin Control & Sensor)"
        subtitle="Manajemen penuh seluruh artikel publik: Advance Search, tanggapi dengan Komen & Like, beri Peringatan (Warning), atau Banned/Arsipkan."
      />

      {/* Advance Search & Filter Bar */}
      <Card className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-bento-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, kata kunci, slug, atau nama penulis..."
              className="w-full rounded-xl border border-bento-border bg-bento-surface pl-9 pr-4 py-2.5 text-xs text-bento-text-primary outline-none focus:border-bento-accent"
            />
          </div>
          <Button type="submit">Cari Artikel</Button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-bento-border text-xs">
          <span className="font-semibold text-bento-text-secondary flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-bento-accent" /> Filter Status:
          </span>
          {["Semua", "published", "warning", "banned"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold uppercase text-[10px] transition-all ${
                statusFilter === st
                  ? "bg-bento-accent text-white"
                  : "bg-bento-surface border border-bento-border text-bento-text-secondary hover:text-bento-text-primary"
              }`}
            >
              {st}
            </button>
          ))}

          <span className="font-semibold text-bento-text-secondary ml-4">Daerah:</span>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="bg-bento-surface border border-bento-border text-xs text-bento-text-primary px-2.5 py-1 rounded-lg outline-none"
          >
            <option value="Semua">Semua Wilayah</option>
            <option value="Boltim">Boltim</option>
            <option value="Bolsel">Bolsel</option>
            <option value="Bolmut">Bolmut</option>
            <option value="Bolmong">Bolmong</option>
            <option value="Kotamobagu">Kotamobagu</option>
          </select>
        </div>
      </Card>

      {/* Articles Table Display */}
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-bento-surface-lighter text-bento-text-secondary uppercase">
            <tr>
              <th className="text-left px-4 py-3">Artikel & Penulis</th>
              <th className="text-left px-4 py-3">Kategori / Wilayah</th>
              <th className="text-center px-4 py-3">Views / FYP</th>
              <th className="text-center px-4 py-3">Interaksi</th>
              <th className="text-center px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Aksi Admin</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-bento-text-secondary">
                  Tidak ditemukan artikel yang sesuai kriteria pencarian.
                </td>
              </tr>
            )}
            {articles.map((art) => (
              <tr key={art.id} className="border-t border-bento-border hover:bg-bento-surface/50 transition-colors">
                <td className="px-4 py-3 space-y-1">
                  <a
                    href={`/artikel/${art.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-bento-text-primary hover:text-bento-accent transition-colors flex items-center gap-1.5 line-clamp-1"
                  >
                    <span>{art.title}</span>
                    <ExternalLink className="w-3 h-3 text-bento-text-secondary shrink-0" />
                  </a>
                  <p className="text-[11px] text-bento-text-secondary truncate">
                    Oleh: <span className="font-semibold text-bento-text-primary">{art.author_name}</span> ({art.author_role})
                  </p>
                </td>

                <td className="px-4 py-3 space-y-1">
                  <p className="font-semibold text-purple-400">{art.category}</p>
                  <p className="text-[10px] text-bento-text-secondary">📍 {art.region}</p>
                </td>

                <td className="px-4 py-3 text-center space-y-1 font-mono">
                  <p className="flex items-center justify-center gap-1 text-blue-400 font-bold">
                    <Eye className="w-3.5 h-3.5" /> {art.views_count}
                  </p>
                  <p className="text-[10px] text-amber-400 font-semibold">Skor FYP: {art.fyp_score}</p>
                </td>

                <td className="px-4 py-3 text-center space-y-1 font-mono text-[11px]">
                  <p className="text-emerald-400">👍 {art.likes_count} | 👎 {art.dislikes_count}</p>
                  <p className="text-amber-400">💬 {art.comments_count} Komen</p>
                </td>

                <td className="px-4 py-3 text-center">
                  {art.status === "published" && <Badge tone="success">Published</Badge>}
                  {art.status === "warning" && <Badge tone="warning">⚠️ Warning</Badge>}
                  {art.status === "banned" && <Badge tone="danger">🚫 Banned</Badge>}
                </td>

                <td className="px-4 py-3 text-right space-x-1.5">
                  <Button
                    onClick={() => {
                      setSelectedArticle(art);
                      setEditTitle(art.title);
                      setEditContent(art.content);
                      setWarningMessage("");
                      setActionSuccess(null);
                    }}
                  >
                    Panel Sensor
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Sensor & Action Drawer/Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bento-surface border border-bento-border rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-bento-border pb-4">
              <h2 className="text-base font-bold text-bento-text-primary flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-bento-accent" />
                <span>Panel Sensor Admin: {selectedArticle.title}</span>
              </h2>
              <button onClick={() => setSelectedArticle(null)} className="text-xs text-bento-text-secondary hover:text-white">
                ✕ Tutup
              </button>
            </div>

            {actionSuccess && (
              <p className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                ✓ {actionSuccess}
              </p>
            )}

            {/* Quick Admin Actions Row */}
            <div className="flex flex-wrap items-center gap-2 p-3 bg-bento-bg border border-bento-border rounded-2xl">
              <span className="text-xs font-bold text-bento-text-secondary mr-2">Aksi Cepat:</span>
              <button
                onClick={() => executeSensorAction("like")}
                disabled={processing}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 flex items-center gap-1"
              >
                <ThumbsUp className="w-3.5 h-3.5" /> Like Admin (+1)
              </button>

              {selectedArticle.status !== "warning" ? (
                <button
                  onClick={() => executeSensorAction("warning")}
                  disabled={processing}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Beri Warning
                </button>
              ) : (
                <button
                  onClick={() => executeSensorAction("unban")}
                  disabled={processing}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20"
                >
                  Cabut Warning
                </button>
              )}

              {selectedArticle.status !== "banned" ? (
                <button
                  onClick={() => executeSensorAction("ban")}
                  disabled={processing}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500/20 flex items-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" /> Banned / Arsipkan
                </button>
              ) : (
                <button
                  onClick={() => executeSensorAction("unban")}
                  disabled={processing}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20"
                >
                  Pulihkan Artikel
                </button>
              )}
            </div>

            {/* Admin Warning Custom Message */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-bento-text-primary">Pesan Peringatan Khusus (Opsional)</label>
              <input
                type="text"
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                placeholder="Contoh: Harap sertakan sumber sejarah resmi dalam 24 jam..."
                className="w-full bg-bento-bg border border-bento-border text-xs text-bento-text-primary p-2.5 rounded-xl focus:outline-none focus:border-bento-accent"
              />
            </div>

            {/* Admin Comment Section */}
            <form onSubmit={handleAdminComment} className="space-y-2 pt-2 border-t border-bento-border">
              <label className="text-xs font-bold text-bento-text-primary flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-bento-accent" /> Tambah Komentar / Tanggapan Admin
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Tuliskan komentar resmi Admin..."
                  className="flex-1 bg-bento-bg border border-bento-border text-xs text-bento-text-primary p-2.5 rounded-xl focus:outline-none focus:border-bento-accent"
                />
                <Button type="submit" disabled={processing || !commentText.trim()}>
                  Kirim Komentar
                </Button>
              </div>
            </form>

            {/* Admin Edit Content Form */}
            <div className="space-y-3 pt-2 border-t border-bento-border">
              <h3 className="text-xs font-bold text-bento-text-primary flex items-center gap-1.5">
                <Edit2 className="w-4 h-4 text-purple-400" /> Edit Judul & Isi Artikel (Direct Admin Override)
              </h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-bento-bg border border-bento-border text-xs text-bento-text-primary p-2.5 rounded-xl focus:outline-none focus:border-bento-accent"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full bg-bento-bg border border-bento-border text-xs text-bento-text-primary p-2.5 rounded-xl focus:outline-none focus:border-bento-accent font-mono"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button onClick={() => executeSensorAction("edit")} disabled={processing}>
                  Simpan Perubahan Artikel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
