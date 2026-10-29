import { useCallback, useEffect, useState } from 'react';
import { Linking } from 'react-native';
import { demoLocationFor } from '@/data/mock';
import { getCurrentLocation, getPermissionState, requestPermission } from '@/services/location';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useSession } from '@/state/SessionProvider';
import { useSettings } from '@/state/SettingsProvider';
import { GeoPoint } from '@/types';

export type UserLocationState =
  | { status: 'loading' }
  | { status: 'ready'; point: GeoPoint; isDemo: boolean }
  | { status: 'denied' }
  | { status: 'unavailable'; message: string };

/**
 * Resolves the point discovery is centred on: the device position, or the main town of the user's
 * district when they chose the demo location in settings (useful for evaluators outside Rwanda).
 */
export function useUserLocation() {
  const { settings, updateSettings } = useSettings();
  const { profile, activeRole } = useSession();
  const { actions } = useAppData();
  const demoPoint = demoLocationFor(profile?.district);
  const [state, setState] = useState<UserLocationState>({ status: 'loading' });

  const refresh = useCallback(async () => {
    if (settings.useDemoLocation) {
      setState({ status: 'ready', point: demoPoint, isDemo: true });
      return;
    }
    setState({ status: 'loading' });
    const result = await getCurrentLocation();
    if (result.status === 'ok') setState({ status: 'ready', point: result.point, isDemo: false });
    else if (result.status === 'denied') setState({ status: 'denied' });
    else setState({ status: 'unavailable', message: result.message });
  }, [settings.useDemoLocation, demoPoint]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // A passenger's position becomes their pickup point, visible to drivers they call or message.
  const ready = state.status === 'ready' ? state.point : null;
  useEffect(() => {
    if (ready && profile && activeRole === 'passenger') actions.setPassengerLocation(profile.id, ready);
  }, [ready?.latitude, ready?.longitude, profile?.id, activeRole, actions]); // eslint-disable-line react-hooks/exhaustive-deps

  const requestAccess = useCallback(async () => {
    const current = await getPermissionState();
    // Once denied, iOS and Android won't show the prompt again; the user has to use system settings.
    if (current === 'denied') {
      await Linking.openSettings().catch(() => undefined);
      return;
    }
    await requestPermission();
    await refresh();
  }, [refresh]);

  const useDemoLocation = useCallback(() => updateSettings({ useDemoLocation: true }), [updateSettings]);
  const useDeviceLocation = useCallback(() => updateSettings({ useDemoLocation: false }), [updateSettings]);

  return { state, refresh, requestAccess, useDemoLocation, useDeviceLocation };
}
