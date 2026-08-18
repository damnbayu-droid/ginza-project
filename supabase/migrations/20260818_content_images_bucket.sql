-- Bucket PUBLIK khusus gambar di dalam isi Artikel & Knowledge Base
-- (app/api/upload-image/route.ts) -- SENGAJA terpisah dari "data-center-files"
-- (private, URL signed 1 jam) krn gambar yg tertanam permanen di konten
-- terpublikasi butuh URL yg TIDAK PERNAH kedaluwarsa.
insert into storage.buckets (id, name, public)
values ('content-images', 'content-images', true)
on conflict (id) do nothing;

-- Akses baca PUBLIK (bucket publik) -- upload/tulis tetap cuma lewat
-- service-role (supabaseAdmin) di app/api/upload-image/route.ts, TIDAK
-- ada policy insert langsung dari klien di sini.
drop policy if exists "content_images_public_read" on storage.objects;
create policy "content_images_public_read"
  on storage.objects for select
  using (bucket_id = 'content-images');
