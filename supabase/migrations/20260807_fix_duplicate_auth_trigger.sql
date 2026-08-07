-- ============================================================================
-- FIX: Trigger ganda pada auth.users menyebabkan SEMUA signup baru gagal
-- Tanggal: 2026-08-07
-- ============================================================================
--
-- Migration 20260803_ginza_platform_schema.sql memasang trigger
-- `trg_on_auth_user_created` -> handle_new_user() (plain INSERT, tanpa
-- ON CONFLICT) pada AFTER INSERT ON auth.users.
--
-- Migration 20260807_google_oauth_and_users_sync.sql (ditambahkan terpisah,
-- tanpa menghapus trigger lama di atas) memasang trigger KEDUA
-- `on_auth_user_created_sync` -> handle_new_user_sync() (upsert, dengan
-- ON CONFLICT DO UPDATE) pada AFTER INSERT OR UPDATE ON auth.users.
--
-- Postgres menjalankan AFTER trigger untuk event yang sama secara alfabetis
-- berdasarkan nama trigger. "on_auth_user_created_sync" (o...) berjalan
-- LEBIH DULU daripada "trg_on_auth_user_created" (t...), jadi baris profiles
-- sudah ada duluan saat trigger kedua (yang TIDAK punya ON CONFLICT) mencoba
-- INSERT lagi -> duplicate key violation -> SELURUH transaksi signup
-- (baik daftar email/password maupun login Google OAuth pertama kali)
-- di-ROLLBACK dan gagal.
--
-- Fix: hapus trigger + fungsi lama, sisakan hanya satu jalur sinkronisasi
-- auth.users -> public.profiles (on_auth_user_created_sync / handle_new_user_sync).

drop trigger if exists trg_on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
