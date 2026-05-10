import * as ImagePicker from 'expo-image-picker';

export type PickedImage = { uri: string };

/** Open the OS image picker. Returns the picked image's local URI, or null if cancelled. */
export async function pickImage(): Promise<PickedImage | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: false,
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;
  return { uri: result.assets[0].uri };
}
