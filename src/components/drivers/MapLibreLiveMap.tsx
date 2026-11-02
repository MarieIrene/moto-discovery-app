import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, GeoJSONSource, Layer, Map, Marker } from '@maplibre/maplibre-react-native';
import { Icon } from '@/components/ui';
import { boundsForRadius, circleRing, distanceKm } from '@/lib/geo';
import { colors } from '@/theme';
import { LiveMapProps } from './liveMapTypes';
import { MAP_STYLE_URL } from './mapStyle';

/** Box that fits the driver and, when given, the viewer — never closer than ~400 m. */
function boundsFor(driver: LiveMapProps['driver'], viewer?: LiveMapProps['viewer']) {
  if (!viewer) return boundsForRadius(driver, 0.4);
  const mid = { latitude: (driver.latitude + viewer.latitude) / 2, longitude: (driver.longitude + viewer.longitude) / 2 };
  return boundsForRadius(mid, Math.max(0.4, (distanceKm(driver, viewer) / 2) * 1.3));
}

export function MapLibreLiveMap({ driver, viewer, trail, accuracyM, driverLabel, height, subject = 'driver' }: LiveMapProps) {
  const trailLine = useMemo<GeoJSON.Feature | null>(
    () => (trail && trail.length > 1
      ? { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: trail.map((p) => [p.longitude, p.latitude]) } }
      : null),
    [trail],
  );
  const accuracyArea = useMemo<GeoJSON.Feature | null>(
    () => (accuracyM
      ? { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [circleRing(driver, Math.min(accuracyM, 150) / 1000)] } }
      : null),
    [driver, accuracyM],
  );

  return (
    <View style={[styles.wrap, { height }]} accessibilityLabel={`Live map showing ${driverLabel}`}>
      <Map style={StyleSheet.absoluteFill} mapStyle={MAP_STYLE_URL} logo={false} compass={false} touchRotate={false} touchPitch={false}>
        {/* Follows the driver as they move. */}
        <Camera bounds={boundsFor(driver, viewer)} duration={600} easing="ease" />
        {trailLine ? (
          <GeoJSONSource id="trail" data={trailLine}>
            <Layer type="line" id="trail-line" paint={{ 'line-color': colors.primary, 'line-width': 4, 'line-dasharray': [1, 1] }} layout={{ 'line-cap': 'round' }} />
          </GeoJSONSource>
        ) : null}
        {accuracyArea ? (
          <GeoJSONSource id="accuracy" data={accuracyArea}>
            <Layer type="fill" id="accuracy-fill" paint={{ 'fill-color': 'rgba(11,79,51,0.12)' }} />
            <Layer type="line" id="accuracy-line" paint={{ 'line-color': 'rgba(11,79,51,0.35)', 'line-width': 1 }} />
          </GeoJSONSource>
        ) : null}
        {viewer ? (
          <Marker id="viewer" lngLat={[viewer.longitude, viewer.latitude]} anchor="center">
            {subject === 'passenger' ? (
              <View style={styles.viewerDriver} accessibilityLabel="You"><Icon name="bicycle" size={14} color="onPrimary" /></View>
            ) : <View style={styles.viewer} accessibilityLabel="You" />}
          </Marker>
        ) : null}
        <Marker id="subject" lngLat={[driver.longitude, driver.latitude]} anchor="center">
          <View style={styles.driver} accessibilityLabel={driverLabel}>
            <Icon name={subject === 'passenger' ? 'person' : 'bicycle'} size={20} color="onPrimary" />
          </View>
        </Marker>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: colors.mapLand },
  driver: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.background,
  },
  viewerDriver: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.info, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background },
  viewer: { width: 18, height: 18, borderRadius: 9, backgroundColor: colors.info, borderWidth: 3, borderColor: colors.background },
});
