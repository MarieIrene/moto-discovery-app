import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

/** Marks behaviour that only happens on this device, so nobody mistakes the demo for a live platform. */
export function SimulatedNote({ children }: { children: string }) {
  return (
    <View style={styles.note} accessibilityRole="text" accessibilityLabel={`Demo note. ${children}`}>
      <Icon name="flask" size={16} color="info" />
      <AppText variant="caption" color="info" style={styles.text}>{children}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start',
    backgroundColor: colors.infoTint, borderRadius: radius.md, padding: spacing.md,
  },
  text: { flex: 1 },
});
