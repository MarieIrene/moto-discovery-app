import React from 'react';
import { Pressable, StyleSheet, View, ViewProps } from 'react-native';
import { colors, radius, spacing } from '@/theme';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  accessibilityLabel?: string;
  tone?: 'default' | 'tint' | 'brand';
  padded?: boolean;
}

export function Card({ onPress, tone = 'default', padded = true, style, children, accessibilityLabel, ...rest }: CardProps) {
  const toneStyle = tone === 'tint' ? styles.tint : tone === 'brand' ? styles.brand : styles.default;
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [styles.base, toneStyle, padded && styles.padded, pressed && styles.pressed, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={[styles.base, toneStyle, padded && styles.padded, style]} accessibilityLabel={accessibilityLabel} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, borderWidth: 1 },
  padded: { padding: spacing.lg },
  default: { backgroundColor: colors.background, borderColor: colors.border },
  tint: { backgroundColor: colors.surface, borderColor: colors.border },
  brand: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { backgroundColor: colors.primaryTint },
});
