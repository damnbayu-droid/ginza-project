'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";
import { Plus, Edit2, CheckCircle2, RotateCcw, X, UserCheck, ShieldCheck, Eye, Search } from "lucide-react";

export interface KamusEntryRow {
  id?: string;
  word: string;
  phonetic?: string | null;
  origin?: string | null;
  meaning?: string | null;
  example?: string | null;
  aksara_breakdown?: string | null;
  category?: string | null;
  status: "draft" | "pending_review" | "verified" | "archived";
  source_note?: string | null;
  view_count?: number;
  search_count?: number;
  created_at?: string;
  updated_at?: string;
}

export default function DatabaseKamusPanel() {
  const [entries, setEntries] = useState<KamusEntryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Editor Modal state
  const [editingEntry, setEditingEntry] = useState<KamusEntryRow | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Verificators List Mini Modal state
  const [verificatorsFor, setVerificatorsFor] = useState<{ entry: KamusEntryRow; list: any[] } | null>(null);
  const [isLoadingVerificators, setIsLoadingVerificators] = useState(false);

  function loadData() {
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/admin/kamus?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setEntries(d.entries);
      })
      .catch((e) => setError(String(e)));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleCreateNew = () => {
    setIsNewEntry(true);
    setEditingEntry({
      word: "",
      phonetic: "",
      origin: "Mongondow",
      meaning: "",
      example: "",
      category: "Kata Benda",
      aksara_breakdown: "",
      status: "draft",
      source_note: "Dibuat oleh Admin",
    });
  };

  const handleEdit = (entry: KamusEntryRow) => {
    setIsNewEntry(false);
    setEditingEntry({ ...entry });
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry || !editingEntry.word.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/kamus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEntry),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        alert(`Gagal menyimpan kata: ${data.error || "Terjadi kesalahan"}`);
      } else {
        setEditingEntry(null);
        loadData();
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (entry: KamusEntryRow, newStatus: "verified" | "draft" | "pending_review" | "archived") => {
    try {
      const res = await fetch("/api/admin/kamus", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id, status: newStatus }),
      });

      if (res.ok) {
        loadData();
      } else {
        const d = await res.json();
        alert(`Gagal mengubah status: ${d.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleShowVerificators = async (entry: KamusEntryRow) => {
    if (!entry.id) return;
    setIsLoadingVerificators(true);
    setVerificatorsFor({ entry, list: [] });

    try {
      const res = await fetch(`/api/admin/kamus?entryId=${entry.id}`);
      const d = await res.json();
      setVerificatorsFor({ entry, list: d.verificators ?? [] });
    } catch (err) {
      console.error("Failed loading verificators:", err);
    } finally {
      setIsLoadingVerificators(false);
    }
  };

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Database Kamus"
        subtitle={`Semua entri kosa kata Kamus Bahasa Mongondow real-time${entries ? ` (${entries.length} kata)` : ""}.`}
      />

      {/* Control Bar: Search, Filters & Add New Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-bento-text-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && loadData()}
              placeholder="Cari kata, fonetik, atau makna..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-bento-border bg-bento-surface text-sm outline-none focus:border-bento-accent transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-bento-surface border border-bento-border p-1 rounded-xl">
            {[
              { id: "", label: "Semua" },
              { id: "verified", label: "Terverifikasi" },
              { id: "pending_review", label: "Menunggu" },
              { id: "draft", label: "Draft" },
              { id: "archived", label: "Arsip" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setStatusFilter(s.id)}
                className={`px-3 py-1.2 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s.id
                    ? "bg-bento-accent text-white shadow-sm"
                    : "text-bento-text-secondary hover:text-bento-text-primary hover:bg-bento-surface-lighter"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <Button onClick={loadData} variant="default" className="!py-2">
            Cari
          </Button>
        </div>

        <Button onClick={handleCreateNew} variant="primary" className="flex items-center gap-1.5 shadow-md">
          <Plus className="w-4 h-4" />
          <span>Tambah Kata Baru</span>
        </Button>
      </div>

      {error && <ErrorState message={error} />}
      {!entries && !error && <LoadingState />}

      {entries && (
        <Card className="!p-0 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-bento-surface-lighter text-bento-text-secondary text-xs uppercase tracking-wider border-b border-bento-border">
                <tr>
                  <th className="px-4 py-3">Kata (Mongondow)</th>
                  <th className="px-4 py-3">Fonetik</th>
                  <th className="px-4 py-3">Makna (Bahasa Indonesia)</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Confirm (Verifikator)</th>
                  <th className="px-4 py-3 text-right">Aksi Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bento-border">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-bento-text-secondary">
                      Tidak ada kata kamus yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  entries.slice(0, 250).map((e) => (
                    <tr key={e.id || e.word} className="hover:bg-bento-surface-lighter/50 transition-colors group">
                      {/* Kata */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEdit(e)}
                          className="font-semibold text-bento-accent hover:underline text-left flex items-center gap-1.5"
                          title="Klik untuk Edit Kata Ini"
                        >
                          <span>{e.word}</span>
                          <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </td>

                      {/* Fonetik */}
                      <td className="px-4 py-3 text-bento-text-secondary font-mono text-xs">
                        {e.phonetic ? `[${e.phonetic}]` : "-"}
                      </td>

                      {/* Makna */}
                      <td className="px-4 py-3 text-bento-text-primary max-w-xs truncate" title={e.meaning || ""}>
                        {e.meaning || "-"}
                      </td>

                      {/* Kategori */}
                      <td className="px-4 py-3 text-xs text-bento-text-secondary">
                        <span className="bg-bento-surface-lighter px-2 py-0.5 rounded border border-bento-border">
                          {e.category || "Umum"}
                        </span>
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            e.status === "verified"
                              ? "success"
                              : e.status === "archived"
                              ? "danger"
                              : e.status === "pending_review"
                              ? "warning"
                              : "default"
                          }
                        >
                          {e.status}
                        </Badge>
                      </td>

                      {/* Confirm (Verifikator List Popup Trigger) */}
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleShowVerificators(e)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border border-bento-border hover:border-bento-accent bg-bento-surface hover:bg-bento-surface-lighter text-bento-text-primary transition-all shadow-2xs"
                          title="Lihat daftar verifikator yang mengonfirmasi kata ini"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-bento-accent" />
                          <span>Verifikator</span>
                        </button>
                      </td>

                      {/* Aksi Buttons */}
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          onClick={() => handleEdit(e)}
                          variant="default"
                          className="!py-1 !px-2.5 text-xs inline-flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </Button>

                        {e.status === "verified" ? (
                          <Button
                            onClick={() => handleStatusChange(e, "draft")}
                            variant="default"
                            className="!py-1 !px-2.5 text-xs text-amber-500 border-amber-500/30 hover:bg-amber-500/10 inline-flex items-center gap-1"
                            title="Kembalikan status kata terverifikasi ke Draft"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Ke Draft</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleStatusChange(e, "verified")}
                            variant="primary"
                            className="!py-1 !px-2.5 text-xs inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verifikasi</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {entries.length > 250 && (
            <div className="p-3 text-xs text-center border-t border-bento-border text-bento-text-secondary bg-bento-surface-lighter">
              Menampilkan 250 dari {entries.length} kata — gunakan pencarian di atas untuk memfilter.
            </div>
          )}
        </Card>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 1. POPUP EDITOR KAMUS (Global Backdrop Click Close) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {editingEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingEntry(null);
          }}
        >
          <div className="relative w-full max-w-2xl bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-bento-accent" />
                <h3 className="text-base font-bold text-bento-text-primary">
                  {isNewEntry ? "Tambah Kata Baru ke Kamus" : `Edit Kata Kamus: "${editingEntry.word}"`}
                </h3>
              </div>
              <button
                onClick={() => setEditingEntry(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEntry} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kata */}
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                    Kata (Bahasa Mongondow) *
                  </label>
                  <input
                    required
                    value={editingEntry.word}
                    onChange={(e) => setEditingEntry({ ...editingEntry, word: e.target.value })}
                    placeholder="Contoh: niondon, mogutat..."
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                  />
                </div>

                {/* Fonetik */}
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Fonetik / Pengucapan</label>
                  <input
                    value={editingEntry.phonetic || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, phonetic: e.target.value })}
                    placeholder="Contoh: ni-on-don"
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent font-mono"
                  />
                </div>

                {/* Asal Bahasa */}
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Asal Bahasa / Dialek</label>
                  <input
                    value={editingEntry.origin || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, origin: e.target.value })}
                    placeholder="Contoh: Mongondow Asli, Serapan..."
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Kategori Kata</label>
                  <select
                    value={editingEntry.category || "Kata Benda"}
                    onChange={(e) => setEditingEntry({ ...editingEntry, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                  >
                    <option value="Kata Benda">Kata Benda (Noun)</option>
                    <option value="Kata Kerja">Kata Kerja (Verb)</option>
                    <option value="Kata Sifat">Kata Sifat (Adjective)</option>
                    <option value="Kata Keterangan">Kata Keterangan (Adverb)</option>
                    <option value="Sapaan / Adat">Sapaan / Adat</option>
                    <option value="Ungkapan">Ungkapan / Peribahasa</option>
                  </select>
                </div>
              </div>

              {/* Makna */}
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Makna / Arti (Bahasa Indonesia) *</label>
                <textarea
                  required
                  rows={3}
                  value={editingEntry.meaning || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, meaning: e.target.value })}
                  placeholder="Jelaskan arti kata secara lengkap..."
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              {/* Contoh Kalimat */}
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Contoh Kalimat & Terjemahan</label>
                <textarea
                  rows={2}
                  value={editingEntry.example || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, example: e.target.value })}
                  placeholder="Contoh: 'Torang mogutat' (Kita bersaudara)"
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Breakdown Aksara */}
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Breakdown Aksara</label>
                  <input
                    value={editingEntry.aksara_breakdown || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, aksara_breakdown: e.target.value })}
                    placeholder="Contoh: mo + gu + ta + t"
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent font-mono"
                  />
                </div>

                {/* Status Verifikasi */}
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Status Verifikasi</label>
                  <select
                    value={editingEntry.status}
                    onChange={(e) => setEditingEntry({ ...editingEntry, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent font-semibold"
                  >
                    <option value="draft">Draft (Belum Diverifikasi)</option>
                    <option value="pending_review">Pending Review (Menunggu)</option>
                    <option value="verified">Verified (Terverifikasi Resmi)</option>
                    <option value="archived">Archived (Diarsipkan)</option>
                  </select>
                </div>
              </div>

              {/* Catatan Sumber */}
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">Catatan Sumber / Referensi</label>
                <input
                  value={editingEntry.source_note || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, source_note: e.target.value })}
                  placeholder="Contoh: Kamus Adat Bolaang Mongondow 1985..."
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-bento-border flex items-center justify-end gap-3">
                <Button type="button" variant="default" onClick={() => setEditingEntry(null)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? "Menyimpan..." : isNewEntry ? "Tambah Kata" : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 2. MINI POPUP VERIFIKATOR LIST (Global Backdrop Click Close) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {verificatorsFor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setVerificatorsFor(null);
          }}
        >
          <div className="relative w-full max-w-md bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-bento-text-primary">
                    Verifikator: &quot;{verificatorsFor.entry.word}&quot;
                  </h4>
                  <p className="text-[11px] text-bento-text-secondary">Daftar verifikator terdaftar yang mengonfirmasi kata ini.</p>
                </div>
              </div>
              <button
                onClick={() => setVerificatorsFor(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 max-h-80 overflow-y-auto">
              {isLoadingVerificators ? (
                <LoadingState />
              ) : verificatorsFor.list.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <UserCheck className="w-8 h-8 text-bento-text-secondary mx-auto opacity-50" />
                  <p className="text-xs text-bento-text-secondary">
                    Kata ini belum dikonfirmasi oleh verifikator komunitas (diverifikasi langsung oleh Admin).
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {verificatorsFor.list.map((v: any, i: number) => (
                    <li key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-bento-border bg-bento-surface-lighter/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-bento-accent/20 text-bento-accent font-bold text-xs flex items-center justify-center uppercase">
                          {(v.profiles?.display_name || "V")[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-bento-text-primary">
                            {v.profiles?.display_name || "Verifikator Adat"}
                          </p>
                          <p className="text-[10px] text-bento-text-secondary font-mono">
                            {v.verified_at ? new Date(v.verified_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">
                        Confirmed
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-3 border-t border-bento-border bg-bento-surface-lighter text-right">
              <Button onClick={() => setVerificatorsFor(null)} variant="default" className="!py-1 !px-3 text-xs">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
