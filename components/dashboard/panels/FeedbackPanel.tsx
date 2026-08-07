'use client';

import { useState, useEffect } from "react";
import { PanelHeader, Card, Badge, LoadingState, ErrorState } from "@/components/dashboard/ui";
import { ClipboardList, Mail, Clock, Star, Archive, CheckCircle2, RefreshCw, Eye } from "lucide-react";
import type { FeedbackSubmissionRow } from "@/lib/ginza-db";

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Laporan Bug",
  saran_fitur: "Saran Fitur",
  kritik: "Kritik",
  kuisioner: "Kuisioner",
  lainnya: "Lainnya",
};

export default function FeedbackPanel() {
  const [feedback, setFeedback] = useState<FeedbackSubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selected, setSelected] = useState<FeedbackSubmissionRow | null>(null);

  const fetchFeedback = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/feedback");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil feedback.");
      setFeedback(data.feedback || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleUpdateStatus = async (id: string, status: FeedbackSubmissionRow["status"]) => {
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memperbarui status.");
      }
      setFeedback((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
      if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, status } : null));
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status feedback.");
    }
  };

  const filtered = feedback.filter((f) => activeFilter === "all" || f.status === activeFilter);
  const newCount = feedback.filter((f) => f.status === "baru").length;
  const avgRating = (() => {
    const rated = feedback.filter((f) => f.rating);
    if (rated.length === 0) return null;
    return (rated.reduce((sum, f) => sum + (f.rating || 0), 0) / rated.length).toFixed(1);
  })();

  if (loading && feedback.length === 0) {
    return <LoadingState label="Memuat feedback & kuisioner pengguna..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PanelHeader
          title="Feedback & Kuisioner"
          subtitle="Masukan pengguna (termasuk tamu) selama masa percobaan, dikirim lewat tombol Feedback di header."
        />
        <button
          onClick={fetchFeedback}
          className="px-3.5 py-2 rounded-xl bg-bento-surface-lighter hover:bg-[#202336] text-bento-text-primary border border-bento-border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && <ErrorState message={error} />}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Masukan</span>
          <span className="text-xl font-bold text-white">{feedback.length}</span>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Belum Ditinjau</span>
          <span className="text-xl font-bold text-amber-400">{newCount}</span>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Rating Rata-rata</span>
          <span className="text-xl font-bold text-white flex items-center gap-1">
            {avgRating ?? "-"} {avgRating && <Star className="w-4 h-4 fill-amber-400 text-amber-400" />}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-[10px] text-gray-400 uppercase font-semibold block">Ditindaklanjuti</span>
          <span className="text-xl font-bold text-emerald-400">{feedback.filter((f) => f.status === "ditindaklanjuti").length}</span>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-[#0F1017] border border-[#232638] overflow-x-auto">
        {[
          { key: "all", label: "Semua", count: feedback.length },
          { key: "baru", label: "Baru", count: newCount, highlight: newCount > 0 },
          { key: "dibaca", label: "Dibaca", count: feedback.filter((f) => f.status === "dibaca").length },
          { key: "ditindaklanjuti", label: "Ditindaklanjuti", count: feedback.filter((f) => f.status === "ditindaklanjuti").length },
          { key: "diarsipkan", label: "Diarsipkan", count: feedback.filter((f) => f.status === "diarsipkan").length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === tab.key
                ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                : "text-gray-400 hover:text-white hover:bg-[#1A1D2D]"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${tab.highlight ? "bg-rose-500 text-white font-bold" : activeFilter === tab.key ? "bg-white/20 text-white" : "bg-[#1E2133] text-gray-400"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Grid: List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={selected ? "lg:col-span-6 space-y-3" : "lg:col-span-12 space-y-3"}>
          {filtered.length === 0 ? (
            <Card className="p-8 text-center text-gray-400 text-xs">
              <ClipboardList className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
              <p>Belum ada feedback dalam kategori ini.</p>
            </Card>
          ) : (
            filtered.map((f) => {
              const isSelected = selected?.id === f.id;
              return (
                <div
                  key={f.id}
                  onClick={() => {
                    setSelected(f);
                    if (f.status === "baru") handleUpdateStatus(f.id, "dibaca");
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected ? "bg-[#161828] border-purple-500/50 shadow-lg shadow-purple-600/10" : f.status === "baru" ? "bg-[#131522] border-purple-500/30" : "bg-[#0F1017] border-[#222538] hover:border-[#2E324A]"
                  }`}
                >
                  {f.status === "baru" && <div className="absolute top-0 left-0 bottom-0 w-1 bg-purple-500" />}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-sm tracking-tight">{f.name || "Tamu Anonim"}</h4>
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-bold uppercase">
                          {CATEGORY_LABELS[f.category] || f.category}
                        </span>
                        {f.rating && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-400 font-bold">
                            {f.rating} <Star className="w-3 h-3 fill-amber-400" />
                          </span>
                        )}
                      </div>
                      {f.email && <p className="text-xs text-gray-400 font-mono">{f.email}</p>}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {new Date(f.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">{f.message}</p>
                  {f.page_url && <p className="text-[10px] text-gray-500 mt-1.5 font-mono">Halaman: {f.page_url}</p>}
                </div>
              );
            })
          )}
        </div>

        {selected && (
          <div className="lg:col-span-6">
            <div className="p-6 rounded-3xl bg-[#11131E] border border-[#282C42] sticky top-6 space-y-5 shadow-xl">
              <div className="flex items-start justify-between border-b border-[#212438] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{selected.name || "Tamu Anonim"}</h3>
                  {selected.email && <p className="text-xs text-blue-400 font-mono">{selected.email}</p>}
                </div>
                <Badge tone={selected.status === "baru" ? "danger" : selected.status === "ditindaklanjuti" ? "success" : "default"}>
                  {selected.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#161828] border border-[#24273C]">
                  <span className="text-[10px] text-gray-400 uppercase block font-semibold">Kategori</span>
                  <span className="text-white font-mono">{CATEGORY_LABELS[selected.category] || selected.category}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161828] border border-[#24273C]">
                  <span className="text-[10px] text-gray-400 uppercase block font-semibold">Rating</span>
                  <span className="text-white font-mono">{selected.rating ? `${selected.rating} / 5` : "Tidak diisi"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0B0C12] border border-[#212438] space-y-2">
                <span className="text-xs font-semibold text-gray-400 block">Isi Masukan:</span>
                <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">{selected.message}</p>
              </div>

              <div className="pt-3 border-t border-[#212438] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Balas Email</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selected.id, "ditindaklanjuti")}
                    className="p-2 rounded-xl bg-[#1A1D2E] hover:bg-[#252840] text-emerald-400 border border-[#2C304A] text-xs font-semibold transition-all"
                    title="Tandai Ditindaklanjuti"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selected.id, "diarsipkan")}
                    className="p-2 rounded-xl bg-[#1A1D2E] hover:bg-[#252840] text-gray-400 hover:text-white border border-[#2C304A] text-xs font-semibold transition-all"
                    title="Arsipkan"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
