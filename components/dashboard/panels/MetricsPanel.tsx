'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState } from "@/components/dashboard/ui";
import { TRACKED_BUTTONS } from "@/lib/track-metric";

interface MetricEntry { text: string; count: number }
interface MetricsData {
  kamusSearch: MetricEntry[];
  kamusClick: MetricEntry[];
  knowledgeView: MetricEntry[];
  aiQuestion: MetricEntry[];
  buttonClicks: Record<string, number>;
  chatUsage: { totalTurns: number; uniqueUsers: number };
}

type Period = "day" | "week" | "month" | "all";
const PERIOD_LABEL: Record<Period, string> = { day: "Harian", week: "Mingguan", month: "Bulanan", all: "Semua" };

function RankList({ title, items }: { title: string; items: MetricEntry[] }) {
  return (
    <Card>
      <p className="text-sm font-semibold mb-3">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-bento-text-secondary">Belum ada data tercatat.</p>
      ) : (
        <ol className="text-sm space-y-1.5">
          {items.map((it, i) => (
            <li key={it.text} className="flex items-center justify-between">
              <span className="truncate"><span className="text-bento-text-secondary mr-2">{i + 1}.</span>{it.text}</span>
              <span className="font-mono text-xs text-bento-text-secondary shrink-0 ml-2">{it.count}x</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

export default function MetricsPanel() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("day");

  useEffect(() => {
    // Sengaja TIDAK setData(null) di sini -- data periode sebelumnya tetap
    // tampil sampai fetch baru selesai (hindari flash kosong pas ganti tab
    // periode), sekaligus menghindari lint rule react-hooks/set-state-in-effect.
    fetch(`/api/admin/metrics?period=${period}`)
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(e => setError(String(e)));
  }, [period]);

  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PanelHeader title="Metrics" subtitle="Kata paling dicari & diklik, pertanyaan terbanyak ke Bogani AI, artikel Knowledge terpopuler, dan klik tombol navigasi/CTA -- data real dari metrics_events." />

      {/* Tab Periode: Harian/Mingguan/Bulanan/Semua */}
      <div className="flex gap-2 mb-4">
        {(["day", "week", "month", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              period === p
                ? "bg-bento-accent text-white shadow-sm"
                : "bg-bento-surface border border-bento-border text-bento-text-secondary hover:text-bento-text-primary"
            }`}
          >
            {PERIOD_LABEL[p]}
          </button>
        ))}
      </div>

      {!data ? (
        <LoadingState />
      ) : (
        <>
          {/* Klik Tombol Navigasi & CTA */}
          <Card className="mb-4">
            <p className="text-sm font-semibold mb-3">Klik Tombol Navigasi & CTA ({PERIOD_LABEL[period]})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {TRACKED_BUTTONS.map((btn) => (
                <div key={btn} className="bg-bento-bg border border-bento-border rounded-xl p-3 text-center">
                  <p className="text-lg font-extrabold text-bento-accent font-mono">{data.buttonClicks[btn] ?? 0}</p>
                  <p className="text-[11px] text-bento-text-secondary truncate mt-0.5">{btn}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Bogani AI Chat: total giliran + user unik */}
          <Card className="mb-4">
            <p className="text-sm font-semibold mb-3">Bogani AI Chat ({PERIOD_LABEL[period]})</p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div className="bg-bento-bg border border-bento-border rounded-xl p-3 text-center">
                <p className="text-lg font-extrabold text-emerald-400 font-mono">{data.chatUsage.totalTurns}</p>
                <p className="text-[11px] text-bento-text-secondary mt-0.5">Total Giliran Chat</p>
              </div>
              <div className="bg-bento-bg border border-bento-border rounded-xl p-3 text-center">
                <p className="text-lg font-extrabold text-blue-400 font-mono">{data.chatUsage.uniqueUsers}</p>
                <p className="text-[11px] text-bento-text-secondary mt-0.5">User Login Unik</p>
              </div>
            </div>
            <p className="text-[11px] text-bento-text-secondary mt-2 opacity-70">
              Mencakup teks & Voice Mode. User tamu (belum login) ikut di Total Giliran tapi tidak di User Login Unik.
            </p>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <RankList title="Kamus — Pencarian Terbanyak" items={data.kamusSearch} />
            <RankList title="Kamus — Top 10 Kata Diklik" items={data.kamusClick} />
            <RankList title="Bogani AI — Pertanyaan Terbanyak" items={data.aiQuestion} />
            <RankList title="Knowledge — Artikel Terpopuler" items={data.knowledgeView} />
          </div>
        </>
      )}
    </div>
  );
}
