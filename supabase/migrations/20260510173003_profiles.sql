-- Per-user profile metadata (avatar + cover image URLs). One row per user.

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  avatar_url  text,
  cover_url   text,
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_owner" on public.profiles;
create policy "profiles_select_owner"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_owner" on public.profiles;
create policy "profiles_insert_owner"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_owner" on public.profiles;
create policy "profiles_update_owner"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
