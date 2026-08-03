'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";

interface ContributionRow {
  id: string;
  contribution_type: string;
  proposed_data: Record<string, any>;
  status: string;
  created_at: string;
  profiles?: { display_name: string | null };
}

export default function KontribusiPanel() {
  const [items, setItems] = useState<ContributionRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  function load() {
    setError(null);
    fetch(`/api/admin/contributions${filter ? `?status=${filter}` : ""}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setItems(d.contributions); })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { load(); }, [filter]);

  async function finalize(c: ContributionRow, approve: boolean) {
    await fetch("/api/admin/contributions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contributionId: c.id, approve }),
    });
    load();
  }

  return (
    <div>
      <PanelHeader
        title="Kontribusi"
        subtitle="Usulan kata/pengetahuan baru dari user. Butuh kuorum 50%+1 suara verifikator, lalu persetujuan final admin."
      />

      <div className="flex gap-2 mb-4">
        {["", "pending", "quorum_reached", "approved", "rejected"].map(f => (
          <Button key={f || "all"} variant={filter === f ? "primary" : "default"} onClick={() => setFilter(f)}>
            {f === "" ? "Semua" : f === "quorum_reached" ? "Kuorum Tercapai" : f}
          </Button>
        ))}
      </div>

      {error && <ErrorState message={error} />}
      {!items && !error && <LoadingState />}

      {items && (
        <div className="space-y-3">
          {items.length === 0 && <p className="text-sm text-bento-text-secondary">Belum ada kontribusi.</p>}
          {items.map(c => (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge>{c.contribution_type}</Badge>
                    <Badge tone={c.status === "approved" ? "success" : c.status === "rejected" ? "danger" : c.status === "quorum_reached" ? "warning" : "default"}>
                      {c.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold">{c.proposed_data?.word ?? c.proposed_data?.title ?? "(tanpa judul)"}</p>
                  <p className="text-xs text-bento-text-secondary">
                    Oleh {c.profiles?.display_name ?? "user"} · {new Date(c.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                {c.status === "quorum_reached" && (
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={() => finalize(c, true)}>Setujui & Terapkan</Button>
                    <Button variant="danger" onClick={() => finalize(c, false)}>Tolak</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-bento-text-secondary mt-6 opacity-70">
        Kontribusi baru bisa disetujui final di sini setelah verifikator mencapai kuorum 50%+1 suara (status
        &quot;Kuorum Tercapai&quot;) — voting dilakukan verifikator dari Verifikator Dashboard.
      </p>
    </div>
  );
}
