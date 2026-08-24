-- Tambah event_type "button_click" ke metrics_events -- dipakai Panel
-- Metrics admin utk hitung klik Kamus/Knowledge/Transliterasi/Aksara/
-- Latihan/Game/Ecosystem/Dashboard/Pengaturan/CTA Login/CTA Feedback/
-- CTA Info/Bogani AI Voice Mode (target_text menyimpan nama tombolnya,
-- bukan enum terpisah per tombol -- lebih fleksibel utk tombol baru nanti).
alter table public.metrics_events drop constraint if exists metrics_events_event_type_check;
alter table public.metrics_events add constraint metrics_events_event_type_check
  check (event_type in ('kamus_search', 'kamus_click', 'knowledge_view', 'ai_question', 'button_click'));
