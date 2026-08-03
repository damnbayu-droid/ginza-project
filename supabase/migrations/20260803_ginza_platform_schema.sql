-- ════════════════════════════════════════════════════════════════════════
-- Migration: Skema inti platform Ginza Project / MongondowPedia
--
-- Project target: rainfqnsazraiifprkmc (Supabase KHUSUS Ginza Project,
-- terpisah total dari myai-os-gateway). Public schema project ini masih
-- kosong per 2026-08-03 - migration ini jadi fondasi pertamanya.
--
-- Cakupan: profil user/verifikator/admin, verifikasi KTP verifikator,
-- Kamus (entri + jejak verifikasi per kata), Knowledge (kategori/tab
-- dinamis + artikel), alur Kontribusi (usul -> voting verifikator 50%+1 ->
-- approve admin), percakapan AI tersimpan, metrics/ranking, token usage,
-- sampel pelatihan suara verifikator, dan audit log immutable.
--
-- Auth: memakai Supabase Auth bawaan (auth.users) supaya nanti tinggal
-- tambah provider Google tanpa migrasi ulang skema - profiles.id
-- mereferensikan auth.users(id).
--
-- CATATAN: migration ini fokus fondasi data + RLS dasar. Aturan akses yang
-- lebih rinci (mis. endpoint spesifik per panel admin) akan disempurnakan
-- saat kita bangun tiap panel satu per satu.
-- ════════════════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Helper: auto-update updated_at ──────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ═══════════════════════════════════════════════════════════════════════
-- 1. PROFILES (user / verifikator / admin)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'verificator', 'admin')),
  display_name text,
  avatar_url text,
  bio text,
  mongondow_score integer not null default 0,
  is_banned boolean not null default false,
  banned_reason text,
  banned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Buat baris profile otomatis setiap ada user baru daftar via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

create policy "profiles_public_read" on public.profiles
  for select using (true); -- perlu publik utk leaderboard/trending kontributor

create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 2. VERIFICATOR APPLICATIONS (upload KTP utk jadi verifikator)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.verificator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  ktp_image_url text not null,
  full_name text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now()
);

alter table public.verificator_applications enable row level security;

create policy "verificator_app_self_insert" on public.verificator_applications
  for insert with check (auth.uid() = user_id);

create policy "verificator_app_self_read" on public.verificator_applications
  for select using (auth.uid() = user_id);

create policy "verificator_app_admin_all" on public.verificator_applications
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 3. KAMUS (entri kata + jejak verifikasi per kata)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.kamus_entries (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  phonetic text,
  origin text,
  meaning text,
  example text,
  aksara_breakdown text,
  category text,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'verified', 'archived')),
  view_count integer not null default 0,
  search_count integer not null default 0,
  created_by uuid references public.profiles(id),
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Plain unique index (bukan ekspresi) — WAJIB begini karena semua upsert di
-- kode (lib/ginza-db.ts upsertKamusEntry, scripts/import-kamus-to-db.ts)
-- memakai onConflict: "word", dan PostgREST/Postgres cuma bisa mencocokkan
-- ON CONFLICT ke index plain-column, bukan index ekspresi seperti lower(word).
create unique index if not exists idx_kamus_entries_word on public.kamus_entries (word);
create index if not exists idx_kamus_entries_status on public.kamus_entries (status);

create trigger trg_kamus_entries_updated_at
  before update on public.kamus_entries
  for each row execute function public.set_updated_at();

-- Siapa saja verifikator yang sudah memverifikasi kata ini
create table if not exists public.kamus_verifications (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.kamus_entries(id) on delete cascade,
  verificator_id uuid not null references public.profiles(id),
  verified_at timestamptz not null default now(),
  note text,
  unique (entry_id, verificator_id)
);

alter table public.kamus_entries enable row level security;
alter table public.kamus_verifications enable row level security;

create policy "kamus_entries_public_read_verified" on public.kamus_entries
  for select using (status = 'verified' or auth.uid() is not null);

create policy "kamus_entries_admin_write" on public.kamus_entries
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "kamus_entries_verificator_update_status" on public.kamus_entries
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verificator', 'admin'))
  );

create policy "kamus_verifications_public_read" on public.kamus_verifications
  for select using (true);

