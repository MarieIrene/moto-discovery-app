import { Linking, Platform } from 'react-native';

export type CallResult = { ok: true } | { ok: false; reason: 'unsupported' | 'failed' };

/**
 * Opens the device dialler with the number filled in. The user still confirms the call.
 * Simulators and many tablets have no dialler; we report that instead of failing silently.
 */
export async function openDialer(phone: string): Promise<CallResult> {
  const url = `tel:${phone.replace(/\s/g, '')}`;
  try {
    if (Platform.OS !== 'web') {
      const supported = await Linking.canOpenURL(url);
      if (!supported) return { ok: false, reason: 'unsupported' };
    }
    await Linking.openURL(url);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
