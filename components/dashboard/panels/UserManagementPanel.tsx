'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";

interface ProfileRow {
  id: string;
  role: string;
  display_name: string | null;
  mongondow_score: number;
  is_banned: boolean;
  banned_reason: string | null;
  created_at: string;
}

export default function UserManagementPanel() {
  const [profiles, setProfiles] = useState<ProfileRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProfileRow | null>(null);
  const [tokenUsage, setTokenUsage] = useState<any[] | null>(null);

  function load() {
    setError(null);
    fetch(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setProfiles(d.profiles); })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { load(); }, []);

  async function toggleBan(p: ProfileRow) {
    const reason = p.is_banned ? undefined : prompt("Alasan pembatasan (opsional):") ?? undefined;
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: p.id, action: p.is_banned ? "unban" : "ban", reason }),
    });
    load();
  }

  async function viewUsage(p: ProfileRow) {
    setSelected(p);
    setTokenUsage(null);
    const res = await fetch(`/api/admin/users?userId=${p.id}`);
    const d = await res.json();
    setTokenUsage(d.tokenUsage ?? []);
  }

  if (error) return <ErrorState message={error} />;
  if (!profiles) return <LoadingState />;

  return (
    <div>
      <PanelHeader title="User Management" subtitle="Kelola user, batasi akses, dan lihat pemakaian token per user." />

      <div className="flex gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && load()}
          placeholder="Cari nama user..."
          className="flex-1 rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent"
        />
        <Button onClick={load}>Cari</Button>
      </div>

      <Card className="!p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-bento-surface-lighter text-bento-text-secondary text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-2">Nama</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="text-left px-4 py-2">Skor</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-right px-4 py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-bento-text-secondary">Belum ada user terdaftar.</td></tr>
            )}
            {profiles.map(p => (
              <tr key={p.id} className="border-t border-bento-border">
                <td className="px-4 py-2">{p.display_name ?? "(tanpa nama)"}</td>
                <td className="px-4 py-2"><Badge>{p.role}</Badge></td>
                <td className="px-4 py-2">{p.mongondow_score}</td>
                <td className="px-4 py-2">
                  {p.is_banned ? <Badge tone="danger">Dibatasi</Badge> : <Badge tone="success">Aktif</Badge>}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <Button onClick={() => viewUsage(p)}>Token Usage</Button>
                  <Button variant={p.is_banned ? "default" : "danger"} onClick={() => toggleBan(p)}>
                    {p.is_banned ? "Buka Blokir" : "Batasi"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selected && (
        <div className="mt-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Token Usage — {selected.display_name ?? selected.id}</p>
              <Button onClick={() => setSelected(null)}>Tutup</Button>
            </div>
            {!tokenUsage ? <LoadingState /> : tokenUsage.length === 0 ? (
              <p className="text-xs text-bento-text-secondary">Belum ada pemakaian token tercatat.</p>
            ) : (
              <ul className="text-xs space-y-1 max-h-64 overflow-y-auto">
                {tokenUsage.map((t: any) => (
                  <li key={t.id} className="flex justify-between border-b border-bento-border py-1">
                    <span>{t.provider ?? "-"} · {t.endpoint ?? "-"}</span>
                    <span className="font-mono">{t.tokens_used} token</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
