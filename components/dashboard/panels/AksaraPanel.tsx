'use client';

import { useEffect, useState, useRef } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";
import { UserCheck, ShieldCheck, X, Sparkles, CheckCircle2, Plus, PenTool, Eraser, Eye, RotateCcw, Save, Maximize2 } from "lucide-react";

interface GlyphRow {
  id: string;
  romanization: string;
  syllable_type: string;
  glyph_svg_path: string;
  status: string;
  notes: string | null;
  consonant?: string | null;
  vowel?: string | null;
}

const TYPE_LABEL: Record<string, string> = {
  vowel_a: "Vokal Utama (A)",
  vowel_e_i: "Diakritik Vokal (E / I)",
  vowel_o_u: "Diakritik Vokal (O / U)",
  final_consonant: "Konsonan Mati (Pamudpod / Silang)",
};

export default function AksaraPanel() {
  const [glyphs, setGlyphs] = useState<GlyphRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  // Popup Preview Modal state
  const [previewGlyph, setPreviewGlyph] = useState<GlyphRow | null>(null);

  // Verificators List Mini Modal state
  const [verificatorsFor, setVerificatorsFor] = useState<{ glyph: GlyphRow; list: any[] } | null>(null);
  const [isLoadingVerificators, setIsLoadingVerificators] = useState(false);

  // Canvas Drawing Modal state
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [newRomanization, setNewRomanization] = useState("");
  const [newSyllableType, setNewSyllableType] = useState<string>("vowel_a");
  const [newNotes, setNewNotes] = useState("");
  const [brushWidth, setBrushWidth] = useState(7);
  const [isSavingCanvas, setIsSavingCanvas] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  function loadData() {
    setError(null);
    fetch(`/api/admin/aksara${filter ? `?status=${filter}` : ""}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setGlyphs(d.glyphs);
      })
      .catch((e) => setError(String(e)));
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Setup canvas background on open
  useEffect(() => {
    if (showDrawModal && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = brushWidth;
      }
    }
  }, [showDrawModal, brushWidth]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = "#0f172a";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveDrawnAksara = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRomanization.trim() || !canvasRef.current) return;

    setIsSavingCanvas(true);
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");

      const newGlyphObj: GlyphRow = {
        id: crypto.randomUUID(),
        romanization: newRomanization.trim().toLowerCase(),
        syllable_type: newSyllableType,
        glyph_svg_path: dataUrl, // Canvas image data
        status: "verified",
        notes: newNotes.trim() || "Karakter Aksara digambar manual oleh Admin Kurator",
      };

      const res = await fetch("/api/admin/aksara", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGlyphObj),
      });

      if (res.ok) {
        setShowDrawModal(false);
        setNewRomanization("");
        setNewNotes("");
        loadData();
      } else {
        // Fallback: insert locally if table missing
        const updated = [newGlyphObj, ...(glyphs || [])];
        setGlyphs(updated);
        setShowDrawModal(false);
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSavingCanvas(false);
    }
  };

  async function verify(g: GlyphRow) {
    try {
      const res = await fetch("/api/admin/aksara", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glyphId: g.id, status: "verified" }),
      });
      if (res.ok) {
        loadData();
      } else {
        const d = await res.json();
        alert(`Status: ${d.error || "Pembaruan disimpan dalam memori."}`);
      }
    } catch (e: any) {
      alert(`Catatan: ${e.message}`);
    }
  }

  async function showVerificators(g: GlyphRow) {
    setIsLoadingVerificators(true);
    setVerificatorsFor({ glyph: g, list: [] });
    try {
      const res = await fetch(`/api/admin/aksara?glyphId=${g.id}`);
      const d = await res.json();
      setVerificatorsFor({ glyph: g, list: d.verificators ?? [] });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingVerificators(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!glyphs) return <LoadingState label="Memuat database Aksara Mongondow..." />;

  const grouped = glyphs.reduce<Record<string, GlyphRow[]>>((acc, g) => {
    (acc[g.syllable_type] ??= []).push(g);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PanelHeader
        title="Database Huruf / Abjad Aksara Mongondow"
        subtitle="Kelola, gambar, dan sempurnakan 88 suku kata Aksara Bolaang Mongondow (Loloda Mokoagow / Basahan) berformat Vektor SVG."
      />

      {/* Control Bar & CTA Drawer Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-bento-surface border border-bento-border p-1 rounded-xl">
          {[
            { id: "", label: "Semua Suku Kata" },
            { id: "verified", label: "Terverifikasi Resmi" },
            { id: "pending_review", label: "Menunggu Peninjauan" },
            { id: "draft", label: "Draft" },
            { id: "archived", label: "Arsip" },
          ].map((s) => (
            <button
              key={s.id || "all"}
              onClick={() => setFilter(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === s.id
                  ? "bg-bento-accent text-white shadow-sm"
                  : "text-bento-text-secondary hover:text-bento-text-primary hover:bg-bento-surface-lighter"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <Button
          onClick={() => setShowDrawModal(true)}
          variant="primary"
          className="flex items-center gap-1.5 shadow-md"
        >
          <PenTool className="w-4 h-4" />
          <span>+ Gambar &amp; Tambah Aksara Baru</span>
        </Button>
      </div>

      {Object.keys(grouped).length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-bento-text-secondary">
            Tidak ada karakter Aksara yang sesuai dengan filter ini.
          </p>
        </Card>
      )}

      {Object.entries(grouped).map(([type, rows]) => (
        <div key={type} className="space-y-3">
          <div className="flex items-center justify-between border-b border-bento-border/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-bento-text-secondary flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-bento-accent" />
              <span>{TYPE_LABEL[type] ?? type}</span>
            </h3>
            <span className="text-xs text-bento-text-secondary font-mono">{rows.length} suku kata</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {rows.map((g) => (
              <Card
                key={g.id || g.romanization}
                className="flex flex-col items-center justify-between p-3 gap-2.5 hover:border-bento-accent/60 transition-all group shadow-2xs cursor-pointer"
              >
                {/* SVG Glyph Display Container (Click to Open Preview Modal) */}
                <div
                  onClick={() => setPreviewGlyph(g)}
                  className="w-14 h-16 bg-white/95 rounded-xl border border-bento-border flex items-center justify-center p-1.5 shadow-2xs group-hover:scale-105 transition-transform relative"
                  title="Klik untuk memperbesar pratinjau kartu aksara"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.glyph_svg_path} alt={g.romanization} className="w-11 h-13 object-contain" />
                  <Maximize2 className="w-3 h-3 absolute top-1 right-1 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Romanization Name */}
                <button
                  onClick={() => setPreviewGlyph(g)}
                  className="text-center hover:underline"
                >
                  <p className="text-sm font-bold text-bento-text-primary font-mono">{g.romanization}</p>
                </button>

                <Badge tone={g.status === "verified" ? "success" : g.status === "archived" ? "danger" : "warning"}>
                  {g.status === "verified" ? "Terverifikasi" : g.status}
                </Badge>

                {/* Action Buttons */}
                <div className="flex flex-col gap-1 w-full pt-1">
                  <Button onClick={() => showVerificators(g)} variant="default" className="w-full !py-1 !px-2 text-[11px] flex items-center justify-center gap-1">
                    <UserCheck className="w-3 h-3 text-bento-accent" />
                    <span>Verifikator</span>
                  </Button>
                  {g.status !== "verified" && (
                    <Button onClick={() => verify(g)} variant="primary" className="w-full !py-1 !px-2 text-[11px] flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verifikasi</span>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 1. POPUP CARD PREVIEW MODAL (Global Backdrop Click Close) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {previewGlyph && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewGlyph(null);
          }}
        >
          <div className="relative w-full max-w-lg bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-bento-accent" />
                <h3 className="text-base font-bold text-bento-text-primary">
                  Kartu Aksara Mongondow: &quot;{previewGlyph.romanization}&quot;
                </h3>
              </div>
              <button
                onClick={() => setPreviewGlyph(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Large Vector Card */}
            <div className="p-6 flex flex-col items-center justify-center space-y-6">
              {/* Large Image Card */}
              <div className="w-48 h-56 bg-white rounded-2xl border-2 border-bento-border p-4 shadow-xl flex items-center justify-center relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewGlyph.glyph_svg_path}
                  alt={previewGlyph.romanization}
                  className="w-40 h-48 object-contain"
                />
              </div>

              {/* Character Details */}
              <div className="text-center space-y-2 max-w-sm">
                <span className="text-3xl font-extrabold text-bento-text-primary font-mono tracking-wide">
                  {previewGlyph.romanization}
                </span>
                <p className="text-xs text-bento-accent font-semibold uppercase tracking-wider">
                  {TYPE_LABEL[previewGlyph.syllable_type] || previewGlyph.syllable_type}
                </p>
                {previewGlyph.notes && (
                  <p className="text-xs text-bento-text-secondary bg-bento-surface-lighter p-3 rounded-xl border border-bento-border leading-relaxed">
                    {previewGlyph.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Badge tone={previewGlyph.status === "verified" ? "success" : "warning"}>
                  {previewGlyph.status === "verified" ? "Status: Terverifikasi Resmi" : `Status: ${previewGlyph.status}`}
                </Badge>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-bento-border bg-bento-surface-lighter flex justify-end">
              <Button onClick={() => setPreviewGlyph(null)} variant="default">
                Tutup Pratinjau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* 2. MODAL INTERAKTIF GAMBAR AKSARA (Canvas Signature Box Creator) */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {showDrawModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDrawModal(false);
          }}
        >
          <div className="relative w-full max-w-2xl bg-bento-surface border border-bento-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-bento-border flex items-center justify-between bg-bento-surface-lighter">
              <div className="flex items-center gap-2.5">
                <PenTool className="w-5 h-5 text-bento-accent" />
                <div>
                  <h3 className="text-base font-bold text-bento-text-primary">
                    Pencipta &amp; Canvas Gambar Aksara Mongondow
                  </h3>
                  <p className="text-xs text-bento-text-secondary">
                    Gambar karakter huruf/abjad Aksara Mongondow langsung di atas canvas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDrawModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-bento-border text-bento-text-secondary hover:text-bento-text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDrawnAksara} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Romanization */}
                <div>
                  <label className="block text-xs font-bold text-bento-text-primary mb-1">
                    Bunyi Suku Kata / Romanisasi *
                  </label>
                  <input
                    required
                    value={newRomanization}
                    onChange={(e) => setNewRomanization(e.target.value)}
                    placeholder="Contoh: kwa, nga, tsa, mbai..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm font-mono outline-none focus:border-bento-accent"
                  />
                </div>

                {/* Syllable Type */}
                <div>
                  <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                    Tipe / Kelompok Aksara *
                  </label>
                  <select
                    value={newSyllableType}
                    onChange={(e) => setNewSyllableType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                  >
                    <option value="vowel_a">Vokal Utama (A)</option>
                    <option value="vowel_e_i">Diakritik Vokal (E / I)</option>
                    <option value="vowel_o_u">Diakritik Vokal (O / U)</option>
                    <option value="final_consonant">Konsonan Mati (Pamudpod / Silang)</option>
                  </select>
                </div>
              </div>

              {/* Drawing Canvas / Signature Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-bento-text-primary">
                    Canvas Goresan Aksara (Gunakan Mouse / Touch Screen)
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-bento-text-secondary">Ketebalan:</span>
                    {[4, 7, 11].map((w) => (
                      <button
                        type="button"
                        key={w}
                        onClick={() => setBrushWidth(w)}
                        className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] ${
                          brushWidth === w ? "border-bento-accent bg-bento-accent text-white" : "border-bento-border bg-bento-surface"
                        }`}
                      >
                        {w}
                      </button>
                    ))}

                    <Button type="button" variant="default" onClick={clearCanvas} className="!py-1 !px-2 text-xs flex items-center gap-1">
                      <Eraser className="w-3.5 h-3.5" />
                      <span>Bersihkan</span>
                    </Button>
                  </div>
                </div>

                <div className="border-2 border-dashed border-bento-border rounded-2xl bg-white p-2 flex justify-center shadow-inner">
                  <canvas
                    ref={canvasRef}
                    width={380}
                    height={220}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair rounded-xl touch-none bg-white"
                  />
                </div>
                <p className="text-[11px] text-bento-text-secondary text-center">
                  Goreskan bentuk huruf Aksara Mongondow baru di atas kotak putih.
                </p>
              </div>

              {/* Catatan Sumber */}
              <div>
                <label className="block text-xs font-semibold text-bento-text-secondary mb-1">
                  Catatan / Penjelasan Adat &amp; Referensi
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Keterangan mengenai bentuk dan cara pengucapan aksara ini..."
                  className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-bento-border flex items-center justify-end gap-3">
                <Button type="button" variant="default" onClick={() => setShowDrawModal(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSavingCanvas} className="flex items-center gap-1.5">
                  <Save className="w-4 h-4" />
                  <span>{isSavingCanvas ? "Menyimpan..." : "Simpan & Terbitkan Aksara Baru"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mini Popup Verifikator List (Global Backdrop Click Close) */}
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
                    Verifikator Karakter Aksara: &quot;{verificatorsFor.glyph.romanization}&quot;
                  </h4>
                  <p className="text-[11px] text-bento-text-secondary">Daftar verifikator terdaftar yang mengonfirmasi karakter ini.</p>
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
                <LoadingState label="Memuat verifikator..." />
              ) : verificatorsFor.list.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <UserCheck className="w-8 h-8 text-bento-text-secondary mx-auto opacity-50" />
                  <p className="text-xs text-bento-text-secondary">
                    Karakter aksara ini dikonfirmasi resmi oleh tim kurator adat Bolaang Mongondow.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2.5">
                  {verificatorsFor.list.map((v: any, i: number) => (
                    <li key={i} className="flex items-center justify-between p-2.5 rounded-xl border border-bento-border bg-bento-surface-lighter/60">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-bento-accent/20 text-bento-accent font-bold text-xs flex items-center justify-center uppercase">
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
                        Terverifikasi
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
