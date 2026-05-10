-- Log entries can now carry attached media (photos + videos). Stored as a
-- text[] of public URLs, same convention as spots.photos.

alter table public.log_entries
  add column if not exists photos text[] not null default '{}';

-- Expand the spot-photos bucket to accept video too (capped at 50 MB).
update storage.buckets
  set
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/quicktime', 'video/webm'
    ],
    file_size_limit = 52428800
  where id = 'spot-photos';
