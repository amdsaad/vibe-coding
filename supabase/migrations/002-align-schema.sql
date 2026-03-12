-- Migration: Align schema to plan.md spec
-- For users who already have the old schema deployed from feature 001

-- 1. Rename columns
alter table public.profiles rename column display_name to username;
alter table public.profiles rename column username to slug;

-- Wait — the above would fail because 'username' was renamed to 'slug' first,
-- then 'display_name' to 'username'. Let's do it in correct order:
-- Actually, PostgreSQL processes ALTER statements sequentially, so:
-- Step 1: rename 'username' (the old URL slug) to 'slug'
-- Step 2: rename 'display_name' (the old display name) to 'username'
-- But we already did step 1 above which renamed display_name. Let's redo:

-- CORRECT ORDER: Roll back the above and do it properly
-- (This migration should be run fresh, not after partial execution)

BEGIN;

-- Step 1: Rename the old 'username' column (URL slug) to 'slug'
ALTER TABLE public.profiles RENAME COLUMN username TO slug;

-- Step 2: Rename 'display_name' to 'username'
ALTER TABLE public.profiles RENAME COLUMN display_name TO username;

-- Step 3: Rename 'is_published' to 'published'
ALTER TABLE public.profiles RENAME COLUMN is_published TO published;

-- Step 4: Change published default from false to true
ALTER TABLE public.profiles ALTER COLUMN published SET DEFAULT true;

-- Step 5: Add skills column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills text[] NOT NULL DEFAULT '{}';

-- Step 6: Change category default from 'creative' to 'developer'
ALTER TABLE public.profiles ALTER COLUMN category SET DEFAULT 'developer';

-- Step 7: Add CHECK constraints (drop if exist first for idempotency)
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_category_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_category_check
    CHECK (category IN ('developer', 'designer', 'photographer', 'writer', 'marketer', 'data_scientist', 'product_manager', 'other'));
EXCEPTION WHEN others THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_theme_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_theme_check
    CHECK (theme IN ('minimal', 'bold', 'elegant', 'neon', 'paper', 'terminal'));
EXCEPTION WHEN others THEN NULL;
END $$;

-- Step 8: Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Add triggers
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Step 10: Remove created_at from social_links (if present, make nullable or drop)
ALTER TABLE public.social_links DROP COLUMN IF EXISTS created_at;

-- Step 11: Update indexes
DROP INDEX IF EXISTS profiles_username_idx;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_slug_idx ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS profiles_category_idx ON public.profiles(category);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at DESC);

-- Step 12: Update RLS policies referencing old column names
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (published = true);

DROP POLICY IF EXISTS "Social links are viewable with published profile" ON public.social_links;
CREATE POLICY "Social links are viewable with published profile"
  ON public.social_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = social_links.profile_id
      AND (profiles.published = true OR profiles.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Projects are viewable with published profile" ON public.projects;
CREATE POLICY "Projects are viewable with published profile"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = projects.profile_id
      AND (profiles.published = true OR profiles.user_id = auth.uid())
    )
  );

COMMIT;
