'use client';

import { useEffect, useState } from "react";
import { PanelHeader, StatCard, LoadingState, ErrorState, Card, Badge } from "@/components/dashboard/ui";
import type { AdminPanelKey } from "@/components/Dashboard";

interface OverviewData {
  dbConnected: boolean;
  message?: string;
  stats?: {
    totalUsers: number;
    totalVerificators: number;
    pendingVerificatorApps: number;
    totalKamus: number;
    verifiedKamus: number;
    totalKnowledge: number;
    pendingContributions: number;
    totalContributions: number;
    unreadMessages?: number;
    totalMessages?: number;
  };
}

export default function OverviewPanel({ onNavigate }: { onNavigate: (panel: AdminPanelKey) => void }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gatewayOk, setGatewayOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false));

    fetch("/api/health")
      .then(r => r.json())
      .then(h => setGatewayOk(Boolean(h?.myai_os_gateway?.ready)))
      .catch(() => setGatewayOk(false));
  }, []);

  if (loading) return <LoadingState label="Memuat ringkasan..." />;

  const s = data?.stats;

  return (
    <div>
      <PanelHeader title="Overview" subtitle="Ringkasan seluruh statistik & status koneksi realtime." />

      {/* Status koneksi realtime */}
      <Card className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-bento-text-secondary mr-2">Status Sistem</span>
        <Badge tone={data?.dbConnected ? "success" : "danger"}>
          Database: {data?.dbConnected ? "Terhubung" : "Terputus"}
        </Badge>
        <Badge tone={gatewayOk === null ? "default" : gatewayOk ? "success" : "danger"}>
          API Gateway: {gatewayOk === null ? "Mengecek..." : gatewayOk ? "Online" : "Offline"}
        </Badge>
      </Card>

      {!data?.dbConnected && (
        <ErrorState message={data?.message ?? "Skema database baru belum terhubung. Jalankan supabase/migrations/20260803_ginza_platform_schema.sql di Supabase SQL Editor dulu."} />
      )}

      {s && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <button onClick={() => onNavigate("messages")} className="text-left"><StatCard label="Pesan Masuk" value={s.unreadMessages ?? 0} hint={`${s.totalMessages ?? 0} total pesan`} /></button>
            <button onClick={() => onNavigate("users")} className="text-left"><StatCard label="Total User" value={s.totalUsers} /></button>
            <button onClick={() => onNavigate("verificators")} className="text-left"><StatCard label="Verifikator Aktif" value={s.totalVerificators} hint={`${s.pendingVerificatorApps} pengajuan menunggu`} /></button>
            <button onClick={() => onNavigate("kamus")} className="text-left"><StatCard label="Kata Kamus" value={s.totalKamus} hint={`${s.verifiedKamus} terverifikasi`} /></button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            <button onClick={() => onNavigate("knowledge")} className="text-left"><StatCard label="Artikel Knowledge" value={s.totalKnowledge} hint="status published" /></button>
            <button onClick={() => onNavigate("contributions")} className="text-left"><StatCard label="Kontribusi Pending" value={s.pendingContributions} /></button>
            <button onClick={() => onNavigate("contributions")} className="text-left"><StatCard label="Total Kontribusi" value={s.totalContributions} /></button>
          </div>
        </>
      )}

      <p className="text-xs text-bento-text-secondary mt-6 opacity-70">
        Klik kartu statistik untuk langsung membuka panel terkait.
      </p>
    </div>
  );
}
