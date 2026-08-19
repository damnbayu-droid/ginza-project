'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";
import { Plus, X, Loader2 } from "lucide-react";

interface CandidateRow {
  id: string;
  raw_text: string | null;
  extracted_data: { candidate_fact?: string; suggested_category?: string; user_message?: string; ai_response?: string; title?: string } | null;
  review_status: "pending" | "approved" | "rejected";
  confidence_score: number | null;
  created_at: string;
  source_type?: string;
  document_type?: string | null;
}

// Form "Tambah Pengetahuan dari Lirik/Dokumen" (2026-08-18, Fase 1 dari
// docs/PLANNING_LYRICS_VIDEO_KNOWLEDGE_INGESTION.md) -- pintu masuk manual
// admin ke pipeline yg sama dgn hasil triase AI di bawahnya, lewat
// POST /api/data-center yg sudah ada.
function AddManualKnowledgeForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rawText.trim()) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/data-center", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          source_url: sourceUrl.trim(),
          raw_text: rawText,
          document_type: "lyrics",
          language: "id",
          tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: "success", text: "Berhasil ditambahkan ke antrean review di bawah!" });
        setTitle(""); setSourceUrl(""); setRawText(""); setTagsInput("");
        onAdded();
      } else {
        setMessage({ type: "error", text: data.error || "Gagal menambahkan." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Gagal menambahkan." });
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} variant="primary" className="mb-4 flex items-center gap-1.5">
        <Plus className="w-4 h-4" /> Tambah Pengetahuan dari Lirik/Dokumen
      </Button>
    );
  }

  return (
    <Card className="mb-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-bento-text-primary">Tambah Pengetahuan dari Lirik/Dokumen</h3>
        <button type="button" onClick={() => setOpen(false)} className="text-bento-text-secondary hover:text-bento-text-primary">
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-bento-text-secondary">
        Tempel lirik lagu, transkrip, atau teks lain berbahasa Mongondow di sini. Langsung masuk antrean review di
        bawah (tidak menunggu job harian) -- tetap wajib disetujui sebelum jadi Knowledge Base resmi.
      </p>
      {message && (
        <p className={`text-xs font-semibold ${message.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
          {message.text}
        </p>
      )}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul / nama lagu (opsional)"
          className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
        />
        <input
          type="text"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="Link sumber (YouTube, dll -- opsional)"
          className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-xs font-mono outline-none focus:border-bento-accent"
        />
        <textarea
          required
          rows={6}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder="Tempel lirik/teks di sini..."
          maxLength={20000}
          className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-sm outline-none focus:border-bento-accent"
        />
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="Tag, pisahkan koma (mis: lagu, adat)"
          className="w-full px-3 py-2 rounded-xl border border-bento-border bg-bento-bg text-xs outline-none focus:border-bento-accent"
        />
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={submitting || !rawText.trim()} className="flex items-center gap-1.5">
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{submitting ? "Menyimpan..." : "Simpan ke Antrean Review"}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default function KnowledgeCandidatesPanel() {
  const [items, setItems] = useState<CandidateRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("pending");

  function load() {
    setError(null);
    fetch(`/api/admin/knowledge-candidates${filter ? `?status=${filter}` : ""}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setItems(d.candidates); })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { load(); }, [filter]);

  async function finalize(c: CandidateRow, approve: boolean) {
    await fetch("/api/admin/knowledge-candidates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId: c.id, approve }),
    });
    load();
  }

  return (
    <div>
      <PanelHeader
        title="Celah Pengetahuan (Data Percakapan)"
        subtitle="Calon fakta baru yang disaring otomatis dari pertanyaan pengguna sehari-hari (job harian), atau ditambahkan manual dari lirik/dokumen -- Setujui atau Tolak 1 klik, tidak perlu kuorum."
      />

      <AddManualKnowledgeForm onAdded={load} />

      <div className="flex gap-2 mb-4">
        {["pending", "approved", "rejected", ""].map(f => (
          <Button key={f || "all"} variant={filter === f ? "primary" : "default"} onClick={() => setFilter(f)}>
            {f === "" ? "Semua" : f === "pending" ? "Perlu Ditinjau" : f}
          </Button>
        ))}
      </div>

      {error && <ErrorState message={error} />}
      {!items && !error && <LoadingState />}

      {items && (
        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-bento-text-secondary">
              Belum ada yang perlu ditinjau. Job harian jalan tiap malam -- cek lagi besok.
            </p>
          )}
          {items.map(c => (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone={c.review_status === "approved" ? "success" : c.review_status === "rejected" ? "danger" : "warning"}>
                      {c.review_status === "pending" ? "Perlu Ditinjau" : c.review_status}
                    </Badge>
                    {c.source_type === "manual_document" ? (
                      <Badge tone="default">📝 Lirik/Dokumen</Badge>
                    ) : (
                      <Badge tone="default">💬 Data Percakapan</Badge>
                    )}
                    {c.extracted_data?.suggested_category && <Badge>{c.extracted_data.suggested_category}</Badge>}
                    <span className="text-xs text-bento-text-secondary">{new Date(c.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1">
                    {c.extracted_data?.candidate_fact || c.extracted_data?.title || "(ringkasan belum tersedia)"}
                  </p>
                  {c.extracted_data?.user_message && (
                    <p className="text-xs text-bento-text-secondary">
                      Dari pertanyaan: &quot;{c.extracted_data.user_message}&quot;
                    </p>
                  )}
                  {c.source_type === "manual_document" && c.raw_text && (
                    <p className="text-xs text-bento-text-secondary whitespace-pre-line line-clamp-4">
                      {c.raw_text}
                    </p>
                  )}
                </div>
                {c.review_status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <Button variant="primary" onClick={() => finalize(c, true)}>Setujui</Button>
                    <Button variant="danger" onClick={() => finalize(c, false)}>Tolak</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-bento-text-secondary mt-6 opacity-70">
        Catatan: sebelum ditinjau di sini, Bogani AI SUDAH bisa memakai data ini untuk menjawab -- tapi selalu
        dengan label &quot;belum terverifikasi&quot;. Menyetujui di sini menghilangkan label tersebut secara bertahap
        (bukan gerbang wajib), menolak akan menghentikan pemakaiannya sama sekali.
      </p>
    </div>
  );
}
