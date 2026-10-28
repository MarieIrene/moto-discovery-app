import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Icon } from '@/components/ui';
import { colors, spacing } from '@/theme';

/** Persistent reminder at the top of admin screens that every action is local-only. */
export function AdminBanner() {
  return (
    <View style={styles.banner} accessibilityRole="text" accessibilityLabel="Simulated admin mode. Changes stay on this device.">
      <Icon name="flask" size={14} color="onPrimary" />
      <AppText variant="small" color="onPrimary">Simulated admin mode · changes stay on this device</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.primaryPressed, paddingVertical: 6 },
});
