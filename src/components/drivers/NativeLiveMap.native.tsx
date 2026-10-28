import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, Polyline } from 'react-native-maps';
import { Icon } from '@/components/ui';
import { distanceKm, regionForRadius } from '@/lib/geo';
import { colors } from '@/theme';
import { LiveMapProps } from './liveMapTypes';

/** Zoom that fits the driver and, when given, the viewer — never closer than ~400 m. */
function regionFor(driver: LiveMapProps['driver'], viewer?: LiveMapProps['viewer']) {
  if (!viewer) return regionForRadius(driver, 0.4);
  const mid = { latitude: (driver.latitude + viewer.latitude) / 2, longitude: (driver.longitude + viewer.longitude) / 2 };
  return regionForRadius(mid, Math.max(0.4, (distanceKm(driver, viewer) / 2) * 1.3));
}

export function NativeLiveMap({ driver, viewer, trail, accuracyM, driverLabel, height }: LiveMapProps) {
  const map = useRef<MapView>(null);

  // Follow the driver as they move.
  useEffect(() => {
    map.current?.animateToRegion(regionFor(driver, viewer), 600);
  }, [driver.latitude, driver.longitude, viewer?.latitude, viewer?.longitude]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={[styles.wrap, { height }]}>
      <MapView
        ref={map}
        style={StyleSheet.absoluteFill}
        initialRegion={regionFor(driver, viewer)}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        accessibilityLabel={`Live map showing ${driverLabel}`}
      >
        {trail && trail.length > 1 ? <Polyline coordinates={trail} strokeColor={colors.primary} strokeWidth={4} lineDashPattern={[1]} /> : null}
        {accuracyM ? <Circle center={driver} radius={Math.min(accuracyM, 150)} strokeColor="rgba(11,79,51,0.35)" fillColor="rgba(11,79,51,0.12)" /> : null}
        {viewer ? (
          <Marker coordinate={viewer} title="You" anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.viewer} />
          </Marker>
        ) : null}
        <Marker coordinate={driver} title={driverLabel} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={styles.driver}>
            <Icon name="bicycle" size={20} color="onPrimary" />
          </View>
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: colors.mapLand },
  driver: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.background,
  },
  viewer: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.info, borderWidth: 3, borderColor: colors.background },
});
