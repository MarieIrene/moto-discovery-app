import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';

export function Section({ title, action, children, style }: { title?: string; action?: React.ReactNode; children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.section, style]}>
      {title ? (
        <View style={styles.header}>
          <AppText variant="heading" style={styles.title}>{title}</AppText>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm, marginBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.border },
});
