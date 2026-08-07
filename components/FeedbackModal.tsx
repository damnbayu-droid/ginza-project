'use client';

import { useState } from "react";
import { X, Send, CheckCircle2, MessageSquare, Star, AlertCircle, ClipboardList } from "lucide-react";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultName?: string;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "kuisioner", label: "Kuisioner Umum" },
  { key: "saran_fitur", label: "Saran Fitur" },
  { key: "bug", label: "Laporan Bug" },
  { key: "kritik", label: "Kritik" },
  { key: "lainnya", label: "Lainnya" },
];

export default function FeedbackModal({ isOpen, onClose, defaultEmail = "", defaultName = "" }: FeedbackModalProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [category, setCategory] = useState("kuisioner");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!message.trim()) {
      setErrorMsg("Isi masukan Anda wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          category,
          rating: rating > 0 ? rating : undefined,
          message: message.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim feedback.");
      setSuccess(true);
      setMessage("");
      setRating(0);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat mengirim feedback.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccess(false);
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-sans">
      <div className="relative w-full max-w-lg bg-[#0F1017] border border-[#252839] rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8 space-y-6">

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Kritik, Saran & Kuisioner</h3>
              <p className="text-xs text-gray-400">Bantu kami menyempurnakan MongondowPedia selama masa percobaan</p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-full hover:bg-[#1A1C2A] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Terima Kasih!</h4>
              <p className="text-xs text-gray-300 max-w-sm mx-auto mt-1 leading-relaxed">
                Masukan Anda sudah tercatat dan akan ditinjau tim MongondowPedia.
              </p>
            </div>
            <button
              onClick={handleResetAndClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25"
            >
              Selesai & Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Kategori</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setCategory(c.key)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${
                      category === c.key
                        ? "bg-purple-600/25 border-purple-500 text-white"
                        : "bg-[#161824] border-[#272B3E] text-gray-400 hover:text-white"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating bintang (opsional) */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Penilaian Pengalaman (Opsional)</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? 0 : star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-600"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Nama & Email opsional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Nama (Opsional)</label>
                <input
                  type="text"
                  placeholder="Nama Anda..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#161824] border border-[#272B3E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Email (Opsional)</label>
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#161824] border border-[#272B3E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Pesan */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> <span>Masukan Anda *</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Ceritakan pengalaman, saran, atau kendala Anda memakai Bogani AI / MongondowPedia..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#161824] border border-[#272B3E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-all resize-none"
              />
            </div>

            <div className="pt-1 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2.5 rounded-xl bg-[#161824] hover:bg-[#202336] border border-[#272B3E] text-gray-300 text-xs font-semibold transition-all"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2"
              >
                {loading ? <span>Mengirim...</span> : (<><Send className="w-4 h-4" /><span>Kirim</span></>)}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
