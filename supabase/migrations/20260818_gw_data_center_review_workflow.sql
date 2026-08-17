-- Alur review utk gw_data_center: kolom manual_review_required/confidence_score
-- sudah ada sejak awal (20260717_data_center.sql) tapi belum pernah ada
-- panel admin yg memakainya -- tambah kolom status review yg jelas (bukan
-- cuma boolean) + audit siapa/kapan, spy panel Setuju/Tolak (mirip Kontribusi
-- Panel) bisa query & update dgn rapi.

ALTER TABLE public.gw_data_center
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_gw_data_center_review_status_created
  ON public.gw_data_center (review_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gw_data_center_source_type_created
  ON public.gw_data_center (source_type, created_at DESC);

-- "chatbot_interaction" dipakai app/api/homepage/chat/route.ts sejak lama tapi
-- TIDAK ADA di CHECK constraint asli (cuma ocr_upload/url_scrape/manual_document/
-- chat_memory_fact) -- insert-nya kemungkinan besar diam-diam gagal terus
-- (dibungkus try/catch, cuma console.warn). Kode diperbaiki utk pakai
-- "chat_memory_fact" yg SUDAH ada di constraint (memang dimaksudkan utk kasus
-- ini), jadi constraint-nya sendiri TIDAK diubah -- cukup kodenya yg diperbaiki.
