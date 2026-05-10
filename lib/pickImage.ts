import * as ImagePicker from 'expo-image-picker';

export type PickedImage = { uri: string; isVideo: boolean };

/** Open the OS image picker. Returns the picked image/video's local URI, or null if cancelled. */
export async function pickImage(): Promise<PickedImage | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    allowsEditing: false,
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, isVideo: asset.type === 'video' };
}
