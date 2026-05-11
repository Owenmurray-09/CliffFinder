-- Per-user safety ratings on spots. One rating per (user, spot); upsert to
-- change, delete to clear. Aggregates surface via a view so the client can
-- show "★ 4.6 · 128 ratings" without depending on a cached column.

create table if not exists public.spot_ratings (
  user_id    uuid not null references auth.users(id) on delete cascade,
  spot_id    text not null references public.spots(id) on delete cascade,
  value      integer not null check (value between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (user_id, spot_id)
);

create index if not exists spot_ratings_spot_idx on public.spot_ratings (spot_id);

create or replace view public.spot_rating_aggregates as
  select
    spot_id,
    avg(value)::numeric(3, 2) as avg_rating,
    count(*)::integer         as review_count
  from public.spot_ratings
  group by spot_id;

alter table public.spot_ratings enable row level security;

-- Anyone signed in can read any rating — lets the client compute aggregates
-- and (later) show who-rated-what.
drop policy if exists "ratings_read_authenticated" on public.spot_ratings;
create policy "ratings_read_authenticated"
  on public.spot_ratings for select
  to authenticated
  using (true);

drop policy if exists "ratings_insert_owner" on public.spot_ratings;
create policy "ratings_insert_owner"
  on public.spot_ratings for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "ratings_update_owner" on public.spot_ratings;
create policy "ratings_update_owner"
  on public.spot_ratings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ratings_delete_owner" on public.spot_ratings;
create policy "ratings_delete_owner"
  on public.spot_ratings for delete
  to authenticated
  using (auth.uid() = user_id);
