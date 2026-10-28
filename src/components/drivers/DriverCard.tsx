import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText, AvailabilityBadge, Avatar, Icon, VerificationBadge } from '@/components/ui';
import { DriverWithDistance } from '@/features/discovery/filterDrivers';
import { estimateMinutes, formatDistance } from '@/lib/geo';
import { colors, MIN_TOUCH, radius, spacing } from '@/theme';

export interface DriverCardProps {
  driver: DriverWithDistance;
  onPress: () => void;
  onCall?: () => void;
  selected?: boolean;
}

export function DriverCard({ driver, onPress, onCall, selected }: DriverCardProps) {
  const { motorcycle: m } = driver;
  return (
    <View style={[styles.card, selected && styles.selected]} testID={`driver-card-${driver.id}`}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${driver.fullName}. ${driver.isAvailable ? 'Available' : 'Offline'}. ${formatDistance(driver.distanceKm)} away. ${m.make} ${m.model}.`}
        accessibilityHint="Opens the driver profile"
        style={({ pressed }) => [styles.main, pressed && styles.pressed]}
      >
        <Avatar name={driver.fullName} uri={driver.photoUri} size={52} available={driver.isAvailable} />
        <View style={styles.body}>
          <AppText variant="bodyStrong" numberOfLines={1}>{driver.fullName}</AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {m.make} {m.model} · {m.plateNumber}
          </AppText>
          <View style={styles.badges}>
            <AvailabilityBadge available={driver.isAvailable} />
            <VerificationBadge status={driver.verificationStatus} />
          </View>
        </View>
        <View style={styles.side}>
          <AppText variant="label">{formatDistance(driver.distanceKm)}</AppText>
          <AppText variant="small" color="textMuted">~{estimateMinutes(driver.distanceKm)} min</AppText>
        </View>
      </Pressable>
      {onCall && driver.isAvailable ? (
        <Pressable
          onPress={onCall}
          accessibilityRole="button"
          accessibilityLabel={`Call ${driver.fullName}`}
          style={({ pressed }) => [styles.call, pressed && { backgroundColor: colors.primaryPressed }]}
          hitSlop={6}
        >
          <Icon name="call" size={18} color="onPrimary" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingRight: spacing.md,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, overflow: 'hidden',
  },
  main: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  selected: { borderColor: colors.primary, borderWidth: 2 },
  pressed: { backgroundColor: colors.surface },
  body: { flex: 1, gap: 3 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 2 },
  side: { alignItems: 'flex-end', gap: 2 },
  call: {
    width: MIN_TOUCH - 4, height: MIN_TOUCH - 4, borderRadius: (MIN_TOUCH - 4) / 2,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
});
