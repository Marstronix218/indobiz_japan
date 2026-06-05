-- Reader feedback on articles + auto-generated synthesis-prompt amendments.
-- Apply via Supabase SQL Editor or `supabase db push`.
--
-- Flow: a logged-in reader submits feedback on an article. An LLM "gate"
-- grades it (ACCEPT/REJECT) and, only for safe + constructive + generalizable
-- feedback, emits a short additive guidance line. Accepted guidance lines are
-- stored in prompt_amendments and appended to the synthesis system prompt on
-- the next pipeline run. Reversible: set active=false (or delete) to roll back.

create table if not exists public.article_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  article_id text not null,
  user_id uuid,
  message text not null,
  -- gate result
  gate_verdict text not null,        -- ACCEPT | REJECT
  gate_category text not null,       -- actionable | destructive | incorrect | spam | not_prompt_related
  gate_score double precision,       -- 0..1 confidence
  gate_reason text,                  -- Japanese, shown to admin
  amendment_id uuid                  -- set when this feedback produced an amendment
);

create index if not exists article_feedback_article_id_idx
  on public.article_feedback (article_id);
create index if not exists article_feedback_created_at_idx
  on public.article_feedback (created_at desc);

create table if not exists public.prompt_amendments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  text text not null,                -- the additive guidance line appended to the system prompt
  active boolean not null default true,
  source text not null default 'auto-feedback',
  source_feedback_id uuid            -- the feedback row that triggered this amendment
);

create index if not exists prompt_amendments_active_idx
  on public.prompt_amendments (active, created_at desc);
