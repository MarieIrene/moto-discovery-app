import { useCallback, useEffect, useMemo, useState } from 'react';
import { DiscoveryFilters, DriverWithDistance, filterNearbyDrivers } from '@/features/discovery/filterDrivers';
import { simulateRequest } from '@/services/simulatedNetwork';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useSettings } from '@/state/SettingsProvider';
import { GeoPoint } from '@/types';

type LoadState = { status: 'loading' } | { status: 'ready' } | { status: 'error'; message: string };

/**
 * Loads (simulated) nearby drivers. The first load and manual refreshes go through a fake network
 * delay so loading/error states are visible; after that the list re-derives instantly from shared
 * state, so admin or driver changes show up without a refresh.
 */
export function useNearbyDrivers(origin: GeoPoint | null, filters: DiscoveryFilters, excludeDriverId?: string) {
  const { data } = useAppData();
  const { settings } = useSettings();
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });

  const refresh = useCallback(async () => {
    setLoad({ status: 'loading' });
    try {
      await simulateRequest(() => true, { fail: settings.simulateLoadErrors });
      setLoad({ status: 'ready' });
    } catch (error) {
      setLoad({ status: 'error', message: error instanceof Error ? error.message : 'Could not load drivers.' });
    }
  }, [settings.simulateLoadErrors]);

  useEffect(() => {
    if (origin) void refresh();
  }, [origin?.latitude, origin?.longitude, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const drivers: DriverWithDistance[] = useMemo(
    () => (origin ? filterNearbyDrivers(data.drivers, origin, filters, excludeDriverId) : []),
    [data.drivers, origin, filters, excludeDriverId],
  );

  return { load, drivers, refresh };
}
