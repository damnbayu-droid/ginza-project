-- Bucket "data-center-files" dipakai lib/data-center.ts (upload dokumen/OCR)
-- dan app/api/cron/extract-knowledge (ekspor snapshot JSON harian), tapi
-- ternyata TIDAK PERNAH benar-benar dibuat di Supabase Storage -- kode yg
-- menulis ke sana kemungkinan besar diam-diam gagal terus (dibungkus
-- try/catch). Private (bukan public) -- pola yg sama dgn bucket lain yg
-- sudah ada (ktp-verifikator, voice-samples, verificator-faces), dibaca
-- lewat signed URL sesuai kode yg sudah ada di lib/data-center.ts.
insert into storage.buckets (id, name, public)
values ('data-center-files', 'data-center-files', false)
on conflict (id) do nothing;
