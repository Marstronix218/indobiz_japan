-- Add per-article column/editorial author profile to articles.
-- Apply via Supabase SQL Editor or `supabase db push`.
-- All columns nullable so rows written before this migration remain valid;
-- only column/editorial articles populate them.

alter table public.articles
  add column if not exists author_name text,
  add column if not exists author_title text,
  add column if not exists author_bio text,
  add column if not exists author_avatar_url text;
