-- ═══════════════════════════════════════════════════════════════════════
-- Reset kuota tamu tiap 24 jam (dulu: akumulasi seumur hidup, tidak pernah
-- reset). Ditambahkan bareng kenaikan batas tamu 7->15 & user 35->45/hari
-- atas permintaan Boss Bayu.
-- ═══════════════════════════════════════════════════════════════════════

alter table public.guest_usage
  add column if not exists window_started_at timestamptz not null default now();

comment on column public.guest_usage.window_started_at is
  'Awal jendela 24 jam berjalan saat ini -- question_count dianggap 0 & jendela dimulai ulang begitu now() - window_started_at >= 24 jam. Lihat lib/ai-usage-quota.ts.';
