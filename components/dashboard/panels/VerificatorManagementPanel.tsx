'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";

interface AppRow {
  id: string;
  user_id: string;
  applicant_type?: "warga_bmr" | "peneliti_eksternal";
  ktp_image_url: string | null;
  institution_name?: string | null;
  credential_url?: string | null;
  full_name: string | null;
  status: string;
  created_at: string;
  expertise?: string[] | null;
  face_front_url?: string | null;
  face_left_url?: string | null;
  face_right_url?: string | null;
  ai_face_check_status?: string | null;
  ai_face_check_notes?: string | null;
}

const AI_CHECK_LABEL: Record<string, { label: string; tone: "success" | "warning" | "danger" | "default" }> = {
  passed: { label: "AI: Lolos", tone: "success" },
  flagged: { label: "AI: Perlu Ditinjau", tone: "danger" },
  skipped: { label: "AI: Dilewati", tone: "default" },
  error: { label: "AI: Error", tone: "warning" },
  pending: { label: "AI: Pending", tone: "default" },
};

interface VoiceSampleRow {
  id: string;
  word_or_phrase: string;
  audio_url: string;
  transcript: string | null;
  status: string;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

function VoiceSamplesSection() {
  const [samples, setSamples] = useState<VoiceSampleRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "">("pending");

  function load() {
    setError(null);
    fetch(`/api/admin/voice-samples${filter ? `?status=${filter}` : ""}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setSamples(d.samples); })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { load(); }, [filter]);

  async function review(sample: VoiceSampleRow, approve: boolean) {
    await fetch("/api/admin/voice-samples", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId: sample.id, approve }),
    });
    load();
  }

  return (
    <div className="mt-8 pt-6 border-t border-bento-border">
      <PanelHeader
        title="Sampel Suara Verifikator"
        subtitle="Review rekaman pelafalan kata/frasa Bahasa Mongondow dari verifikator sebelum masuk korpus pelatihan Bogani AI."
      />

      <div className="flex gap-2 mb-4">
        {(["pending", "approved", "rejected", ""] as const).map(f => (
          <Button key={f || "all"} variant={filter === f ? "primary" : "default"} onClick={() => setFilter(f)}>
            {f === "" ? "Semua" : f === "pending" ? "Menunggu" : f === "approved" ? "Disetujui" : "Ditolak"}
          </Button>
        ))}
      </div>

      {error && <ErrorState message={error} />}
      {!samples && !error && <LoadingState />}

      {samples && (
        <div className="space-y-2">
          {samples.length === 0 && <p className="text-sm text-bento-text-secondary">Tidak ada sampel suara.</p>}
          {samples.map(s => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">&quot;{s.word_or_phrase}&quot;</p>
                <p className="text-xs text-bento-text-secondary">
                  Oleh {s.profiles?.display_name ?? "verifikator"} · {new Date(s.created_at).toLocaleString("id-ID")}
                </p>
                <audio controls src={s.audio_url} className="h-8 mt-1" />
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={s.status === "approved" ? "success" : s.status === "rejected" ? "danger" : "warning"}>{s.status}</Badge>
                {s.status === "pending" && (
                  <>
                    <Button variant="primary" onClick={() => review(s, true)}>Approve</Button>
                    <Button variant="danger" onClick={() => review(s, false)}>Reject</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
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
            <Card key={app.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{app.full_name ?? "(nama belum diisi)"}</p>
                  <p className="text-xs text-bento-text-secondary">Diajukan: {new Date(app.created_at).toLocaleString("id-ID")}</p>
                  {app.applicant_type === "peneliti_eksternal" ? (
                    <>
                      <p className="text-xs text-bento-text-secondary">Institusi: {app.institution_name ?? "-"}</p>
                      {app.credential_url && (
                        <a href={app.credential_url} target="_blank" rel="noreferrer" className="text-xs text-bento-accent underline">Lihat tautan kredensial</a>
                      )}
                    </>
                  ) : (
                    app.ktp_image_url && (
                      <a href={app.ktp_image_url} target="_blank" rel="noreferrer" className="text-xs text-bento-accent underline">Lihat foto KTP</a>
                    )
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="default">{app.applicant_type === "peneliti_eksternal" ? "Peneliti Eksternal" : "Warga BMR"}</Badge>
                  <Badge tone={app.status === "approved" ? "success" : app.status === "rejected" ? "danger" : "warning"}>{app.status}</Badge>
                  {app.status === "pending" && (
                    <>
                      <Button variant="primary" onClick={() => review(app, true)}>Approve</Button>
                      <Button variant="danger" onClick={() => review(app, false)}>Reject</Button>
                    </>
                  )}
                </div>
              </div>

              {(app.face_front_url || app.expertise?.length) && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-bento-border">
                  {app.face_front_url && (
                    <div className="flex items-center gap-1.5">
                      {[["Depan", app.face_front_url], ["Kiri", app.face_left_url], ["Kanan", app.face_right_url]].map(([label, url]) => (
                        url ? (
                          <a key={label} href={url as string} target="_blank" rel="noreferrer" className="text-[11px] text-bento-accent underline">
                            Foto {label}
                          </a>
                        ) : null
                      ))}
                    </div>
                  )}
                  {app.ai_face_check_status && (
                    <span title={app.ai_face_check_notes ?? undefined}>
                      <Badge tone={AI_CHECK_LABEL[app.ai_face_check_status]?.tone ?? "default"}>
                        {AI_CHECK_LABEL[app.ai_face_check_status]?.label ?? app.ai_face_check_status}
                      </Badge>
                    </span>
                  )}
                  {app.expertise?.map(e => <Badge key={e} tone="default">{e}</Badge>)}
                </div>
              )}
              {app.ai_face_check_notes && (
                <p className="text-[11px] text-bento-text-secondary opacity-70">Catatan AI: {app.ai_face_check_notes}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-bento-text-secondary mt-6 opacity-70">
        Catatan: verifikator yang disetujui otomatis naik role ke &quot;verificator&quot; dan mendapat akses ke Verifikator Dashboard
        (voting kontribusi, tools pelatihan suara, verifikasi kata Kamus).
      </p>

      <VoiceSamplesSection />
    </div>
  );
}