create policy "kamus_verifications_verificator_insert" on public.kamus_verifications
  for insert with check (
    auth.uid() = verificator_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verificator', 'admin'))
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 4. KNOWLEDGE (kategori/tab dinamis + artikel)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.knowledge_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  display_order integer not null default 100,
  visit_count integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Kategori awal sesuai contoh yang diminta (admin bisa tambah lagi dari dashboard)
insert into public.knowledge_categories (slug, name, display_order) values
  ('sejarah', 'Sejarah', 10),
  ('edukasi', 'Edukasi', 20),
  ('kerajaan-bolaang-mongondow', 'Kerajaan Bolaang Mongondow', 30),
  ('seni-tari', 'Seni Tari', 40),
  ('seni-musik', 'Seni Musik', 50),
  ('seni-puisi', 'Seni Puisi', 60)
on conflict (slug) do nothing;

create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.knowledge_categories(id),
  slug text not null unique,
  title text not null,
  summary text,
  content text not null,
  cover_image_url text,
  meta_description text,
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'published', 'archived')),
  view_count integer not null default 0,
  created_by uuid references public.profiles(id),
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_knowledge_articles_category on public.knowledge_articles (category_id);
create index if not exists idx_knowledge_articles_status on public.knowledge_articles (status);

create trigger trg_knowledge_articles_updated_at
  before update on public.knowledge_articles
  for each row execute function public.set_updated_at();

alter table public.knowledge_categories enable row level security;
alter table public.knowledge_articles enable row level security;

create policy "knowledge_categories_public_read" on public.knowledge_categories
  for select using (is_active = true or auth.uid() is not null);

create policy "knowledge_categories_admin_write" on public.knowledge_categories
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "knowledge_articles_public_read_published" on public.knowledge_articles
  for select using (status = 'published' or auth.uid() is not null);

create policy "knowledge_articles_admin_write" on public.knowledge_articles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "knowledge_articles_verificator_update" on public.knowledge_articles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verificator', 'admin'))
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 5. KONTRIBUSI (usulan user -> voting verifikator 50%+1 -> approve admin)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references public.profiles(id),
  contribution_type text not null check (contribution_type in ('kamus_new', 'kamus_edit', 'knowledge_new', 'knowledge_edit')),
  target_kamus_id uuid references public.kamus_entries(id),
  target_knowledge_id uuid references public.knowledge_articles(id),
  proposed_data jsonb not null,
  note text,
  status text not null default 'pending' check (
    status in ('pending', 'quorum_reached', 'approved', 'rejected')
  ),
  admin_approved boolean not null default false,
  admin_reviewed_by uuid references public.profiles(id),
  admin_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_contributions_updated_at
  before update on public.contributions
  for each row execute function public.set_updated_at();

create table if not exists public.contribution_votes (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid not null references public.contributions(id) on delete cascade,
  verificator_id uuid not null references public.profiles(id),
  vote text not null check (vote in ('approve', 'reject')),
  voted_at timestamptz not null default now(),
  unique (contribution_id, verificator_id)
);

-- Hitung kuorum 50%+1 dari jumlah verifikator aktif setiap ada vote baru
create or replace function public.check_contribution_quorum()
returns trigger as $$
declare
  total_verificators integer;
  approve_votes integer;
begin
  select count(*) into total_verificators
  from public.profiles where role = 'verificator' and is_banned = false;

  select count(*) into approve_votes
  from public.contribution_votes
  where contribution_id = new.contribution_id and vote = 'approve';

  if total_verificators > 0 and approve_votes >= (total_verificators / 2 + 1) then
    update public.contributions
    set status = 'quorum_reached'
    where id = new.contribution_id and status = 'pending';
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_contribution_vote_quorum
  after insert on public.contribution_votes
  for each row execute function public.check_contribution_quorum();

alter table public.contributions enable row level security;
alter table public.contribution_votes enable row level security;

create policy "contributions_self_insert" on public.contributions
  for insert with check (auth.uid() = contributor_id);

create policy "contributions_self_read" on public.contributions
  for select using (
    auth.uid() = contributor_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verificator', 'admin'))
  );

create policy "contributions_admin_update" on public.contributions
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "contribution_votes_verificator_insert" on public.contribution_votes
  for insert with check (
    auth.uid() = verificator_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verificator', 'admin'))
  );

create policy "contribution_votes_read" on public.contribution_votes
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verificator', 'admin'))
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 6. PERCAKAPAN AI TERSIMPAN (User & Verifikator dashboard)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

alter table public.conversations enable row level security;

create policy "conversations_owner_all" on public.conversations
  for all using (auth.uid() = user_id);

