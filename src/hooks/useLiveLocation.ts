import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { KIGALI_DEMO_LOCATION } from '@/data/mock';
import { watchLocation } from '@/services/location';
import { useSettings } from '@/state/SettingsProvider';
import { GeoPoint } from '@/types';

export type LiveSource = 'gps' | 'demo' | 'off';

export interface LiveLocation {
  point: GeoPoint | null;
  accuracyM: number | null;
  /** Most recent positions, oldest first, for drawing the trail. */
  trail: GeoPoint[];
  updatedAt: string | null;
  source: LiveSource;
}

const TRAIL_LENGTH = 30;
const DEMO_TICK_MS = 2500;

/** A loop through central Kigali so the live map visibly moves when the demo location is on. */
function demoPoint(step: number): GeoPoint {
  const t = step / 24;
  return {
    latitude: KIGALI_DEMO_LOCATION.latitude + 0.004 * Math.sin(t * Math.PI * 2),
    longitude: KIGALI_DEMO_LOCATION.longitude + 0.006 * Math.sin(t * Math.PI * 4) / 2 + 0.003 * Math.cos(t * Math.PI * 2),
  };
}

/**
 * Follows the device's position while the screen is focused. Uses real GPS when location permission
 * is granted, or a simulated ride when the Kigali demo location is selected.
 */
export function useLiveLocation(onUpdate?: (point: GeoPoint) => void): LiveLocation {
  const { settings } = useSettings();
  const [state, setState] = useState<LiveLocation>({ point: null, accuracyM: null, trail: [], updatedAt: null, source: settings.useDemoLocation ? 'demo' : 'gps' });
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const push = useCallback((point: GeoPoint, accuracyM: number | null, source: LiveSource) => {
    setState((prev) => ({
      point,
      accuracyM,
      trail: [...prev.trail, point].slice(-TRAIL_LENGTH),
      updatedAt: new Date().toISOString(),
      source,
    }));
    onUpdateRef.current?.(point);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let stop: (() => void) | null = null;
      let cancelled = false;
      setState((prev) => ({ ...prev, trail: [], source: settings.useDemoLocation ? 'demo' : 'gps' }));

      if (settings.useDemoLocation) {
        let step = 0;
        push(demoPoint(step), 25, 'demo');
        const timer = setInterval(() => push(demoPoint(++step), 25, 'demo'), DEMO_TICK_MS);
        stop = () => clearInterval(timer);
      } else {
        void watchLocation((point, accuracy) => push(point, accuracy, 'gps')).then((unsubscribe) => {
          if (cancelled) unsubscribe?.();
          else if (unsubscribe) stop = unsubscribe;
          else setState((prev) => ({ ...prev, source: 'off' }));
        });
      }
      return () => {
        cancelled = true;
        stop?.();
      };
    }, [settings.useDemoLocation, push]),
  );

  return state;
}
