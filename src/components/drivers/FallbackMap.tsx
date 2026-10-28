import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/ui';
import { formatDistance, projectToCanvas } from '@/lib/geo';
import { colors, radius, spacing } from '@/theme';
import { DriverMapProps } from './mapTypes';

/**
 * Map stand-in used on web, when the user prefers it, or if the native map fails.
 * Positions are true relative bearings/distances from the user, drawn on a schematic canvas.
 */
export function FallbackMap({ origin, radiusKm, drivers, selectedId, onSelect, height }: DriverMapProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const size = Math.min(width, height);

  return (
    <View style={[styles.canvas, { height }]} onLayout={onLayout} testID="fallback-map">
      {/* Schematic roads */}
      <View style={[styles.road, { top: '38%', left: 0, right: 0, height: 10 }]} />
      <View style={[styles.road, { top: 0, bottom: 0, left: '62%', width: 8 }]} />
      <View style={[styles.road, { top: '72%', left: '10%', right: '30%', height: 6 }]} />
      <View style={[styles.water, { bottom: -30, left: -30, width: 120, height: 90 }]} />

      {size > 0 ? (
        <>
          {[1, 0.5].map((f) => (
            <View
              key={f}
              style={[
                styles.ring,
                { width: size * f * 0.94, height: size * f * 0.94, borderRadius: (size * f * 0.94) / 2, left: (width - size * f * 0.94) / 2, top: (height - size * f * 0.94) / 2 },
              ]}
            />
          ))}
          <View style={[styles.you, { left: width / 2 - 9, top: height / 2 - 9 }]} accessibilityLabel="Your location" accessible />
          {drivers.map((d) => {
            const p = projectToCanvas(origin, d.location, radiusKm);
            const x = (width - size) / 2 + p.x * size;
            const y = (height - size) / 2 + p.y * size;
            const selected = d.id === selectedId;
            return (
              <Pressable
                key={d.id}
                onPress={() => onSelect(d.id)}
                accessibilityRole="button"
                accessibilityLabel={`${d.fullName}, ${d.isAvailable ? 'available' : 'offline'}, ${formatDistance(d.distanceKm)} away`}
                hitSlop={10}
                style={[
                  styles.pin,
                  { left: x - 16, top: y - 16 },
                  d.isAvailable ? styles.pinAvailable : styles.pinOffline,
                  selected && styles.pinSelected,
                ]}
              >
                <Icon name="bicycle" size={16} color={d.isAvailable ? 'onPrimary' : 'textMuted'} />
              </Pressable>
            );
          })}
        </>
      ) : null}

      <View style={styles.legend}>
        <AppText variant="small" color="textMuted">Schematic map · outer ring {formatDistance(radiusKm)}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { width: '100%', backgroundColor: colors.mapLand, overflow: 'hidden', borderRadius: radius.lg },
  road: { position: 'absolute', backgroundColor: colors.mapRoad },
  water: { position: 'absolute', backgroundColor: colors.mapWater, borderRadius: 60 },
  ring: { position: 'absolute', borderWidth: 1.5, borderColor: colors.primaryTintStrong, borderStyle: 'dashed' },
  you: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: colors.info, borderWidth: 3, borderColor: colors.background },
  pin: { position: 'absolute', width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.background },
  pinAvailable: { backgroundColor: colors.primary },
  pinOffline: { backgroundColor: colors.neutralTint },
  pinSelected: { transform: [{ scale: 1.3 }], borderColor: colors.text },
  legend: { position: 'absolute', left: spacing.sm, bottom: spacing.sm, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
});
