-- Article enrichment sections: news background, Japan-business impact,
-- per-article keyword glossary, and main-image caption.
-- Apply via Supabase SQL Editor or `supabase db push` BEFORE deploying the
-- app version that selects these columns.
-- All columns nullable so rows written before this migration remain valid.

alter table public.articles
  add column if not exists background_context text,
  add column if not exists japan_business_impact text,
  add column if not exists keywords jsonb,
  add column if not exists image_caption text;
