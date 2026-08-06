-- ═══════════════════════════════════════════════════════════════════════
-- Batasan penggunaan AI: tamu (belum login) & User biasa (sudah login)
-- ═══════════════════════════════════════════════════════════════════════
-- Tujuan: kontrol biaya & dorong pendaftaran akun. Dua tingkat:
--   1. Tamu (belum login)  -> dilacak per guest_id (cookie anonim, dibuat
--      sekali per browser oleh server, lihat lib/ai-usage-quota.ts), jatah
--      KECIL & TIDAK RESET (sekali habis wajib login/daftar).
--   2. User biasa (role='user') -> jatah HARIAN (rolling 24 jam), dihitung
--      langsung dari baris public.token_usage milik user itu -- tidak perlu
--      tabel counter terpisah, token_usage sudah mencatat tiap giliran AI.
--   Verifikator & admin sengaja DIKECUALIKAN (unlimited), diterapkan di kode
--   (lib/ai-usage-quota.ts), bukan di skema ini.
create table if not exists public.guest_usage (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null unique,
  ip_address text,
  question_count integer not null default 0,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create index if not exists guest_usage_ip_idx on public.guest_usage(ip_address);

alter table public.guest_usage enable row level security;

-- Server selalu akses lewat service_role (bypass RLS) -- endpoint publik
-- (app/api/homepage/chat, app/api/kamus/ai-define) TIDAK PERNAH expose
-- tabel ini langsung ke klien, cuma pakai untuk cek/tambah hitungan.
create policy "deny_anon_guest_usage" on public.guest_usage for all to anon using (false);
