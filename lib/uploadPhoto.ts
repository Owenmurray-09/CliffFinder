import { supabase } from './supabase';

const BUCKET = 'spot-photos';

const extFromMime = (mime: string): string => {
  switch (mime) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    default:
      return 'jpg';
  }
};

const randomKey = (): string => Math.random().toString(36).slice(2, 12);

/**
 * Upload a local image (web blob URL or native file URI) to Supabase Storage
 * and return its public URL. Throws on upload error.
 *
 * The path is `<userId>/<folder>/<random>.<ext>` so the storage RLS policies
 * (which scope writes to a folder named after auth.uid()) accept the call.
 * The folder argument lets the same bucket carry spot photos, avatars, and
 * cover images side-by-side without overlapping.
 */
export async function uploadPhoto(
  localUri: string,
  userId: string,
  folder: string = 'spots',
): Promise<string> {
  const res = await fetch(localUri);
  if (!res.ok) throw new Error(`Failed to read local image: ${res.status}`);
  const blob = await res.blob();
  const ext = extFromMime(blob.type);
  const path = `${userId}/${folder}/${Date.now()}-${randomKey()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
