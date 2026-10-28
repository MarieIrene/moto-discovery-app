import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, ColorToken, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

export function StatCard({ label, value, icon, tone = 'primary', onPress, testID }: {
  label: string; value: number | string; icon: IconName; tone?: ColorToken; onPress?: () => void; testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'summary'}
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.top}>
        <Icon name={icon} size={18} color={tone} />
        {onPress ? <Icon name="chevron-forward" size={14} color="textFaint" /> : null}
      </View>
      <AppText variant="display" color={tone}>{value}</AppText>
      <AppText variant="caption" color="textMuted">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1, flexBasis: '45%', minWidth: 140, padding: spacing.lg, gap: spacing.xs,
    borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background,
  },
  pressed: { backgroundColor: colors.primaryTint },
  top: { flexDirection: 'row', justifyContent: 'space-between' },
});
