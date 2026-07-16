-- IndoBiz Japan — current Supabase bootstrap
-- Paste this entire file into Supabase SQL Editor and run once.
-- Keeps the base article schema in sync with migrations through 0008 and is
-- safe to re-run when an older bootstrap created the tables first.

create extension if not exists "pgcrypto";

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  source text not null,
  source_url text,
  published_at timestamptz not null,
  category text not null,
  industry_tags text[] not null default '{}',
  implications text[] not null default '{}',
  content_type text not null default 'news',
  visibility text not null default 'public',
  workflow_status text not null default 'published',
  image_url text,
  image_caption text,
  background_context text,
  japan_business_impact text,
  keywords jsonb,
  featured boolean not null default false,
  is_synthesized boolean not null default false,
  dedupe_key text,
  market_snapshot jsonb,
  author_name text,
  author_title text,
  author_bio text,
  author_avatar_url text,
  quality_verdict text,
  quality_notes text,
  revision_count integer not null default 0,
  last_quality_check_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- `create table if not exists` does not add columns to an older table. Keep
-- the bootstrap idempotent for environments created before enrichment landed.
alter table public.articles
  add column if not exists market_snapshot jsonb,
  add column if not exists image_caption text,
  add column if not exists background_context text,
  add column if not exists japan_business_impact text,
  add column if not exists keywords jsonb,
  add column if not exists author_name text,
  add column if not exists author_title text,
  add column if not exists author_bio text,
  add column if not exists author_avatar_url text,
  add column if not exists quality_verdict text,
  add column if not exists quality_notes text,
  add column if not exists revision_count integer not null default 0,
  add column if not exists last_quality_check_at timestamptz;

create index if not exists articles_published_at_desc
  on public.articles (published_at desc);

create unique index if not exists articles_dedupe
  on public.articles (dedupe_key)
  where dedupe_key is not null;

create table if not exists public.article_sources (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  source_name text,
  original_title text not null,
  original_url text not null,
  canonical_url text,
  original_published_at timestamptz,
  fetched_at timestamptz,
  extracted_by text,
  source_language text,
  evidence_snippets text[] not null default '{}',
  display_order int not null default 0
);

create index if not exists article_sources_article_id
  on public.article_sources (article_id);

create table if not exists public.article_view_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create index if not exists article_view_events_viewed_at_idx
  on public.article_view_events (viewed_at);

create index if not exists article_view_events_article_viewed_idx
  on public.article_view_events (article_id, viewed_at);

-- ============================================================
-- updated_at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row-level security
-- ============================================================

alter table public.articles enable row level security;
alter table public.article_sources enable row level security;
alter table public.article_view_events enable row level security;

drop policy if exists "articles public read" on public.articles;
create policy "articles public read"
  on public.articles for select
  using (workflow_status = 'published');

drop policy if exists "article_sources public read" on public.article_sources;
create policy "article_sources public read"
  on public.article_sources for select
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_sources.article_id
        and a.workflow_status = 'published'
    )
  );

-- service_role bypasses RLS, so admin writes from the server work without
-- additional policies.

-- ============================================================
-- Storage bucket for AI-generated article images
-- ============================================================

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do update set public = true;
