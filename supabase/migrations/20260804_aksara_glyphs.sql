-- ════════════════════════════════════════════════════════════════════════
-- Migration: Database Huruf / Abjad Mongondow (aksara_glyphs)
--
-- Fase 1 dari rencana yang dibahas dengan Boss Bayu 2026-08-04: glyph
-- aksara sekarang disimpan sbg VEKTOR SVG (public/aksara-svg/*.svg, hasil
-- trace dari raster lama di public/aksara/*.png), bukan lagi screenshot
-- mentah. Tabel ini memberi lapisan tata kelola/verifikasi di atas 88 suku
-- kata yang sudah ada di data/aksara/aksara_mongondow.json, sekaligus jadi
-- tempat menambah varian baru dari kontribusi verifikator ke depannya.
--
-- Fase 2 (belum di migration ini, disimpan utk nanti kalau ada appetite):
-- kompilasi glyph SVG ini jadi font web asli (mapping ke Unicode Private
-- Use Area) supaya teks aksara benar-benar bisa diketik/dipilih/di-copy.
-- Kolom unicode_pua_codepoint sudah disiapkan di bawah utk fase itu.
-- ════════════════════════════════════════════════════════════════════════

create table if not exists public.aksara_glyphs (
  id uuid primary key default gen_random_uuid(),
  romanization text not null unique,
  consonant text,
  vowel text,
  syllable_type text not null check (syllable_type in ('vowel_a', 'vowel_e_i', 'vowel_o_u', 'final_consonant')),
  glyph_svg_path text not null,
  glyph_image_legacy text,
  unicode_pua_codepoint text,
  display_order integer not null default 100,
  status text not null default 'verified' check (status in ('draft', 'pending_review', 'verified', 'archived')),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_aksara_glyphs_status on public.aksara_glyphs (status);
create index if not exists idx_aksara_glyphs_type on public.aksara_glyphs (syllable_type);

create trigger trg_aksara_glyphs_updated_at
  before update on public.aksara_glyphs
  for each row execute function public.set_updated_at();

-- Verifikator mana saja yang sudah memverifikasi glyph ini — sama pola dgn
-- kamus_verifications, supaya konsisten across Kamus & Aksara.
create table if not exists public.aksara_glyph_verifications (
  id uuid primary key default gen_random_uuid(),
  glyph_id uuid not null references public.aksara_glyphs(id) on delete cascade,
  verificator_id uuid not null references public.profiles(id),
  verified_at timestamptz not null default now(),
  note text,
  unique (glyph_id, verificator_id)
);

alter table public.aksara_glyphs enable row level security;
alter table public.aksara_glyph_verifications enable row level security;

create policy "aksara_glyphs_public_read" on public.aksara_glyphs
  for select using (true);

create policy "aksara_glyphs_admin_write" on public.aksara_glyphs
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "aksara_glyphs_verificator_update" on public.aksara_glyphs
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verificator', 'admin'))
  );

create policy "aksara_glyph_verifications_public_read" on public.aksara_glyph_verifications
  for select using (true);

create policy "aksara_glyph_verifications_verificator_insert" on public.aksara_glyph_verifications
  for insert with check (
    auth.uid() = verificator_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('verificator', 'admin'))
  );
