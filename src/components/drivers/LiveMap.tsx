import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui';
import { useSettings } from '@/state/SettingsProvider';
import { colors, radius, spacing } from '@/theme';
import { MapErrorBoundary } from './DriverMap';
import { LiveMapFallback } from './LiveMapFallback';
import { LiveMapProps } from './liveMapTypes';
import { NativeLiveMap } from './NativeLiveMap';

export interface LiveMapCardProps extends LiveMapProps {
  /** Shows the pulsing LIVE badge; otherwise the badge reads "Last known". */
  live: boolean;
  /** One line under the map, e.g. when the position was last updated. */
  status: string;
}

function LiveBadge({ live }: { live: boolean }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!live) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [live, pulse]);
  return (
    <View style={[styles.badge, live ? styles.badgeLive : styles.badgeIdle]} accessibilityLabel={live ? 'Live location' : 'Last known location'} accessible>
      <Animated.View style={[styles.badgeDot, { opacity: live ? pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] }) : 1 }, !live && styles.badgeDotIdle]} />
      <AppText variant="small" color={live ? 'onPrimary' : 'text'} style={styles.badgeText}>{live ? 'LIVE' : 'LAST KNOWN'}</AppText>
    </View>
  );
}

/** Map that follows one driver's position, with a live indicator and a status line. */
export function LiveMap({ live, status, ...map }: LiveMapCardProps) {
  const { settings } = useSettings();
  const fallback = <LiveMapFallback {...map} />;
  return (
    <View style={styles.card}>
      <View>
        {Platform.OS === 'web' || settings.preferFallbackMap ? fallback : (
          <MapErrorBoundary fallback={fallback}>
            <NativeLiveMap {...map} />
          </MapErrorBoundary>
        )}
        <View style={styles.overlay} pointerEvents="none">
          <LiveBadge live={live} />
        </View>
      </View>
      <View style={styles.footer}>
        <AppText variant="caption" color="textMuted">{status}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  overlay: { position: 'absolute', top: spacing.sm, left: spacing.sm },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
  badgeLive: { backgroundColor: colors.danger },
  badgeIdle: { backgroundColor: 'rgba(255,255,255,0.95)', borderWidth: 1, borderColor: colors.border },
  badgeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.background },
  badgeDotIdle: { backgroundColor: colors.textFaint },
  badgeText: { fontWeight: '800', letterSpacing: 0.6 },
  footer: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface },
});