create policy "conversations_admin_read" on public.conversations
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 7. METRICS (query kamus, klik knowledge, pertanyaan ke Bogani AI)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.metrics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (
    event_type in ('kamus_search', 'kamus_click', 'knowledge_view', 'ai_question')
  ),
  target_id uuid,
  target_text text,
  user_id uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_metrics_events_type_created on public.metrics_events (event_type, created_at desc);

alter table public.metrics_events enable row level security;

create policy "metrics_events_insert_anyone" on public.metrics_events
  for insert with check (true);

create policy "metrics_events_admin_read" on public.metrics_events
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 8. TOKEN USAGE (per user, utk Admin & Verifikator Management)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.token_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  provider text,
  endpoint text,
  tokens_used integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_token_usage_user on public.token_usage (user_id, created_at desc);

alter table public.token_usage enable row level security;

create policy "token_usage_self_read" on public.token_usage
  for select using (auth.uid() = user_id);

create policy "token_usage_admin_read" on public.token_usage
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 9. SAMPEL PELATIHAN SUARA (tools Verifikator melatih AI bahasa Mongondow)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.voice_training_samples (
  id uuid primary key default gen_random_uuid(),
  verificator_id uuid not null references public.profiles(id),
  word_or_phrase text not null,
  audio_url text not null,
  transcript text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.voice_training_samples enable row level security;

create policy "voice_samples_verificator_own" on public.voice_training_samples
  for all using (auth.uid() = verificator_id);

create policy "voice_samples_admin_all" on public.voice_training_samples
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 10. AUDIT LOGS (IMMUTABLE - semua dashboard)
-- ═══════════════════════════════════════════════════════════════════════
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  actor_role text,
  action text not null,
  target_table text,
  target_id text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

-- Cegah UPDATE/DELETE permanen, walau oleh admin - benar-benar immutable
create or replace function public.prevent_audit_log_mutation()
returns trigger as $$
begin
  raise exception 'audit_logs bersifat immutable - UPDATE/DELETE tidak diizinkan';
end;
$$ language plpgsql;

create trigger trg_audit_logs_no_update
  before update on public.audit_logs
  for each row execute function public.prevent_audit_log_mutation();

create trigger trg_audit_logs_no_delete
  before delete on public.audit_logs
  for each row execute function public.prevent_audit_log_mutation();

alter table public.audit_logs enable row level security;

create policy "audit_logs_insert_authenticated" on public.audit_logs
  for insert with check (auth.uid() is not null);

create policy "audit_logs_admin_read" on public.audit_logs
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 11. STORAGE BUCKETS (foto profil, KTP verifikator, sampel suara)
-- ═══════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('ktp-verifikator', 'ktp-verifikator', false),
  ('voice-samples', 'voice-samples', false)
on conflict (id) do nothing;

-- avatars: publik bisa baca (foto profil tampil di leaderboard/Kamus),
-- pemilik file (folder bernama user_id-nya) bisa upload/update punya sendiri
create policy "avatars_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars_owner_write" on storage.objects
  for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_owner_update" on storage.objects
  for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ktp-verifikator: PRIVAT total - hanya pemilik (saat upload) & admin yang bisa baca
create policy "ktp_owner_write" on storage.objects
  for insert with check (bucket_id = 'ktp-verifikator' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "ktp_owner_admin_read" on storage.objects
  for select using (
    bucket_id = 'ktp-verifikator' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );

-- voice-samples: verifikator upload punya sendiri, admin bisa baca semua
create policy "voice_samples_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'voice-samples' and (storage.foldername(name))[1] = auth.uid()::text
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verificator', 'admin'))
  );

create policy "voice_samples_owner_admin_read" on storage.objects
  for select using (
    bucket_id = 'voice-samples' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );

-- ═══════════════════════════════════════════════════════════════════════
-- Catatan lanjutan (untuk sesi berikutnya):
-- - Algoritma trending kontributor: mongondow_score dihitung dari jumlah
--   contribution.status = 'approved' milik user tsb (bobot kamus vs
--   knowledge bisa beda) - akan diimplementasi sbg function terpisah
--   setelah alur approve-contribution (aplikasi/API) selesai dibangun,
--   supaya sekalian nulis ke audit_logs dan update kamus_entries/
--   knowledge_articles yang sebenarnya.
-- - RLS di atas cukup utk fondasi; beberapa endpoint admin (ban user,
--   approve verifikator) sebaiknya tetap lewat service_role di API route
--   (bukan langsung dari client) sesuai pola gw_* yang sudah ada.
-- ═══════════════════════════════════════════════════════════════════════
