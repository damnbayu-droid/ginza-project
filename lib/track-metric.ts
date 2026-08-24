'use client';

// Daftar nama tombol yg dilacak (harus PERSIS sama dgn yg dipakai di
// MetricsPanel.tsx & getButtonClickCounts() di lib/ginza-db.ts) -- diminta
// Boss Bayu 2026-08-24: Panel Metrics dgn tab Harian/Mingguan/Bulanan/Semua
// per tombol, data nyata (bukan mock).
export const TRACKED_BUTTONS = [
  "Kamus",
  "Knowledge",
  "Transliterasi",
  "Aksara",
  "Latihan",
  "Game",
  "Ecosystem",
  "Dashboard",
  "Pengaturan",
  "CTA Login",
  "CTA Feedback",
  "CTA Info",
  "Bogani AI Voice Mode",
] as const;

export type TrackedButton = (typeof TRACKED_BUTTONS)[number];

/** Fire-and-forget -- gagal kirim tidak boleh mengganggu navigasi/UX. */
export function trackButtonClick(button: TrackedButton) {
  try {
    fetch("/api/public/track-click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ button }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // no-op
  }
}
