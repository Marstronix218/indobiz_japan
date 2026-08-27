-- Official release campaign: authenticated readers can access all published
-- articles without the former 14-day beta or survey-extension requirement.

drop policy if exists "articles authenticated beta read" on public.articles;
drop policy if exists "article_sources authenticated beta read" on public.article_sources;
drop policy if exists "articles authenticated campaign read" on public.articles;
drop policy if exists "article_sources authenticated campaign read" on public.article_sources;

create policy "articles authenticated campaign read"
  on public.articles for select to authenticated
  using (
    workflow_status = 'published'
    and (
      auth.jwt() -> 'app_metadata' ->> 'indobiz_line_campaign' = 'true'
      or auth.jwt() -> 'app_metadata' ->> 'indobiz_line_verified' = 'true'
    )
  );

create policy "article_sources authenticated campaign read"
  on public.article_sources for select to authenticated
  using (
    (
      auth.jwt() -> 'app_metadata' ->> 'indobiz_line_campaign' = 'true'
      or auth.jwt() -> 'app_metadata' ->> 'indobiz_line_verified' = 'true'
    )
    and
    exists (
      select 1 from public.articles a
      where a.id = article_sources.article_id
        and a.workflow_status = 'published'
    )
  );
