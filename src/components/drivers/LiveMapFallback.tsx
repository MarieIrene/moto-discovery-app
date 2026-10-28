import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import { Icon } from '@/components/ui';
import { distanceKm, projectToCanvas } from '@/lib/geo';
import { colors } from '@/theme';
import { LiveMapProps } from './liveMapTypes';

/**
 * Schematic live map used on web, when the user prefers it, or if the native map fails. The driver
 * stays centred with a pulse; the viewer and the recent trail are drawn at their true offsets.
 */
export function LiveMapFallback({ driver, viewer, trail, driverLabel, height }: LiveMapProps) {
  const [width, setWidth] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1800, easing: Easing.out(Easing.ease), useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const radiusKm = Math.max(0.5, viewer ? distanceKm(driver, viewer) * 1.4 : 0.5);
  const toXY = (p: { latitude: number; longitude: number }) => {
    const { x, y } = projectToCanvas(driver, p, radiusKm);
    return { left: x * width, top: y * height };
  };

  return (
    <View
      style={[styles.canvas, { height }]}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      accessible
      accessibilityLabel={`Live map showing ${driverLabel}`}
      testID="live-map-fallback"
    >
      <View style={[styles.road, { top: '46%', left: 0, right: 0, height: 10 }]} />
      <View style={[styles.road, { top: 0, bottom: 0, left: '30%', width: 8 }]} />
      <View style={[styles.road, { top: '20%', left: '55%', right: 0, height: 6 }]} />
      <View style={[styles.water, { bottom: -30, right: -30, width: 130, height: 90 }]} />

      {width > 0 ? (
        <>
          {(trail ?? []).slice(0, -1).map((p, i, all) => {
            const at = toXY(p);
            return <View key={i} style={[styles.trail, { left: at.left - 3, top: at.top - 3, opacity: 0.25 + (0.6 * i) / Math.max(1, all.length) }]} />;
          })}
          {viewer ? <View style={[styles.viewer, { left: toXY(viewer).left - 9, top: toXY(viewer).top - 9 }]} /> : null}
          <Animated.View
            style={[
              styles.pulse,
              {
                left: width / 2 - 40,
                top: height / 2 - 40,
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.4] }) }],
              },
            ]}
          />
          <View style={[styles.driver, { left: width / 2 - 21, top: height / 2 - 21 }]}>
            <Icon name="bicycle" size={20} color="onPrimary" />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { width: '100%', backgroundColor: colors.mapLand, overflow: 'hidden' },
  road: { position: 'absolute', backgroundColor: colors.mapRoad },
  water: { position: 'absolute', backgroundColor: colors.mapWater, borderRadius: 60 },
  trail: { position: 'absolute', width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  pulse: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary },
  driver: {
    position: 'absolute', width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.background,
  },
  viewer: { position: 'absolute', width: 18, height: 18, borderRadius: 9, backgroundColor: colors.info, borderWidth: 3, borderColor: colors.background },
});
