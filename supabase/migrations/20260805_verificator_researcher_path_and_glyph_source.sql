-- ════════════════════════════════════════════════════════════════════════
-- Migration: jalur pendaftaran Verifikator utk peneliti eksternal (non-KTP)
-- + kolom sitasi/sumber per-glyph Aksara.
--
-- Konteks (2026-08-05, arahan Boss Bayu setelah rapat dgn 5 Kepala Daerah
-- BMR + tetua adat/Sangadi): MongondowPedia jadi alat verifikasi bersama
-- untuk SEMUA pihak, termasuk peneliti/akademisi luar negeri yang tidak
-- punya KTP Indonesia. Semua entri (huruf, sejarah, dst) tetap WAJIB tampil
-- di publik, tapi wajib berstatus jelas terverifikasi/belum — bukan diblok
-- di depan. Ini menambah jalur identitas kedua utk verifikator eksternal,
-- dan kolom rujukan/sitasi spesifik per huruf aksara supaya sanggahan/
-- verifikasi bisa merujuk sumber konkret (bukan cuma catatan bebas).
-- ════════════════════════════════════════════════════════════════════════

-- 1. Jalur identitas kedua utk verificator_applications ---------------------
alter table public.verificator_applications
  add column if not exists applicant_type text not null default 'warga_bmr'
    check (applicant_type in ('warga_bmr', 'peneliti_eksternal'));

alter table public.verificator_applications
  alter column ktp_image_url drop not null;

alter table public.verificator_applications
  add column if not exists institution_name text;

alter table public.verificator_applications
  add column if not exists credential_url text;

-- Pastikan salah satu jalur identitas terisi sesuai applicant_type:
-- warga_bmr -> wajib ktp_image_url; peneliti_eksternal -> wajib institution_name + credential_url.
alter table public.verificator_applications drop constraint if exists chk_verificator_identity_path;
alter table public.verificator_applications
  add constraint chk_verificator_identity_path check (
    (applicant_type = 'warga_bmr' and ktp_image_url is not null)
    or
    (applicant_type = 'peneliti_eksternal' and institution_name is not null and credential_url is not null)
  );

-- 2. Kolom sitasi/sumber per-glyph Aksara ------------------------------------
alter table public.aksara_glyphs
  add column if not exists source_reference text;

comment on column public.aksara_glyphs.source_reference is
  'Rujukan/sitasi spesifik utk glyph ini (mis. naskah/foto/perbandingan tertentu) — terpisah dari notes (catatan operasional admin/verifikator).';

-- ═══════════════════════════════════════════════════════════════════════
-- 3. Foto wajah wajib (depan/kiri/kanan) + spesialisasi keahlian utk
--    verifikator — arahan Boss Bayu 2026-08-05 setelah diskusi lanjutan:
--    - Siapa saja (dalam/luar negeri) BOLEH mendaftar jadi verifikator,
--      tapi tetap 'pending' sampai admin konfirmasi -> sudah jadi perilaku
--      default status di tabel ini sejak awal, tidak berubah.
--    - Wajib ambil 3 foto wajah (depan/kiri/kanan) sbg data identitas
--      tambahan, tersimpan di storage privat, TIDAK BISA dihapus/diubah
--      oleh pemilik (verifikator) — hanya admin yang punya akses tulis
--      penuh (RLS di bawah meniru pola ktp-verifikator: cuma policy
--      insert utk pemilik, tidak ada policy update/delete utk pemilik
--      sama sekali, jadi otomatis ditolak RLS).
--    - Kolom di bawah NULLABLE (bukan not null) supaya tidak merusak baris
--      lama yang mungkin sudah ada dari sebelum fitur ini; kewajiban
--      pengisian utk pendaftaran BARU ditegakkan di API
--      (app/api/public/verificator/apply/route.ts), bukan constraint DB —
--      lebih aman utk skema yang sudah live.
-- ═══════════════════════════════════════════════════════════════════════
alter table public.verificator_applications
  add column if not exists face_front_url text,
  add column if not exists face_left_url text,
  add column if not exists face_right_url text,
  add column if not exists consent_given_at timestamptz,
  add column if not exists expertise text[] not null default '{}',
  add column if not exists ai_face_check_status text not null default 'pending'
    check (ai_face_check_status in ('pending', 'passed', 'flagged', 'skipped', 'error')),
  add column if not exists ai_face_check_notes text;

comment on column public.verificator_applications.expertise is
  'Spesialisasi keahlian pendaftar, mis. {"sejarah","aksara","bahasa","adat_budaya"} — tag bebas, ditentukan di UI (bukan enum DB supaya fleksibel).';
comment on column public.verificator_applications.ai_face_check_status is
  'Hasil sanity-check AI (bukan liveness forensik) apakah 3 foto tampak seperti wajah manusia asli — SINYAL BANTU utk admin, bukan gerbang otomatis. Admin tetap wajib review manual.';

-- Bucket privat baru khusus foto wajah verifikator
insert into storage.buckets (id, name, public)
values ('verificator-faces', 'verificator-faces', false)
on conflict (id) do nothing;

-- Pola identik ktp-verifikator: pemilik cuma bisa INSERT ke folder sendiri
-- & SELECT punya sendiri; TIDAK ADA policy update/delete utk pemilik sama
-- sekali (RLS default-deny) — jadi foto wajah tidak bisa dihapus/diubah
-- oleh verifikator setelah diupload. Admin baca semua lewat policy admin.
create policy "verificator_faces_owner_write" on storage.objects
  for insert with check (bucket_id = 'verificator-faces' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "verificator_faces_owner_admin_read" on storage.objects
  for select using (
    bucket_id = 'verificator-faces' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    )
  );
