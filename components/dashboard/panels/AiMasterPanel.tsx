'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, Badge } from "@/components/dashboard/ui";

export default function AiMasterPanel() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <div>
      <PanelHeader title="Ai Master (Bogani AI)" subtitle="Status persona, sumber pengetahuan, dan koneksi AI Gateway." />

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card>
          <p className="text-sm font-semibold mb-2">Status Koneksi</p>
          {!health ? <LoadingState /> : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span>Supabase</span><Badge tone={health.supabase?.ready ? "success" : "danger"}>{health.supabase?.ready ? "Terhubung" : "Terputus"}</Badge></div>
              <div className="flex justify-between"><span>MyAI OS Gateway</span><Badge tone={health.myai_os_gateway?.ready ? "success" : "danger"}>{health.myai_os_gateway?.ready ? "Online" : "Offline"}</Badge></div>
              <div className="flex justify-between"><span>Provider aktif</span><span className="text-bento-text-secondary">{health.myai_os_gateway?.provider ?? "-"}</span></div>
            </div>
          )}
        </Card>
        <Card>
          <p className="text-sm font-semibold mb-2">Identitas Persona</p>
          <div className="space-y-1 text-xs text-bento-text-secondary">
            <p>Nama AI: <span className="text-bento-text-primary font-medium">{health?.ai_name ?? "Bogani AI"}</span></p>
            <p>Website: <span className="text-bento-text-primary font-medium">{health?.website ?? "MongondowPedia"}</span></p>
            <p>Project: <span className="text-bento-text-primary font-medium">{health?.project ?? "Ginza Project"}</span></p>
            <p>Gaya bahasa: Indonesia + campuran Bahasa Manado (persona di <code className="px-1 rounded bg-bento-surface-lighter">lib/bogani-persona.ts</code>)</p>
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-semibold mb-2">Sumber Pengetahuan Aktif</p>
        <ul className="text-xs text-bento-text-secondary space-y-1 list-disc pl-4">
          <li>Kamus Bahasa Mongondow — tabel <code className="px-1 rounded bg-bento-surface-lighter">kamus_entries</code> (fallback: file <code>kamus/*.md</code>)</li>
          <li>Knowledge base — tabel <code className="px-1 rounded bg-bento-surface-lighter">knowledge_articles</code> (fallback: file <code>knowledge/*.md</code>)</li>
          <li>Riwayat percakapan tersimpan di tabel <code className="px-1 rounded bg-bento-surface-lighter">conversations</code></li>
        </ul>
        <p className="text-xs text-bento-text-secondary mt-3 opacity-70">
          Tools pelatihan suara (voice training) untuk mengajarkan pelafalan Bahasa Mongondow tersedia di Verifikator Dashboard,
          hasil rekamannya masuk ke tabel <code className="px-1 rounded bg-bento-surface-lighter">voice_training_samples</code> menunggu review admin.
        </p>
      </Card>
    </div>
  );
}
