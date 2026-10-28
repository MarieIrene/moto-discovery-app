import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps } from 'react';
import { colors, ColorToken } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Icon({ name, size = 20, color = 'text' }: { name: IconName; size?: number; color?: ColorToken }) {
  return <Ionicons name={name} size={size} color={colors[color]} accessibilityElementsHidden importantForAccessibility="no" />;
}
