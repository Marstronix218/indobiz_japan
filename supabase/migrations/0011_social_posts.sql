-- SNS自動投稿の記録。毎朝のX投稿(将来LinkedInも)の二重投稿防止と履歴用。
--
-- - 1プラットフォームにつき1日1件(posted_on は日本時間の日付)
-- - 同じ記事を同じプラットフォームに2回投稿しない
-- どちらも失敗(status = 'failed')した行は数えないので、失敗した日は再実行できる。
--
-- サイト本体はこのテーブルを読まない。未適用のまま deploy しても記事表示には影響せず、
-- 投稿cronが「記録できないので投稿しない」で止まるだけ(フェイルクローズ)。

create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('x', 'linkedin')),
  article_id uuid not null references public.articles (id) on delete cascade,
  posted_on date not null,
  status text not null default 'pending' check (status in ('pending', 'posted', 'failed')),
  post_text text not null,
  external_id text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists social_posts_one_per_day
  on public.social_posts (platform, posted_on)
  where status <> 'failed';

create unique index if not exists social_posts_one_per_article
  on public.social_posts (platform, article_id)
  where status <> 'failed';

-- service role からのみ読み書きする。anon/authenticated には何も見せない。
alter table public.social_posts enable row level security;
