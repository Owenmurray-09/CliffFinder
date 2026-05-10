-- RLS policies for the spot-photos storage bucket. The bucket itself is
-- created via insert into storage.buckets (idempotent, see prior session).

-- Anyone (including unauthenticated visitors) can read photos. The bucket
-- is public; this just makes the policy explicit so future audits show why.
drop policy if exists "spot_photos_public_read" on storage.objects;
create policy "spot_photos_public_read"
  on storage.objects for select
  using (bucket_id = 'spot-photos');

-- Authenticated users can upload only into a folder named after their own
-- user id. This keeps each user's uploads in a stable namespace and means
-- a user can't overwrite or pollute another user's files.
drop policy if exists "spot_photos_owner_insert" on storage.objects;
create policy "spot_photos_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'spot-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete only their own files.
drop policy if exists "spot_photos_owner_delete" on storage.objects;
create policy "spot_photos_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'spot-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Bucket creation, idempotent. Mirrors the manual seed step so a fresh
-- environment can apply this migration alone and end up with the same state.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'spot-photos',
  'spot-photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
