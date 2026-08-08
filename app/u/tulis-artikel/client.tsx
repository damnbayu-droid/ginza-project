'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PenTool,
  ArrowLeft,
  Sparkles,
  Send,
  FileText,
  Image as ImageIcon,
  Tag,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
  Loader2,
  Edit3
} from "lucide-react";

interface Props {
  userEmail: string;
  userRole: string;
}

const CATEGORIES = [
  "Pengetahuan & Sejarah",
  "Bahasa & Sastra",
  "Adat & Tradisi",
  "Opini & Budaya",
  "Musik & Seni",
  "Opini Publik",
];

const REGIONS = [
  "Umum",
  "Kotamobagu",
  "Bolmong",
  "Boltim",
  "Bolmut",
  "Bolsel",
];

/**
 * Utility client-side untuk menkonversi file gambar (JPG/PNG/GIF/HEIC)
 * menjadi format WebP berkualitas tinggi dengan ukuran file yang sangat kecil & jernih (tanpa blur).
 */
function compressImageToWebP(file: File, maxWidth = 1600, quality = 0.88): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat format gambar"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Gagal menginisialisasi canvas"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to WebP data URL with crisp quality (0.88)
        const webpDataUrl = canvas.toDataURL("image/webp", quality);
        resolve(webpDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function WriteArticleClient({ userEmail, userRole }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Pengetahuan & Sejarah");
  const [region, setRegion] = useState("Umum");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [forbiddenEdit, setForbiddenEdit] = useState(false);

  // Prefill jika mode edit (?edit=[slug])
  useEffect(() => {
    if (editSlug) {
      setIsEditMode(true);
      setLoadingInitial(true);
      fetch(`/api/articles/${editSlug}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.article) {
            const isAuthor =
              data.article.author_id === userEmail ||
              data.article.author_name === userEmail ||
              data.article.author_email === userEmail ||
              data.article.profiles?.email === userEmail;
            const isAdmin = userRole === "admin" || userRole === "owner" || userRole === "developer";

            if (!isAuthor && !isAdmin) {
              setError("Akses ditolak: Hanya penulis asli (publisher) yang berhak mengedit artikel ini.");
              setForbiddenEdit(true);
            } else {
              setTitle(data.article.title || "");
              setCategory(data.article.category || "Pengetahuan & Sejarah");
              setRegion(data.article.region || "Umum");
              setExcerpt(data.article.excerpt || "");
              setCoverImage(data.article.cover_image || "");
              setContent(data.article.content || "");
            }
          } else {
            setError("Artikel yang ingin diedit tidak ditemukan.");
          }
        })
        .catch((err) => setError("Gagal memuat data artikel untuk diedit."))
        .finally(() => setLoadingInitial(false));
    }
  }, [editSlug, userEmail, userRole]);

  // Handler Upload Foto dengan Otomatis Konversi ke WebP Jernih Ukuran Kecil
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploadingImage(true);

    try {
      // Convert ke WebP
      const webpUrl = await compressImageToWebP(file);

      // Sisipkan syntax markdown ke dalam textarea konten
      const imageMarkdown = `\n\n![${file.name.replace(/\.[^/.]+$/, "")}](${webpUrl})\n\n`;
      setContent((prev) => prev + imageMarkdown);

      // Set sebagai cover image jika cover image masih kosong
      if (!coverImage) {
        setCoverImage(webpUrl);
      }
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah dan mengonversi gambar ke WebP");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Judul dan Isi artikel wajib diisi!");
      return;
    }

    setSubmitting(true);

    try {
      const endpoint = isEditMode && editSlug ? `/api/articles/${editSlug}` : "/api/articles";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          region,
          excerpt,
          content,
          cover_image: coverImage,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/artikel/${data.slug || editSlug}`);
        }, 1600);
      } else {
        setError(data.error || "Gagal menyimpan artikel. Silakan coba lagi.");
      }
    } catch (err: any) {
      setError(err.message || "Koneksi terganggu. Silakan periksa jaringan Anda.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <main className="min-h-screen bg-[#0d0e12] text-white flex items-center justify-center p-6">
        <div className="flex items-center gap-3 text-sm text-gray-400 bg-[#14151e] p-6 rounded-2xl border border-[#232536]">
          <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
          <span>Memuat data artikel untuk diedit...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d0e12] text-white p-4 md:p-10 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* ── 1. TOP HEADER ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#212330]">
          <div className="space-y-1.5">
            <Link
              href="/artikel"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#171821] hover:bg-[#222433] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-semibold transition-all mb-2 shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span>Kembali ke Halaman Artikel</span>
            </Link>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              {isEditMode ? (
                <>
                  <Edit3 className="w-8 h-8 text-amber-400 shrink-0" />
                  <span>Edit &amp; Perbarui Artikel</span>
                </>
              ) : (
                <>
                  <PenTool className="w-8 h-8 text-purple-400 shrink-0" />
                  <span>Tulis &amp; Terbitkan Artikel Baru</span>
                </>
              )}
            </h1>

            <p className="text-xs md:text-sm text-gray-400 max-w-2xl leading-relaxed">
              {isEditMode
                ? "Perbarui isi artikel Anda. Setiap perubahan akan tersimpan dan riwayat pengeditan terekam di log audit."
                : "Bagikan pengetahuan, riset sejarah, opini budaya, atau sastra Bolaang Mongondow. Artikel Anda akan langsung tersinkronkan dengan feed publik dan profil kontributor Anda."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3.5 py-2 rounded-xl font-semibold">
              {userEmail}
            </span>
          </div>
        </div>

        {/* ── 2. ALERT STATUS ── */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-bold flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400" />
            <div>
              <p>{isEditMode ? "Artikel Berhasil Diperbarui!" : "Artikel Berhasil Diterbitkan! 🎉"}</p>
              <p className="text-xs font-normal text-emerald-400/80 mt-0.5">
                Mengalihkan Anda ke halaman artikel...
              </p>
            </div>
          </div>
        )}

        {/* ── 3. FORMULIR ARTIKEL ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Judul Artikel */}
          <div className="space-y-2 bg-[#14151e] p-5 rounded-2xl border border-[#232536]">
            <label className="block text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Judul Artikel <span className="text-red-400">*</span></span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Peran Falsafah Palu'an kon Komintan dalam Menjaga Kerukunan BMR"
              className="w-full px-4 py-3 bg-[#0d0e12] border border-[#282a3c] focus:border-purple-500 rounded-xl text-sm md:text-base text-white placeholder-gray-500 focus:outline-none transition-all font-semibold"
            />
          </div>

          {/* Kategori & Wilayah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kategori */}
            <div className="space-y-2 bg-[#14151e] p-5 rounded-2xl border border-[#232536]">
              <label className="block text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />
                <span>Kategori Topik</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-[#0d0e12] border border-[#282a3c] focus:border-purple-500 rounded-xl text-xs md:text-sm text-white focus:outline-none transition-all font-medium"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Wilayah */}
            <div className="space-y-2 bg-[#14151e] p-5 rounded-2xl border border-[#232536]">
              <label className="block text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Cakupan Wilayah / Kabupaten</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 bg-[#0d0e12] border border-[#282a3c] focus:border-purple-500 rounded-xl text-xs md:text-sm text-white focus:outline-none transition-all font-medium"
              >
                {REGIONS.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image & Upload CTA */}
          <div className="space-y-5 bg-[#14151e] p-5 rounded-2xl border border-[#232536]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="block text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                <span>URL Gambar Sampul / Cover Image (Opsional)</span>
              </label>

              {/* Hidden File Input & Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Mengonversi ke WebP...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-purple-400" />
                    <span>📷 Upload &amp; Convert Foto WebP</span>
                  </>
                )}
              </button>
            </div>

            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/gambar-sampul.jpg atau gunakan tombol Upload di atas"
              className="w-full px-4 py-2.5 bg-[#0d0e12] border border-[#282a3c] focus:border-purple-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all font-mono"
            />

            {/* Ringkasan */}
            <div className="space-y-2 pt-2 border-t border-[#212330]">
              <label className="block text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center justify-between">
                <span>Ringkasan Singkat (Excerpt)</span>
                <span className="text-[10px] text-gray-400 font-normal">Maks 200 karakter</span>
              </label>
              <input
                type="text"
                maxLength={200}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Tulis ringkasan singkat untuk kartu preview artikel..."
                className="w-full px-4 py-2.5 bg-[#0d0e12] border border-[#282a3c] focus:border-purple-500 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Isi Artikel Markdown */}
          <div className="space-y-2 bg-[#14151e] p-5 rounded-2xl border border-[#232536]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Isi Konten Artikel <span className="text-red-400">*</span></span>
              </label>
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> Format Markdown (# Judul, **bold**, list, quote)
              </span>
            </div>

            <textarea
              required
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan isi artikel Anda di sini..."
              className="w-full p-4 bg-[#0d0e12] border border-[#282a3c] focus:border-purple-500 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none transition-all leading-relaxed font-sans"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-[#212330]">
            <Link
              href="/artikel"
              className="px-5 py-3 rounded-xl bg-[#171821] hover:bg-[#222433] text-gray-300 hover:text-white border border-[#2b2d3e] text-xs font-bold transition-all"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={submitting || success || forbiddenEdit}
              className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs md:text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? "Menyimpan..." : isEditMode ? "Simpan Perubahan Artikel" : "Terbitkan Artikel Sekarang"}</span>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
