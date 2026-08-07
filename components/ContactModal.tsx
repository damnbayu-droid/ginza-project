'use client';

import { useState } from "react";
import { X, Send, CheckCircle2, MessageSquare, Mail, Phone, User, AlertCircle } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
  defaultName?: string;
}

export default function ContactModal({ isOpen, onClose, defaultEmail = "", defaultName = "" }: ContactModalProps) {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [whatsapp, setWhatsapp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg("Nama, Email, dan Isi Pesan wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/public/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim pesan.");
      }

      setSuccess(true);
      setMessage("");
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem saat mengirim pesan.");
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
        
        {/* Header Modal */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Kirim Pesan ke Pengembang</h3>
              <p className="text-xs text-gray-400">Hubungi tim resmi MongondowPedia & Bogani AI</p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-full hover:bg-[#1A1C2A] text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sukses State */}
        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Pesan Berhasil Terkirim!</h4>
              <p className="text-xs text-gray-300 max-w-sm mx-auto mt-1 leading-relaxed">
                Terima kasih atas pesan Anda. Notifikasi telah diteruskan secara otomatis ke email pengembang (<span className="text-blue-400 font-mono">developer@mongondowedia.com</span>).
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
          /* Form Pesan */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-3">
              {/* Field Nama */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" /> <span>Nama Lengkap *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama Anda..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#161824] border border-[#272B3E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              {/* Field Email & Whatsapp (2 Kolom) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> <span>Email *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#161824] border border-[#272B3E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> <span>Nomor Whatsapp (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#161824] border border-[#272B3E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {/* Field Pesan */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-400" /> <span>Pesan / Masukan *</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tuliskan pertanyaan, masukan, atau kendala Anda di sini..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#161824] border border-[#272B3E] text-white text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex items-center justify-end gap-3">
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
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2"
              >
                {loading ? (
                  <span>Mengirim...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Pesan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
