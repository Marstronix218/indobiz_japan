-- X自動投稿を1日3回(朝7:00 / 昼12:15 / 夜21:00 JST)にするため、
-- 「1日1件」の制限を「1枠1件」に置き換える。
--
-- - 既存行は slot='morning' になる(旧コードも slot を指定せず insert するので、
--   このmigrationを先に適用してもデプロイ前の投稿は壊れない)。
-- - 「同じ記事は1回」(social_posts_one_per_article)はそのまま。
--   記事が被らないのはこの索引と、投稿前の履歴チェックの二重で保証している。

alter table public.social_posts
  add column if not exists slot text not null default 'morning'
  check (slot in ('morning', 'noon', 'evening'));

drop index if exists public.social_posts_one_per_day;

create unique index if not exists social_posts_one_per_slot
  on public.social_posts (platform, posted_on, slot)
  where status <> 'failed';
