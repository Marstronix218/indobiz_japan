-- Beta reader funnel: qualified preview reads, survey responses, and access grants.
-- Apply via Supabase SQL Editor or `supabase db push`.

create table if not exists public.beta_preview_articles (
  article_id uuid primary key references public.articles(id) on delete cascade,
  display_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Give a new environment a useful preview pool immediately. Editors can replace
-- these rows later without changing application code.
insert into public.beta_preview_articles (article_id, display_order)
select id, row_number() over (order by published_at desc)::integer
from public.articles
where workflow_status = 'published'
  and not exists (select 1 from public.beta_preview_articles)
order by published_at desc
limit 10
on conflict (article_id) do nothing;

create table if not exists public.access_entitlements (
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('survey', 'line_friend', 'legacy_beta', 'admin')),
  proof_ref text,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  primary key (user_id, source)
);

create index if not exists access_entitlements_active_user_idx
  on public.access_entitlements (user_id, expires_at)
  where revoked_at is null;

create unique index if not exists access_entitlements_line_proof_unique
  on public.access_entitlements (proof_ref)
  where source = 'line_friend' and proof_ref is not null;

create table if not exists public.beta_article_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  qualified_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

create index if not exists beta_article_reads_user_idx
  on public.beta_article_reads (user_id, qualified_at desc);

alter table public.article_view_events
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists view_date date not null default current_date;

create unique index if not exists article_view_events_user_daily_unique
  on public.article_view_events (user_id, article_id, view_date)
  where user_id is not null;

create table if not exists public.beta_survey_responses (
  user_id uuid primary key references auth.users(id) on delete cascade,
  answers jsonb not null,
  policy_version text not null default '2026-07-21',
  submitted_at timestamptz not null default now(),
  constraint beta_survey_answers_object check (jsonb_typeof(answers) = 'object')
);

create table if not exists public.beta_access_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event text not null check (event in (
    'preview_read_qualified', 'gate_view', 'survey_view',
    'survey_submitted', 'line_unlock_granted'
  )),
  article_id uuid references public.articles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  constraint beta_access_events_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists beta_access_events_user_time_idx
  on public.beta_access_events (user_id, occurred_at desc);
create index if not exists beta_access_events_event_time_idx
  on public.beta_access_events (event, occurred_at desc);

alter table public.beta_preview_articles enable row level security;
alter table public.access_entitlements enable row level security;
alter table public.beta_article_reads enable row level security;
alter table public.beta_survey_responses enable row level security;
alter table public.beta_access_events enable row level security;

-- Article payloads are now fetched only by trusted server code. With RLS enabled
-- and no replacement SELECT policy, anon/authenticated clients cannot retrieve
-- the full article or source rows directly through Supabase REST.
drop policy if exists "articles public read" on public.articles;
drop policy if exists "article_sources public read" on public.article_sources;

