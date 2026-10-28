import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, ColorToken, MIN_TOUCH, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
  accessibilityHint?: string;
  style?: ViewStyle;
  testID?: string;
}

const VARIANTS: Record<ButtonVariant, { bg: string; pressed: string; fg: ColorToken; border?: string }> = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: 'onPrimary' },
  secondary: { bg: colors.background, pressed: colors.primaryTint, fg: 'primary', border: colors.primary },
  ghost: { bg: 'transparent', pressed: colors.primaryTint, fg: 'primary' },
  danger: { bg: colors.danger, pressed: '#8F1C13', fg: 'onPrimary' },
  inverse: { bg: colors.background, pressed: colors.primaryTint, fg: 'primary' },
};

export function Button({
  label, onPress, variant = 'primary', icon, loading, disabled, fullWidth, size = 'md', accessibilityHint, style, testID,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      style={({ pressed }) => [
        styles.base,
        size === 'lg' && styles.lg,
        { backgroundColor: pressed ? v.pressed : v.bg, borderColor: v.border ?? 'transparent' },
        fullWidth && styles.full,
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[v.fg]} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={18} color={v.fg} /> : null}
          <AppText variant="label" color={v.fg} style={size === 'lg' ? styles.lgText : undefined}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: { minHeight: 54, paddingHorizontal: spacing.xl },
  lgText: { fontSize: 16 },
  full: { alignSelf: 'stretch' },
  inactive: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
