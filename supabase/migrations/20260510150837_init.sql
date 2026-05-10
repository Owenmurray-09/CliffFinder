-- CliffFinder initial schema.
--
-- How to run: open the Supabase SQL editor (Dashboard → SQL Editor → New
-- query), paste this whole file, and click Run. Idempotent — safe to re-run
-- if anything fails midway.

-- ============================================================================
-- Tables
-- ============================================================================

create table if not exists public.spots (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete set null,
  name         text not null,
  area         text not null default '',
  lat          double precision not null,
  lng          double precision not null,
  height_m     integer not null,
  depth_m      integer not null,
  rating       numeric not null default 0,
  review_count integer not null default 0,
  difficulty   text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  category     text not null check (category in ('trending', 'saved', 'friends')) default 'friends',
  photos       text[] not null default '{}',
  description  text not null default '',
  water_type   text not null check (water_type in ('lake', 'ocean', 'river', 'quarry', 'falls')),
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists spots_user_id_idx on public.spots (user_id);
create index if not exists spots_category_idx on public.spots (category);

create table if not exists public.saved_spots (
  user_id  uuid not null references auth.users(id) on delete cascade,
  spot_id  text not null references public.spots(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

create index if not exists saved_spots_saved_at_idx on public.saved_spots (user_id, saved_at desc);

create table if not exists public.log_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  spot_id         text not null references public.spots(id) on delete cascade,
  date            date not null default current_date,
  height_jumped_m integer not null,
  water_temp_c    integer not null,
  rating          integer not null check (rating between 1 and 5),
  notes           text,
  tricks          text[] not null default '{}',
  created_at      timestamptz not null default now()
);

create index if not exists log_entries_user_date_idx on public.log_entries (user_id, date desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.spots       enable row level security;
alter table public.saved_spots enable row level security;
alter table public.log_entries enable row level security;

-- spots: anyone signed in can read all rows (community-visible by design);
-- only the owner can update or delete their own. Inserts must own the row.
-- System-seeded rows (user_id null) are read-only at the policy layer; the
-- service role bypasses RLS so we can still seed via the SQL editor.
drop policy if exists "spots_select_authenticated" on public.spots;
create policy "spots_select_authenticated"
  on public.spots for select
  to authenticated
  using (true);

drop policy if exists "spots_insert_owner" on public.spots;
create policy "spots_insert_owner"
  on public.spots for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "spots_update_owner" on public.spots;
create policy "spots_update_owner"
  on public.spots for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "spots_delete_owner" on public.spots;
create policy "spots_delete_owner"
  on public.spots for delete
  to authenticated
  using (auth.uid() = user_id);

-- saved_spots: each user reads + writes only their own rows.
drop policy if exists "saved_spots_select_owner" on public.saved_spots;
create policy "saved_spots_select_owner"
  on public.saved_spots for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "saved_spots_insert_owner" on public.saved_spots;
create policy "saved_spots_insert_owner"
  on public.saved_spots for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "saved_spots_delete_owner" on public.saved_spots;
create policy "saved_spots_delete_owner"
  on public.saved_spots for delete
  to authenticated
  using (auth.uid() = user_id);

-- log_entries: each user reads + writes only their own rows.
drop policy if exists "log_entries_select_owner" on public.log_entries;
create policy "log_entries_select_owner"
  on public.log_entries for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "log_entries_insert_owner" on public.log_entries;
create policy "log_entries_insert_owner"
  on public.log_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "log_entries_update_owner" on public.log_entries;
create policy "log_entries_update_owner"
  on public.log_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "log_entries_delete_owner" on public.log_entries;
create policy "log_entries_delete_owner"
  on public.log_entries for delete
  to authenticated
  using (auth.uid() = user_id);

-- (Seed spots removed. Project starts with an empty `spots` table — users
-- add their own via the Add Spot wizard.)
