'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";

interface CandidateRow {
  id: string;
  raw_text: string | null;
  extracted_data: { candidate_fact?: string; suggested_category?: string; user_message?: string; ai_response?: string } | null;
  review_status: "pending" | "approved" | "rejected";
  confidence_score: number | null;
  created_at: string;
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
        subtitle="Calon fakta baru yang disaring otomatis dari pertanyaan pengguna sehari-hari (job harian) -- Setujui atau Tolak 1 klik, tidak perlu kuorum."
      />

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
                    {c.extracted_data?.suggested_category && <Badge>{c.extracted_data.suggested_category}</Badge>}
                    <span className="text-xs text-bento-text-secondary">{new Date(c.created_at).toLocaleDateString("id-ID")}</span>
                  </div>
                  <p className="text-sm font-semibold mb-1">
                    {c.extracted_data?.candidate_fact || "(ringkasan belum tersedia)"}
                  </p>
                  {c.extracted_data?.user_message && (
                    <p className="text-xs text-bento-text-secondary">
                      Dari pertanyaan: &quot;{c.extracted_data.user_message}&quot;
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
