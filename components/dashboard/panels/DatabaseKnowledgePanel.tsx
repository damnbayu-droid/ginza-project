'use client';

import { useEffect, useState, useRef } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";
import { Plus, Edit2, Eye, FileText, Image as ImageIcon, ImagePlus, Upload, CheckCircle2, RotateCcw, X, Search, Layers, Sparkles, Loader2 } from "lucide-react";
import { uploadContentImage, insertAtCursor } from "@/lib/upload-content-image";

interface CategoryRow {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  display_order: number;
  visit_count: number;
  is_active: boolean;
}

interface ArticleRow {
  id?: string;
  category_id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  cover_image_url?: string | null;
  status: "draft" | "pending_review" | "published" | "archived";
  view_count?: number;
  source_note?: string | null;
  created_at?: string;
  updated_at?: string;
}

export default function DatabaseKnowledgePanel() {
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);
  const [articles, setArticles] = useState<ArticleRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  // Category Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  // Article Media/Post Editor Modal State
  const [editingArticle, setEditingArticle] = useState<ArticleRow | null>(null);
  const [isNewArticle, setIsNewArticle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConvertingImage, setIsConvertingImage] = useState(false);
  const [isUploadingBodyImage, setIsUploadingBodyImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyImageInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  function loadData() {
    setError(null);
    fetch("/api/admin/knowledge")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else {
          setCategories(d.categories);
          setArticles(d.articles);
        }
      })
      .catch((e) => setError(String(e)));
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateNewArticle = () => {
    const defaultCatId = categories && categories.length > 0 ? categories[0].id : "";
    setIsNewArticle(true);
    setEditingArticle({
      title: "",
      slug: "",
      category_id: defaultCatId,
      summary: "",
      content: "",
      cover_image_url: "",
      status: "published",
      source_note: "Ditulis oleh Admin MongondowPedia",
    });
  };

  const handleEditArticle = (article: ArticleRow) => {
    setIsNewArticle(false);
    setEditingArticle({ ...article });
  };

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (newTitle: string) => {
    if (!editingArticle) return;
    const autoSlug = generateSlugFromTitle(newTitle);
    setEditingArticle({
      ...editingArticle,
      title: newTitle,
      slug: isNewArticle ? autoSlug : editingArticle.slug || autoSlug,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingArticle) return;

    setIsConvertingImage(true);
    try {
      const url = await uploadContentImage(file, "knowledge");
      setEditingArticle({
        ...editingArticle,
        cover_image_url: url,
      });
    } catch (err: any) {
      alert(`Gagal mengunggah gambar: ${err.message}`);
    } finally {
      setIsConvertingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Sisip gambar ke DALAM isi artikel Knowledge, di posisi kursor -- sebelumnya
  // Knowledge Base sama sekali tidak punya cara menaruh gambar di badan konten.
  const handleBodyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingArticle) return;

    setIsUploadingBodyImage(true);
    try {
      const url = await uploadContentImage(file, "knowledge");
      const alt = file.name.replace(/\.[^/.]+$/, "");
      const currentContent = editingArticle.content || "";
      const { text, cursorPos } = insertAtCursor(contentTextareaRef.current, currentContent, `\n\n![${alt}](${url})\n\n`);
      setEditingArticle({ ...editingArticle, content: text });
      requestAnimationFrame(() => {
        const el = contentTextareaRef.current;
        if (el) {
          el.focus();
          el.setSelectionRange(cursorPos, cursorPos);
        }
      });
    } catch (err: any) {
      alert(`Gagal mengunggah gambar: ${err.message}`);
    } finally {
      setIsUploadingBodyImage(false);
      if (bodyImageInputRef.current) bodyImageInputRef.current.value = "";
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle || !editingArticle.title.trim() || !editingArticle.content.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          article: editingArticle,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(`Gagal menerbitkan artikel: ${data.error || "Terjadi kesalahan"}`);
      } else {
        setEditingArticle(null);
        loadData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = generateSlugFromTitle(newCatName);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          category: {
            slug,
            name: newCatName.trim(),
            description: newCatDesc.trim() || null,
            display_order: (categories?.length || 0) * 10 + 10,
          },
        }),
      });

      if (res.ok) {
        setNewCatName("");
        setNewCatDesc("");
        setShowCategoryModal(false);
        loadData();
      } else {
        const d = await res.json();
        alert(`Gagal menambah kategori: ${d.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleTogglePublishStatus = async (article: ArticleRow) => {
    const newStatus = article.status === "published" ? "draft" : "published";
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          article: { id: article.id, slug: article.slug, status: newStatus },
        }),
      });

      if (res.ok) {
        loadData();
      } else {
        const d = await res.json();
        alert(`Gagal memperbarui status: ${d.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  if (error) return <ErrorState message={error} />;
  if (!categories || !articles) return <LoadingState label="Memuat database pengetahuan..." />;

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? "Tanpa Kategori";

  const filteredArticles = articles.filter((a) => {
    const matchSearch = search === "" || a.title.toLowerCase().includes(search.toLowerCase()) || (a.summary || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategoryFilter === "" || a.category_id === selectedCategoryFilter;
    return matchSearch && matchCategory;
  });

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Database Knowledge & Media Berita"
        subtitle="Kelola artikel, berita, sejarah, adat budaya, serta kategori/tab publik MongondowPedia secara terpusat."
      />

      {/* Overview Category / Tab Cards Bar */}
      <Card className="!p-4 bg-bento-surface border border-bento-border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-bento-accent" />
            <h3 className="text-sm font-bold text-bento-text-primary">
              Kategori / Tab Aktif ({categories.length})
            </h3>
          </div>
          <Button onClick={() => setShowCategoryModal(true)} variant="default" className="!py-1 text-xs flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Tab Kategori</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              selectedCategoryFilter === ""
                ? "bg-bento-accent text-white border-bento-accent shadow-sm"
                : "bg-bento-surface-lighter text-bento-text-secondary border-bento-border hover:border-bento-accent"
            }`}
          >
            Semua Artikel ({articles.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryFilter(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                selectedCategoryFilter === c.id
                  ? "bg-bento-accent text-white border-bento-accent shadow-sm"
                  : "bg-bento-surface-lighter text-bento-text-secondary border-bento-border hover:border-bento-accent"
              }`}
            >
              <span>{c.name}</span>
              <span className="text-[10px] opacity-75 font-mono">({c.visit_count} views)</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Controls Bar: Search & Create Article Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-bento-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul artikel atau isi berita..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-bento-border bg-bento-surface text-sm outline-none focus:border-bento-accent transition-colors"
          />
        </div>

        <Button onClick={handleCreateNewArticle} variant="primary" className="flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" />
          <span>Buat Postingan Artikel Baru</span>
        </Button>
      </div>

      {/* Articles Data Table */}
      <Card className="!p-0 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-bento-surface-lighter text-bento-text-secondary text-xs uppercase tracking-wider border-b border-bento-border">
              <tr>
                <th className="px-4 py-3">Gambar</th>
                <th className="px-4 py-3">Judul Artikel / Postingan</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Pembaca (Views)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi Editor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bento-border">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-bento-text-secondary">
                    Tidak ada artikel yang ditemukan untuk filter ini.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((a) => (
                  <tr key={a.id || a.slug} className="hover:bg-bento-surface-lighter/50 transition-colors group">
                    {/* Cover Image Thumbnail */}
                    <td className="px-4 py-3 w-16">
                      {a.cover_image_url ? (
                        <img
                          src={a.cover_image_url}
                          alt={a.title}
                          className="w-12 h-9 object-cover rounded-lg border border-bento-border shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-9 rounded-lg bg-bento-surface-lighter border border-bento-border flex items-center justify-center text-bento-text-secondary">
                          <ImageIcon className="w-4 h-4 opacity-40" />
                        </div>
                      )}
                    </td>

                    {/* Judul & Summary */}
                    <td className="px-4 py-3 max-w-md">
                      <button
                        onClick={() => handleEditArticle(a)}
                        className="font-semibold text-bento-text-primary hover:text-bento-accent text-left block transition-colors"
                      >
                        {a.title}
                      </button>
                      {a.summary && (
                        <p className="text-xs text-bento-text-secondary truncate max-w-sm mt-0.5">{a.summary}</p>
                      )}
                    </td>

                    {/* Kategori */}
                    <td className="px-4 py-3 text-xs text-bento-text-secondary">
                      <span className="bg-bento-surface-lighter px-2.5 py-1 rounded-lg border border-bento-border font-medium">
                        {getCategoryName(a.category_id)}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="px-4 py-3 text-xs font-mono text-bento-text-secondary">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-bento-accent" />
                        <span>{a.view_count || 0}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge tone={a.status === "published" ? "success" : a.status === "pending_review" ? "warning" : "default"}>
                        {a.status === "published" ? "Terbit" : a.status === "pending_review" ? "Peninjauan" : "Draft"}
                      </Badge>
                    </td>

                    {/* Aksi Editor */}
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      <Button onClick={() => handleEditArticle(a)} variant="default" className="!py-1 !px-2.5 text-xs inline-flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Artikel</span>
                      </Button>

                      {a.status === "published" ? (
                        <Button
                          onClick={() => handleTogglePublishStatus(a)}
                          variant="default"
                          className="!py-1 !px-2.5 text-xs text-amber-500 border-amber-500/30 hover:bg-amber-500/10 inline-flex items-center gap-1"
                          title="Kembalikan artikel ke Draft"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Ke Draft</span>
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleTogglePublishStatus(a)}
                          variant="primary"
                          className="!py-1 !px-2.5 text-xs inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Terbitkan</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 1. MODAL POSTINGAN MEDIA / NEWS / ARTIKEL EDITOR */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {editingArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingArticle(null);
          }}
        >
          <div className="relative w-full max-w-4xl bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-bento-accent" />
                <div>
                  <h3 className="text-base font-bold text-bento-text-primary">
                    {isNewArticle ? "Buat Postingan Media / Artikel Baru" : `Edit Postingan: "${editingArticle.title}"`}
                  </h3>
                  <p className="text-xs text-bento-text-secondary">
                    Format postingan berita, media informasi, atau pengetahuan MongondowPedia.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingArticle(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Judul & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-bento-text-primary mb-1">
                    Judul Artikel / Berita *
                  </label>
                  <input
                    required
                    value={editingArticle.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Sejarah Kerajaan Bolaang Mongondow Abad ke-17..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm font-medium outline-none focus:border-bento-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                    Slug URL *
                  </label>
                  <input
                    required
                    value={editingArticle.slug}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    placeholder="sejarah-kerajaan-bolaang-mongondow"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-xs font-mono outline-none focus:border-bento-accent"
                  />
                </div>
              </div>

              {/* Kategori & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                    Kategori / Tab Publik *
                  </label>
                  <select
                    required
                    value={editingArticle.category_id}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                    Status Penerbitan
                  </label>
                  <select
                    value={editingArticle.status}
                    onChange={(e) => setEditingArticle({ ...editingArticle, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm font-semibold outline-none focus:border-bento-accent"
                  >
                    <option value="published">Terbit Publik (Published)</option>
                    <option value="draft">Simpan Draft</option>
                    <option value="pending_review">Menunggu Peninjauan</option>
                    <option value="archived">Diarsipkan</option>
                  </select>
                </div>
              </div>

              {/* Upload Foto / Gambar (Convert to WebP) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-bento-text-primary">
                  Foto Sampul / Gambar Artikel (Maks 2MB, Konversi Otomatis ke WebP Jernih & Ringan)
                </label>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border border-bento-border bg-bento-surface-lighter/50">
                  {editingArticle.cover_image_url ? (
                    <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-bento-border shrink-0 shadow-sm">
                      <img src={editingArticle.cover_image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditingArticle({ ...editingArticle, cover_image_url: "" })}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white p-1 rounded-full text-xs"
                        title="Hapus gambar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-20 rounded-xl border-2 border-dashed border-bento-border bg-bento-surface flex flex-col items-center justify-center text-bento-text-secondary shrink-0">
                      <ImageIcon className="w-6 h-6 opacity-40 mb-1" />
                      <span className="text-[10px]">Belum ada foto</span>
                    </div>
                  )}

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isConvertingImage}
                      className="flex items-center gap-2 text-xs"
                    >
                      <Upload className="w-4 h-4 text-bento-accent" />
                      <span>{isConvertingImage ? "Mengunggah..." : "Upload Foto / Pilih Gambar"}</span>
                    </Button>
                    <p className="text-[11px] text-bento-text-secondary leading-normal">
                      Gambar otomatis dikompres ke format <strong>WebP</strong> (ukuran file kecil, gambar tetap jernih).
                    </p>
                  </div>
                </div>
              </div>

              {/* Deskripsi Singkat */}
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  Deskripsi Singkat / Ringkasan Postingan (Summary)
                </label>
                <textarea
                  rows={2}
                  value={editingArticle.summary || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                  placeholder="Ringkasan singkat artikel yang akan tampil di halaman depan..."
                  className="w-full px-3.5 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              {/* Deskripsi Panjang / Isi Artikel */}
              <div>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                  <label className="block text-xs font-bold text-bento-text-primary">
                    Deskripsi Panjang / Isi Artikel Lengkap * (Mendukung Markdown & Teks Berformat)
                  </label>
                  <input
                    type="file"
                    ref={bodyImageInputRef}
                    onChange={handleBodyImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => bodyImageInputRef.current?.click()}
                    disabled={isUploadingBodyImage}
                    className="!py-1 !px-2.5 text-[11px] flex items-center gap-1.5"
                  >
                    {isUploadingBodyImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-bento-accent" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="w-3.5 h-3.5 text-bento-accent" />
                        <span>Sisipkan Gambar di Kursor (maks 2MB)</span>
                      </>
                    )}
                  </Button>
                </div>
                <textarea
                  ref={contentTextareaRef}
                  required
                  rows={10}
                  value={editingArticle.content || ""}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  placeholder="Tuliskan isi artikel lengkap di sini... Anda bisa menggunakan pemformatan Markdown (# Judul, **teks tebal**, gambar, dll). Letakkan kursor di posisi yang diinginkan lalu klik 'Sisipkan Gambar di Kursor' untuk menaruh foto di sana."
                  className="w-full px-3.5 py-3 rounded-xl border border-bento-border bg-bento-bg text-sm font-mono leading-relaxed outline-none focus:border-bento-accent"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-bento-border flex items-center justify-between">
                <p className="text-xs text-bento-text-secondary">
                  * Seluruh artikel akan otomatis diindeks oleh Bogani AI Knowledge.
                </p>
                <div className="flex items-center gap-3">
                  <Button type="button" variant="default" onClick={() => setEditingArticle(null)}>
                    Batal
                  </Button>
                  <Button type="submit" variant="primary" disabled={isSaving || isConvertingImage} className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{isSaving ? "Menerbitkan..." : "CTA Terbitkan Artikel"}</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 2. MODAL TAMBAH KATEGORI / TAB BARU */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCategoryModal(false);
          }}
        >
          <div className="relative w-full max-w-md bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-bento-accent" />
                <h4 className="text-sm font-bold text-bento-text-primary">Tambah Tab / Kategori Baru</h4>
              </div>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  Nama Tab / Kategori *
                </label>
                <input
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Contoh: Tokoh Adat, Kuliner Khas..."
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  Deskripsi Kategori (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Penjelasan singkat mengenai kategori ini..."
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              <div className="pt-3 border-t border-bento-border flex items-center justify-end gap-2">
                <Button type="button" variant="default" onClick={() => setShowCategoryModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary">
                  Tambah Kategori
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
