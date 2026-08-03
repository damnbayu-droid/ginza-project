'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState, Badge, Button } from "@/components/dashboard/ui";

interface KamusRow {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string | null;
  status: string;
  created_at: string;
}

export default function DatabaseKamusPanel() {
  const [entries, setEntries] = useState<KamusRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verificatorsFor, setVerificatorsFor] = useState<{ entry: KamusRow; list: any[] } | null>(null);

  function load() {
    setError(null);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/kamus?${params.toString()}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setEntries(d.entries); })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { load(); }, [statusFilter]);

  async function verify(entry: KamusRow) {
    await fetch("/api/admin/kamus", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId: entry.id, status: "verified" }),
    });
    load();
  }

  async function showVerificators(entry: KamusRow) {
    const res = await fetch(`/api/admin/kamus?entryId=${entry.id}`);
    const d = await res.json();
    setVerificatorsFor({ entry, list: d.verificators ?? [] });
  }

  return (
    <div>
      <PanelHeader title="Database Kamus" subtitle={`Semua entri Kamus Bahasa Mongondow${entries ? ` (${entries.length} entri)` : ""}, terhubung ke sistem verifikasi.`} />

      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === "Enter" && load()}
          placeholder="Cari kata..."
          className="flex-1 min-w-[180px] rounded-lg border border-bento-border bg-bento-surface px-3 py-2 text-sm outline-none focus:border-bento-accent"
        />
        {["", "draft", "pending_review", "verified", "archived"].map(s => (
          <Button key={s || "all"} variant={statusFilter === s ? "primary" : "default"} onClick={() => setStatusFilter(s)}>
            {s === "" ? "Semua" : s}
          </Button>
        ))}
        <Button onClick={load}>Cari</Button>
      </div>

      {error && <ErrorState message={error} />}
      {!entries && !error && <LoadingState />}

      {entries && (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bento-surface-lighter text-bento-text-secondary text-xs uppercase">
              <tr>
                <th className="text-left px-4 py-2">Kata</th>
                <th className="text-left px-4 py-2">Fonetik</th>
                <th className="text-left px-4 py-2">Makna</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-right px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(0, 200).map(e => (
                <tr key={e.id} className="border-t border-bento-border align-top">
                  <td className="px-4 py-2 font-semibold">{e.word}</td>
                  <td className="px-4 py-2 text-bento-text-secondary">{e.phonetic ?? "-"}</td>
                  <td className="px-4 py-2 text-bento-text-secondary max-w-xs truncate">{e.meaning ?? "-"}</td>
                  <td className="px-4 py-2">
                    <Badge tone={e.status === "verified" ? "success" : e.status === "archived" ? "danger" : "warning"}>{e.status}</Badge>
                  </td>
                  <td className="px-4 py-2 text-right space-x-2 whitespace-nowrap">
                    <Button onClick={() => showVerificators(e)}>Verifikator</Button>
                    {e.status !== "verified" && <Button variant="primary" onClick={() => verify(e)}>Verifikasi</Button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entries.length > 200 && (
            <p className="text-xs text-center py-2 text-bento-text-secondary">Menampilkan 200 dari {entries.length} entri — gunakan pencarian untuk mempersempit.</p>
          )}
        </Card>
      )}

      {verificatorsFor && (
        <div className="mt-4">
          <Card>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Verifikator untuk &quot;{verificatorsFor.entry.word}&quot;</p>
              <Button onClick={() => setVerificatorsFor(null)}>Tutup</Button>
            </div>
            {verificatorsFor.list.length === 0 ? (
              <p className="text-xs text-bento-text-secondary">Belum ada verifikator spesifik yang tercatat (mungkin diverifikasi langsung oleh admin).</p>
            ) : (
              <ul className="text-xs space-y-1">
                {verificatorsFor.list.map((v: any, i: number) => (
                  <li key={i}>{v.profiles?.display_name ?? v.verificator_id} — {new Date(v.verified_at).toLocaleDateString("id-ID")}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
