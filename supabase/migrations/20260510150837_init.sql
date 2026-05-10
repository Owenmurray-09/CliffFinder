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

-- ============================================================================
-- Seed: the 5 Costa Rica demo spots (system-owned, user_id null)
-- ============================================================================

insert into public.spots (
  id, user_id, name, area, lat, lng, height_m, depth_m, rating, review_count,
  difficulty, category, photos, description, water_type, notes
) values
(
  'eagle', null, 'Eagle Cliff', 'Curridabat, CR',
  9.9145, -84.0294, 18, 6, 4.6, 128, 'intermediate', 'trending',
  array[
    'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1200&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'
  ],
  'Park at the trailhead lot. 15-min hike up the south path; rope assist on the last 20 ft.',
  'ocean',
  'Watch for boats in summer. Check water level after heavy rain.'
),
(
  'hidden', null, 'Hidden Quarry', 'Alajuela, CR',
  10.0162, -84.2120, 12, 8, 4.3, 64, 'beginner', 'saved',
  array[
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
    'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1200&q=80'
  ],
  'Old quarry that fills with snowmelt. Calm flat surface, easy walk-in from the trailhead.',
  'quarry',
  'Best on weekday mornings. Surface stays choppy in afternoon wind.'
),
(
  'riverside', null, 'Riverside Bridge', 'San José, CR',
  9.9281, -84.0907, 8, 4, 3.8, 41, 'beginner', 'friends',
  array['https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1200&q=80'],
  'Footbridge with a wide swimming hole below. Park along the path and walk down to the bank.',
  'river',
  'Watch the current after rain — entry zone shifts. Popular weekend hangout.'
),
(
  'mossy', null, 'Mossy Falls', 'Bajos del Toro, CR',
  10.2050, -84.2980, 22, 10, 4.8, 212, 'advanced', 'trending',
  array[
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    'https://images.unsplash.com/photo-1431794062232-2a99a5431c6c?w=1200&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'
  ],
  'Hike 30 minutes from the road, scramble down the boulder field to the plunge pool at the falls base.',
  'falls',
  'Advanced jumpers only — entry window is narrow. Cold year-round.'
),
(
  'vista', null, 'Vista Point', 'Cartago, CR',
  9.8638, -83.9197, 15, 7, 4.4, 88, 'intermediate', 'saved',
  array[
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80'
  ],
  'Lakeside cliff with a viewpoint at the top. 10-minute walk from the lakeshore trailhead.',
  'lake',
  'Mid-range height, clean water, broad landing area. Great first-trip spot.'
)
on conflict (id) do nothing;
