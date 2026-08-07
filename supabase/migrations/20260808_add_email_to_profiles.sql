-- ============================================================================
-- FIX: profiles tidak punya kolom email, padahal lib/supabase-auth-server.ts
-- (jalur JWT/myai_session, dwisesi) query `.eq("email", ...)` ke tabel ini.
-- Tanggal: 2026-08-08
-- ============================================================================
--
-- Akibat sebelum fix: query .eq("email", session.email) selalu gagal diam-diam
-- (kolom tidak ada) -> getCurrentUserProfile() jatuh ke profil sintetis
-- (id dari gw_users, BUKAN dari profiles/auth.users) -> data profil asli
-- (avatar, nama, skor) tidak pernah terbaca untuk akun yang login lewat
-- jalur JWT lama (owner/developer, termasuk akun test.* hasil seed script).

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Backfill baris yang sudah ada dari auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Perbarui trigger sync (dari 20260807_google_oauth_and_users_sync.sql)
-- supaya kolom email otomatis terisi utk signup baru & update profil OAuth.
CREATE OR REPLACE FUNCTION public.handle_new_user_sync()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url, email, role, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User'),
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    avatar_url = EXCLUDED.avatar_url,
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
