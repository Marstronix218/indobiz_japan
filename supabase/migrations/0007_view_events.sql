-- 記事の閲覧イベント（ベータ期のアクセスランキング用）。
-- 認証記事ページ (ArticleView) のマウント毎に1行 insert される。
-- 旧会員制の `article_views` とは別テーブル。混同しないこと。
-- Apply via Supabase SQL Editor or `supabase db push`.

create table if not exists public.article_view_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  viewed_at timestamptz not null default now()
);

create index if not exists article_view_events_viewed_at_idx
  on public.article_view_events (viewed_at);

create index if not exists article_view_events_article_viewed_idx
  on public.article_view_events (article_id, viewed_at);

-- RLS 有効。クライアント直アクセスは無し。読み書きは service-role のみ。
alter table public.article_view_events enable row level security;
