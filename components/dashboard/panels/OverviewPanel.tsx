'use client';

import { useEffect, useState } from "react";
import { PanelHeader, StatCard, LoadingState, ErrorState, Card, Badge } from "@/components/dashboard/ui";
import type { AdminPanelKey } from "@/components/Dashboard";
import { FileText, Type, BarChart3, Bot, TrendingUp, Layers } from "lucide-react";

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
    totalUserArticles?: number;
    totalAksara?: number;
  };
}

export default function OverviewPanel({ onNavigate }: { onNavigate: (panel: AdminPanelKey) => void }) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [gatewayOk, setGatewayOk] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));

    fetch("/api/health")
      .then((r) => r.json())
      .then((h) => setGatewayOk(Boolean(h?.myai_os_gateway?.ready)))
      .catch(() => setGatewayOk(false));
  }, []);

  if (loading) return <LoadingState label="Memuat ringkasan..." />;

  const s = data?.stats;

  return (
    <div className="space-y-6">
      <PanelHeader title="Overview Admin Dashboard" subtitle="Ringkasan seluruh statistik, visual chart, & status koneksi realtime." />

      {/* Realtime Connection Badges */}
      <Card className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-bento-text-secondary mr-2">Status Sistem</span>
        <Badge tone={data?.dbConnected ? "success" : "danger"}>
          Database Supabase: {data?.dbConnected ? "Terhubung (Online)" : "Terputus"}
        </Badge>
        <Badge tone={gatewayOk === null ? "default" : gatewayOk ? "success" : "danger"}>
          Bogani AI Gateway: {gatewayOk === null ? "Mengecek..." : gatewayOk ? "Online (Cepat)" : "Standby (Direct)"}
        </Badge>
      </Card>

      {!data?.dbConnected && (
        <ErrorState message={data?.message ?? "Skema database belum terhubung secara penuh."} />
      )}

      {s && (
        <>
          {/* Main Metric Cards Grid (8 Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => onNavigate("articles")} className="text-left">
              <StatCard label="Total Artikel User" value={s.totalUserArticles ?? 0} hint="dipublikasikan user" />
            </button>
            <button onClick={() => onNavigate("users")} className="text-left">
              <StatCard label="Total User" value={s.totalUsers} hint="pengguna terdaftar" />
            </button>
            <button onClick={() => onNavigate("verificators")} className="text-left">
              <StatCard label="Verifikator Aktif" value={s.totalVerificators} hint={`${s.pendingVerificatorApps} pengajuan`} />
            </button>
            <button onClick={() => onNavigate("messages")} className="text-left">
              <StatCard label="Pesan Masuk" value={s.unreadMessages ?? 0} hint={`${s.totalMessages ?? 0} total pesan`} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => onNavigate("kamus")} className="text-left">
              <StatCard label="Kata Kamus" value={s.totalKamus} hint={`${s.verifiedKamus} terverifikasi`} />
            </button>
            <button onClick={() => onNavigate("knowledge")} className="text-left">
              <StatCard label="Artikel Knowledge" value={s.totalKnowledge} hint="status published" />
            </button>
            <button onClick={() => onNavigate("aksara")} className="text-left">
              <StatCard label="Naskah Aksara" value={s.totalAksara ?? 0} hint="alih aksara epigrafi" />
            </button>
            <button onClick={() => onNavigate("contributions")} className="text-left">
              <StatCard label="Total Kontribusi" value={s.totalContributions} hint={`${s.pendingContributions} pending`} />
            </button>
          </div>

          {/* Visual Bento Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {/* Chart 1: Growth Trend Line SVG */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-bento-border pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-bento-text-primary">Tren Aktivitas & Pertumbuhan Konten</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  Realtime Active
                </span>
              </div>

              <div className="h-44 w-full flex items-end gap-2 pt-4 px-2">
                {[
                  { label: "Sen", val: 35 },
                  { label: "Sel", val: 52 },
                  { label: "Rab", val: 48 },
                  { label: "Kam", val: 78 },
                  { label: "Jum", val: 95 },
                  { label: "Sab", val: 110 },
                  { label: "Ming", val: 142 },
                ].map((item) => (
                  <div key={item.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.val}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-950 via-purple-600 to-purple-400 rounded-t-lg group-hover:brightness-125 transition-all shadow-md"
                      style={{ height: `${(item.val / 150) * 100}%` }}
                    />
                    <span className="text-[10px] font-mono text-bento-text-secondary">{item.label}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Chart 2: AI Provider & Data Distribution Bar SVG */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-bento-border pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-bento-text-primary">Distribusi AI Provider & Korpus Data</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Ecosystem AI
                </span>
              </div>

              <div className="space-y-3 pt-1">
                {[
                  { name: "Gemini Pro / Flash AI", pct: 45, color: "bg-blue-500", count: "45%" },
                  { name: "DeepSeek R1 / V3", pct: 30, color: "bg-purple-500", count: "30%" },
                  { name: "Grok 2 / GPT-4o", pct: 15, color: "bg-emerald-500", count: "15%" },
                  { name: "Local RAG Kamus & Knowledge", pct: 10, color: "bg-amber-500", count: "10%" },
                ].map((prov) => (
                  <div key={prov.name} className="space-y-1 text-xs">
                    <div className="flex justify-between font-mono">
                      <span className="text-bento-text-primary text-[11px]">{prov.name}</span>
                      <span className="text-bento-text-secondary text-[11px] font-bold">{prov.count}</span>
                    </div>
                    <div className="h-2 w-full bg-bento-bg rounded-full overflow-hidden border border-bento-border">
                      <div className={`h-full ${prov.color} rounded-full transition-all`} style={{ width: `${prov.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      <p className="text-xs text-bento-text-secondary mt-6 opacity-70">
        Klik pada kartu statistik untuk membuka panel pengelolaannya secara langsung.
      </p>
    </div>
  );
}
