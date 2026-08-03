'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge } from "@/components/dashboard/ui";

interface LogRow {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  target_table: string | null;
  target_id: string | null;
  created_at: string;
}

export default function LogsPanel() {
  const [logs, setLogs] = useState<LogRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/logs")
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setLogs(d.logs); })
      .catch(e => setError(String(e)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!logs) return <LoadingState />;

  return (
    <div>
      <PanelHeader title="Logs (Immutable)" subtitle="Catatan aktivitas dari Admin, User, dan Verifikator Dashboard — tidak bisa diubah atau dihapus." />
      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-bento-surface-lighter text-bento-text-secondary uppercase">
            <tr>
              <th className="text-left px-4 py-2">Waktu</th>
              <th className="text-left px-4 py-2">Peran</th>
              <th className="text-left px-4 py-2">Aksi</th>
              <th className="text-left px-4 py-2">Target</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={4} className="text-center py-6 text-bento-text-secondary">Belum ada aktivitas tercatat.</td></tr>
            )}
            {logs.map(l => (
              <tr key={l.id} className="border-t border-bento-border">
                <td className="px-4 py-2 whitespace-nowrap">{new Date(l.created_at).toLocaleString("id-ID")}</td>
                <td className="px-4 py-2"><Badge>{l.actor_role ?? "-"}</Badge></td>
                <td className="px-4 py-2 font-mono">{l.action}</td>
                <td className="px-4 py-2 text-bento-text-secondary">{l.target_table ? `${l.target_table}#${l.target_id?.slice(0, 8)}` : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
