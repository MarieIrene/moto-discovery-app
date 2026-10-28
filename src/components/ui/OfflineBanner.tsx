import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useIsOffline } from '@/hooks/useNetworkStatus';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export function OfflineBanner() {
  const offline = useIsOffline();
  if (!offline) return null;
  return (
    <View style={styles.banner} accessibilityLiveRegion="polite" accessibilityRole="alert">
      <Icon name="cloud-offline" size={16} color="warning" />
      <AppText variant="caption" color="warning" style={styles.text}>
        You’re offline. Saved drivers still show, and phone calls work over your mobile network.
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.warningTint, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  text: { flex: 1 },
});
