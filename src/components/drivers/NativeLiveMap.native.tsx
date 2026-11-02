import type { ComponentType } from 'react';
import { LiveMapFallback } from './LiveMapFallback';
import { LiveMapProps } from './liveMapTypes';
import { nativeMapsAvailable } from './mapStyle';

// Loaded lazily so Expo Go never touches MapLibre's native module.
export const NativeLiveMap: ComponentType<LiveMapProps> = nativeMapsAvailable
  ? require('./MapLibreLiveMap').MapLibreLiveMap
  : LiveMapFallback;