create or replace function public.grant_beta_access(
  p_user_id uuid,
  p_source text,
  p_proof_ref text default null,
  p_expires_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  granted_rows integer;
begin
  if p_source not in ('survey', 'line_friend', 'legacy_beta', 'admin') then
    raise exception 'invalid access source';
  end if;

  if p_source = 'line_friend' and coalesce(p_proof_ref, '') = '' then
    raise exception 'LINE proof is required';
  end if;

  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'expiry must be in the future';
  end if;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'user not found';
  end if;

  insert into public.access_entitlements (
    user_id, source, proof_ref, granted_at, expires_at, revoked_at
  )
  values (p_user_id, p_source, p_proof_ref, now(), p_expires_at, null)
  on conflict (user_id, source) do update
  set proof_ref = excluded.proof_ref,
      granted_at = excluded.granted_at,
      expires_at = excluded.expires_at
  where public.access_entitlements.revoked_at is null;

  get diagnostics granted_rows = row_count;

  if p_source = 'line_friend' and granted_rows > 0 then
    insert into public.beta_access_events (user_id, event)
    values (p_user_id, 'line_unlock_granted');
  end if;
end;
$$;

create or replace function public.submit_beta_survey(
  p_answers jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  qualified_reads integer;
  current_user_id uuid := auth.uid();
  inserted_response boolean;
begin
  if current_user_id is null then
    raise exception 'authentication required';
  end if;

  if jsonb_typeof(p_answers) <> 'object' then
    raise exception 'answers must be an object';
  end if;

  if octet_length(p_answers::text) > 16384
    or (p_answers - array[
      'role', 'industry', 'indiaStage', 'usefulness', 'trust',
      'desiredInformation', 'feedback', 'privacyConsent'
    ]::text[]) <> '{}'::jsonb
    or p_answers->>'role' not in ('executive', 'business_development', 'research', 'other')
    or p_answers->>'indiaStage' not in ('considering', 'preparing', 'operating', 'none')
    or jsonb_typeof(p_answers->'usefulness') <> 'number'
    or jsonb_typeof(p_answers->'trust') <> 'number'
    or (p_answers->>'usefulness')::integer not between 1 and 5
    or (p_answers->>'trust')::integer not between 1 and 5
    or length(coalesce(p_answers->>'industry', '')) > 80
    or length(coalesce(p_answers->>'desiredInformation', '')) not between 1 and 500
    or length(coalesce(p_answers->>'feedback', '')) > 1000
    or p_answers->'privacyConsent' <> 'true'::jsonb
  then
    raise exception 'invalid survey answers';
  end if;

  select count(*)::integer
  into qualified_reads
  from public.beta_article_reads r
  where r.user_id = current_user_id;

  if qualified_reads < 5 then
    raise exception 'five qualified preview reads are required';
  end if;

  insert into public.beta_survey_responses (
    user_id, answers, policy_version, submitted_at
  )
  values (current_user_id, p_answers, '2026-07-21', now())
  on conflict (user_id) do nothing
  returning true into inserted_response;

  insert into public.access_entitlements (
    user_id, source, proof_ref, granted_at, expires_at, revoked_at
  )
  values (current_user_id, 'survey', 'beta-survey:2026-07-21', now(), null, null)
  on conflict (user_id, source) do nothing;

  if coalesce(inserted_response, false) then
    insert into public.beta_access_events (user_id, event)
    values (current_user_id, 'survey_submitted');
  end if;
end;
$$;

create or replace function public.record_beta_read(
  p_user_id uuid,
  p_article_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_read boolean;
begin
  if not exists (
    select 1
    from public.beta_preview_articles p
    join public.articles a on a.id = p.article_id
    where p.article_id = p_article_id
      and p.active
      and a.workflow_status = 'published'
  ) then
    raise exception 'article is not an active beta preview';
  end if;

  if not exists (select 1 from auth.users where id = p_user_id) then
    raise exception 'user not found';
  end if;

  insert into public.beta_article_reads (user_id, article_id, qualified_at)
  values (p_user_id, p_article_id, now())
  on conflict (user_id, article_id) do nothing
  returning true into inserted_read;

  if coalesce(inserted_read, false) then
    insert into public.beta_access_events (user_id, event, article_id)
    values (p_user_id, 'preview_read_qualified', p_article_id);
  end if;
end;
$$;

revoke all on function public.grant_beta_access(uuid, text, text, timestamptz)
  from public, anon, authenticated;
revoke all on function public.submit_beta_survey(jsonb)
  from public, anon, authenticated;
grant execute on function public.grant_beta_access(uuid, text, text, timestamptz)
  to service_role;
grant execute on function public.submit_beta_survey(jsonb)
  to authenticated;
revoke all on function public.record_beta_read(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.record_beta_read(uuid, uuid)
  to service_role;

-- Preserve access for accounts that existed before the beta funnel was enabled.
insert into public.access_entitlements (user_id, source, proof_ref)
select id, 'legacy_beta', 'migration:0009'
from auth.users
on conflict (user_id, source) do nothing;
