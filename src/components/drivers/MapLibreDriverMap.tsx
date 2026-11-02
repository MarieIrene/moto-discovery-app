import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, GeoJSONSource, Layer, Map, Marker, NativeUserLocation } from '@maplibre/maplibre-react-native';
import { Icon } from '@/components/ui';
import { boundsForRadius, circleRing, formatDistance } from '@/lib/geo';
import { colors, radius } from '@/theme';
import { MAP_STYLE_URL } from './mapStyle';
import { DriverMapProps } from './mapTypes';

export function MapLibreDriverMap({ origin, radiusKm, drivers, selectedId, onSelect, height }: DriverMapProps) {
  const area = useMemo<GeoJSON.Feature>(
    () => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [circleRing(origin, radiusKm)] } }),
    [origin, radiusKm],
  );

  return (
    <View style={[styles.wrap, { height }]} accessibilityLabel="Map of nearby drivers">
      <Map style={StyleSheet.absoluteFill} mapStyle={MAP_STYLE_URL} logo={false} compass={false} touchRotate={false} touchPitch={false}>
        <Camera bounds={boundsForRadius(origin, radiusKm)} duration={400} easing="ease" />
        <GeoJSONSource id="search-area" data={area}>
          <Layer type="fill" id="search-area-fill" paint={{ 'fill-color': 'rgba(11,79,51,0.06)' }} />
          <Layer type="line" id="search-area-line" paint={{ 'line-color': colors.primary, 'line-width': 1.5 }} />
        </GeoJSONSource>
        <NativeUserLocation />
        {drivers.map((d) => (
          <Marker key={d.id} id={d.id} lngLat={[d.location.longitude, d.location.latitude]} anchor="center" onPress={() => onSelect(d.id)}>
            <View
              style={[styles.pin, d.isAvailable ? styles.available : styles.offline, d.id === selectedId && styles.selected]}
              accessibilityLabel={`${d.fullName}, ${d.isAvailable ? 'available' : 'offline'}, ${formatDistance(d.distanceKm)} away`}
            >
              <Icon name="bicycle" size={16} color={d.isAvailable ? 'onPrimary' : 'textMuted'} />
            </View>
          </Marker>
        ))}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', borderRadius: radius.lg, backgroundColor: colors.mapLand },
  pin: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background },
  available: { backgroundColor: colors.primary },
  offline: { backgroundColor: colors.neutralTint },
  selected: { borderColor: colors.text, width: 38, height: 38, borderRadius: 19 },
});
