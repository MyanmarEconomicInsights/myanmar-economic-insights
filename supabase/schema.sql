-- Myanmar Economic Insights (MEI) — Supabase schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Table names are prefixed "monitor_" so they can live safely inside an existing project.

create table if not exists public.monitor_posts (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  kind          text not null check (kind in ('daily', 'weekly')),
  title         text not null,
  dek           text,                          -- one-line summary shown in lists
  body_md       text not null default '',      -- optional overview paragraph (Markdown)
  sections      jsonb not null default '[]',   -- one per category: [{category, value, label, text_md, source}]
                                               -- category is one of: prices, trade, business, money, conflict
  sources       jsonb not null default '[]',   -- [{name, url, date}]
  period_start  date,
  period_end    date,
  status        text not null default 'published' check (status in ('draft', 'published')),
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists monitor_posts_kind_pub_idx on public.monitor_posts (kind, published_at desc);

create table if not exists public.monitor_indicators (
  id           bigserial primary key,
  key          text not null,                 -- e.g. 'mmk_usd_street', 'rice_low_grade'
  category     text check (category in ('prices','trade','business','money','conflict')),
  label        text not null,
  value        numeric not null,
  unit         text,
  location     text not null default '',      -- '' = national
  observed_on  date not null,
  source       text not null,                 -- every figure needs a named source
  source_url   text,
  note         text,
  created_at   timestamptz not null default now(),
  unique (key, location, observed_on)
);

create index if not exists monitor_indicators_key_date_idx on public.monitor_indicators (key, observed_on desc);
create index if not exists monitor_indicators_cat_idx on public.monitor_indicators (category, observed_on desc);

-- Keep updated_at current
create or replace function public.monitor_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;

drop trigger if exists monitor_posts_touch on public.monitor_posts;
create trigger monitor_posts_touch before update on public.monitor_posts
  for each row execute function public.monitor_touch_updated_at();

-- Row Level Security: the public can READ published content only.
-- All writes go through the website's /api routes using the service-role key (kept server-side in Vercel).
alter table public.monitor_posts enable row level security;
alter table public.monitor_indicators enable row level security;

drop policy if exists "public read published posts" on public.monitor_posts;
create policy "public read published posts" on public.monitor_posts
  for select using (status = 'published');

drop policy if exists "public read indicators" on public.monitor_indicators;
create policy "public read indicators" on public.monitor_indicators
  for select using (true);

-- Status boards (trade routes and border gates; economic pressure points)
create table if not exists public.monitor_status (
  id       bigserial primary key,
  board    text not null check (board in ('trade','hotspot')),
  name     text not null,
  place    text not null default '',
  status   text not null,                       -- pill text, e.g. 'Reopened'
  level    text not null check (level in ('open','restricted','serious','closed')),
  note     text,
  source   text not null,
  as_of    date not null,
  sort     int not null default 99,
  updated_at timestamptz not null default now(),
  unique (board, name)
);
alter table public.monitor_status enable row level security;
drop policy if exists "public read status" on public.monitor_status;
create policy "public read status" on public.monitor_status for select using (true);
