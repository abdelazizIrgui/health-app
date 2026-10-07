import * as ImagePicker from 'expo-image-picker';
import { File, Paths } from 'expo-file-system';

/**
 * Lets her pick a photo from the gallery (square crop) and copies it into the app's own
 * folder, so it is still there after the phone cleans its cache.
 * Returns the new file uri, or null if she cancelled.
 */
export async function pickProfilePhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });
  if (result.canceled || !result.assets[0]) return null;

  const target = new File(Paths.document, `profile-${Date.now()}.jpg`); // new name = no stale image cache
  new File(result.assets[0].uri).copy(target);
  return target.uri;
}

/** Deletes a photo saved by pickProfilePhoto. Never throws. */
export function deletePhotoFile(uri?: string) {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch (e) {
    console.warn('Could not delete the photo', e);
  }
}