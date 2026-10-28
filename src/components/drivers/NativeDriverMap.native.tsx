import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';
import { Icon } from '@/components/ui';
import { formatDistance, regionForRadius } from '@/lib/geo';
import { colors, radius } from '@/theme';
import { DriverMapProps } from './mapTypes';

export function NativeDriverMap({ origin, radiusKm, drivers, selectedId, onSelect, height }: DriverMapProps) {
  return (
    <View style={[styles.wrap, { height }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={regionForRadius(origin, radiusKm)}
        showsUserLocation
        showsMyLocationButton={false}
        toolbarEnabled={false}
        accessibilityLabel="Map of nearby drivers"
      >
        <Circle center={origin} radius={radiusKm * 1000} strokeColor={colors.primary} strokeWidth={1.5} fillColor="rgba(11,79,51,0.06)" />
        {drivers.map((d) => (
          <Marker
            key={d.id}
            coordinate={d.location}
            onPress={() => onSelect(d.id)}
            title={d.fullName}
            description={`${d.isAvailable ? 'Available' : 'Offline'} · ${formatDistance(d.distanceKm)}`}
            accessibilityLabel={`${d.fullName}, ${formatDistance(d.distanceKm)} away`}
            tracksViewChanges={false}
          >
            <View style={[styles.pin, d.isAvailable ? styles.available : styles.offline, d.id === selectedId && styles.selected]}>
              <Icon name="bicycle" size={16} color={d.isAvailable ? 'onPrimary' : 'textMuted'} />
            </View>
          </Marker>
        ))}
      </MapView>
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
