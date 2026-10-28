import React, { Component, ReactNode } from 'react';
import { Platform } from 'react-native';
import { useSettings } from '@/state/SettingsProvider';
import { FallbackMap } from './FallbackMap';
import { DriverMapProps } from './mapTypes';
import { NativeDriverMap } from './NativeDriverMap';

export class MapErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[DriverMap] Native map failed; using fallback map.', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function DriverMap(props: DriverMapProps) {
  const { settings } = useSettings();
  const fallback = <FallbackMap {...props} />;
  if (Platform.OS === 'web' || settings.preferFallbackMap) return fallback;
  return (
    <MapErrorBoundary fallback={fallback}>
      <NativeDriverMap {...props} />
    </MapErrorBoundary>
  );
}
