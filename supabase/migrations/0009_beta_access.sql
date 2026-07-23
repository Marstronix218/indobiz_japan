-- Per-user beta access. Access is granted only to authenticated users whose
-- initial trial or survey extension is still active. Server/service-role code
-- owns creation and updates of these rows.

create table if not exists public.beta_access (
  user_id uuid primary key references auth.users(id) on delete cascade,
  trial_started_at timestamptz not null default now(),
  survey_completed_at timestamptz,
  extension_started_at timestamptz,
  extension_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beta_access_extension_period_check check (
    (extension_started_at is null and extension_expires_at is null)
    or (
      survey_completed_at is not null
      and
      extension_started_at is not null
      and extension_expires_at = extension_started_at + interval '14 days'
    )
  )
);

-- Keep a bootstrap-created or partially applied table compatible on re-runs.
alter table public.beta_access
  add column if not exists trial_started_at timestamptz not null default now(),
  add column if not exists survey_completed_at timestamptz,
  add column if not exists extension_started_at timestamptz,
  add column if not exists extension_expires_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.beta_access
  drop constraint if exists beta_access_extension_period_check,
  add constraint beta_access_extension_period_check check (
    (extension_started_at is null and extension_expires_at is null)
    or (
      survey_completed_at is not null
      and extension_started_at is not null
      and extension_expires_at = extension_started_at + interval '14 days'
    )
  );

create index if not exists beta_access_extension_expires_at_idx
  on public.beta_access (extension_expires_at)
  where extension_expires_at is not null;

drop trigger if exists beta_access_set_updated_at on public.beta_access;
create trigger beta_access_set_updated_at
  before update on public.beta_access
  for each row execute function public.set_updated_at();

alter table public.beta_access enable row level security;

drop policy if exists "beta_access users read own" on public.beta_access;
create policy "beta_access users read own"
  on public.beta_access for select to authenticated
  using (user_id = auth.uid());

-- service_role bypasses RLS. Intentionally do not create client write policies.

-- The shared survey-completion code is validated by the server before this
-- service-role-only function is called. Row locking makes one-time redemption
-- atomic even when requests arrive concurrently.
create or replace function public.redeem_beta_extension(p_user_id uuid)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  access_row public.beta_access%rowtype;
  redeemed_at timestamptz;
begin
  select *
    into access_row
    from public.beta_access
    where user_id = p_user_id
    for update;

  if not found then
    return 'not_found';
  end if;

  if access_row.extension_started_at is not null then
    return 'already_used';
  end if;

  if now() < access_row.trial_started_at + interval '14 days' then
    return 'not_ready';
  end if;

  redeemed_at := clock_timestamp();

  update public.beta_access
    set survey_completed_at = redeemed_at,
        extension_started_at = redeemed_at,
        extension_expires_at = redeemed_at + interval '14 days'
    where user_id = p_user_id;

  return 'success';
end;
$$;

revoke all on function public.redeem_beta_extension(uuid)
  from public, anon, authenticated;
grant execute on function public.redeem_beta_extension(uuid) to service_role;

-- Remove the old anonymous/public policies before allowing beta readers.
drop policy if exists "articles public read" on public.articles;
drop policy if exists "article_sources public read" on public.article_sources;
drop policy if exists "articles authenticated beta read" on public.articles;
drop policy if exists "article_sources authenticated beta read" on public.article_sources;

create policy "articles authenticated beta read"
  on public.articles for select to authenticated
  using (
    workflow_status = 'published'
    and exists (
      select 1 from public.beta_access b
      where b.user_id = auth.uid()
        and (
          now() < b.trial_started_at + interval '14 days'
          or b.extension_expires_at > now()
        )
    )
  );

create policy "article_sources authenticated beta read"
  on public.article_sources for select to authenticated
  using (
    exists (
      select 1 from public.articles a
      where a.id = article_sources.article_id
        and a.workflow_status = 'published'
    )
    and exists (
      select 1 from public.beta_access b
      where b.user_id = auth.uid()
        and (
          now() < b.trial_started_at + interval '14 days'
          or b.extension_expires_at > now()
        )
    )
  );
