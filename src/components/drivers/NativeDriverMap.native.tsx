import type { ComponentType } from 'react';
import { FallbackMap } from './FallbackMap';
import { nativeMapsAvailable } from './mapStyle';
import { DriverMapProps } from './mapTypes';

// Loaded lazily so Expo Go never touches MapLibre's native module.
export const NativeDriverMap: ComponentType<DriverMapProps> = nativeMapsAvailable
  ? require('./MapLibreDriverMap').MapLibreDriverMap
  : FallbackMap;
