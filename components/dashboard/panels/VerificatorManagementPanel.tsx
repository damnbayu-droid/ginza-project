'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";

interface AppRow {
  id: string;
  user_id: string;
  ktp_image_url: string;
  full_name: string | null;
  status: string;
  created_at: string;
}

export default function VerificatorManagementPanel() {
  const [apps, setApps] = useState<AppRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "">("pending");

  function load() {
    setError(null);
    fetch(`/api/admin/verificators${filter ? `?status=${filter}` : ""}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setApps(d.applications); })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { load(); }, [filter]);

  async function review(app: AppRow, approve: boolean) {
    const notes = approve ? undefined : prompt("Alasan penolakan (opsional):") ?? undefined;
    await fetch("/api/admin/verificators", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: app.id, approve, notes }),
    });
    load();
  }

  return (
    <div>
      <PanelHeader
        title="Verifikator Management"
        subtitle="Review pengajuan KTP, approve/reject calon verifikator, dan pantau kontribusi mereka pada Kamus."
      />

      <div className="flex gap-2 mb-4">
        {(["pending", "approved", "rejected", ""] as const).map(f => (
          <Button key={f || "all"} variant={filter === f ? "primary" : "default"} onClick={() => setFilter(f)}>
            {f === "" ? "Semua" : f === "pending" ? "Menunggu" : f === "approved" ? "Disetujui" : "Ditolak"}
          </Button>
        ))}
      </div>

      {error && <ErrorState message={error} />}
      {!apps && !error && <LoadingState />}

      {apps && (
        <div className="space-y-3">
          {apps.length === 0 && <p className="text-sm text-bento-text-secondary">Tidak ada pengajuan.</p>}
          {apps.map(app => (
            <Card key={app.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{app.full_name ?? "(nama belum diisi)"}</p>
                <p className="text-xs text-bento-text-secondary">Diajukan: {new Date(app.created_at).toLocaleString("id-ID")}</p>
                <a href={app.ktp_image_url} target="_blank" rel="noreferrer" className="text-xs text-bento-accent underline">Lihat foto KTP</a>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={app.status === "approved" ? "success" : app.status === "rejected" ? "danger" : "warning"}>{app.status}</Badge>
                {app.status === "pending" && (
                  <>
                    <Button variant="primary" onClick={() => review(app, true)}>Approve</Button>
                    <Button variant="danger" onClick={() => review(app, false)}>Reject</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-bento-text-secondary mt-6 opacity-70">
        Catatan: verifikator yang disetujui otomatis naik role ke &quot;verificator&quot; dan mendapat akses ke Verifikator Dashboard
        (voting kontribusi, tools pelatihan suara, verifikasi kata Kamus).
      </p>
    </div>
  );
}
