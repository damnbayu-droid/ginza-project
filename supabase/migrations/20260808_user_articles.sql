-- Skema Tabel Portal Artikel Publik (User & Verificator Articles)
-- Tanggal: 2026-08-08

CREATE TABLE IF NOT EXISTS public.user_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL DEFAULT 'Pengetahuan & Sejarah', -- 'Pengetahuan & Sejarah' | 'Musik, Seni & Budaya' | 'Teori & Tesis'
  region TEXT NOT NULL DEFAULT 'Umum', -- 'Boltim' | 'Bolsel' | 'Bolmut' | 'Bolmong' | 'Kotamobagu' | 'Umum'
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  views_count INT NOT NULL DEFAULT 0,
  shares_count INT NOT NULL DEFAULT 0,
  likes_count INT NOT NULL DEFAULT 0,
  dislikes_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published', -- 'published' | 'draft' | 'archived'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES public.user_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks Kinerja Query FYP & Filter
CREATE INDEX IF NOT EXISTS idx_user_articles_slug ON public.user_articles(slug);
CREATE INDEX IF NOT EXISTS idx_user_articles_category ON public.user_articles(category);
CREATE INDEX IF NOT EXISTS idx_user_articles_region ON public.user_articles(region);
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON public.article_comments(article_id);
