'use client';

import { useEffect, useState } from "react";
import { PanelHeader, Card, LoadingState, ErrorState } from "@/components/dashboard/ui";

interface MetricEntry { text: string; count: number }
interface MetricsData {
  kamusSearch: MetricEntry[];
  kamusClick: MetricEntry[];
  knowledgeView: MetricEntry[];
  aiQuestion: MetricEntry[];
}

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

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d); })
      .catch(e => setError(String(e)));
  }, []);

  if (error) return <ErrorState message={error} />;
  if (!data) return <LoadingState />;

  return (
    <div>
      <PanelHeader title="Metrics" subtitle="Kata paling dicari & diklik, pertanyaan terbanyak ke Bogani AI, artikel Knowledge terpopuler." />
      <div className="grid md:grid-cols-2 gap-4">
        <RankList title="Kamus — Pencarian Terbanyak" items={data.kamusSearch} />
        <RankList title="Kamus — Top 10 Kata Diklik" items={data.kamusClick} />
        <RankList title="Bogani AI — Pertanyaan Terbanyak" items={data.aiQuestion} />
        <RankList title="Knowledge — Artikel Terpopuler" items={data.knowledgeView} />
      </div>
    </div>
  );
}
