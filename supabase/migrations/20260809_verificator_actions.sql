-- Migration: Add Verificator Actions, Verification Status, and Notes across Knowledge, Kamus, and Aksara

-- 1. Ensure verification columns exist on knowledge_articles
ALTER TABLE IF EXISTS knowledge_articles
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_by UUID,
  ADD COLUMN IF NOT EXISTS verificator_notes TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 2. Ensure verification columns exist on kamus_entries
ALTER TABLE IF EXISTS kamus_entries
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_by UUID,
  ADD COLUMN IF NOT EXISTS verificator_notes TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- 3. Ensure aksara_submissions table exists with verification fields
CREATE TABLE IF NOT EXISTS aksara_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  author_name TEXT,
  title TEXT NOT NULL,
  latin_text TEXT NOT NULL,
  aksara_text TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  verification_status TEXT DEFAULT 'pending',
  verified_by UUID,
  verificator_notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create log table for verificator action history
CREATE TABLE IF NOT EXISTS verificator_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verificator_id UUID NOT NULL,
  target_domain TEXT NOT NULL, -- 'knowledge', 'kamus', 'aksara'
  target_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'verify', 'comment', 'reject'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
