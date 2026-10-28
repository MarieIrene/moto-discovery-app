import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export type PhotoResult = { status: 'ok'; uri: string } | { status: 'cancelled' } | { status: 'denied' };

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, allowsEditing: true };

/** ID card or permit photo, from the camera or the photo library. */
export async function pickDocumentPhoto(source: 'camera' | 'library'): Promise<PhotoResult> {
  try {
    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync(PICKER_OPTIONS)
      : await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    const asset = result.canceled ? undefined : result.assets[0];
    return asset ? { status: 'ok', uri: asset.uri } : { status: 'cancelled' };
  } catch {
    return { status: 'cancelled' };
  }
}

/**
 * Picker and camera output lives in a cache folder the OS may clear, so copy it into the app's
 * documents folder. On web, or if the copy fails, the original URI is kept.
 */
export function persistPhoto(uri: string, name: 'id-card' | 'permit' | 'selfie'): string {
  if (Platform.OS === 'web') return uri;
  try {
    const dir = new Directory(Paths.document, 'verification');
    if (!dir.exists) dir.create({ intermediates: true });
    const ext = uri.split('?')[0]!.split('.').pop()?.toLowerCase() || 'jpg';
    const target = new File(dir, `${name}-${Date.now()}.${ext}`);
    new File(uri).copy(target);
    return target.uri;
  } catch (error) {
    console.warn('[verificationMedia] Could not keep a copy of the photo; using the original.', error);
    return uri;
  }
}
