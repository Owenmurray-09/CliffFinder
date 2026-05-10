-- Display name + handle (username) on the per-user profile.

alter table public.profiles
  add column if not exists display_name text,
  add column if not exists handle       text;

-- Handles are case-insensitively unique. Lowercase index also makes lookups
-- predictable when we later add @username search.
create unique index if not exists profiles_handle_lower_idx
  on public.profiles (lower(handle))
  where handle is not null;
