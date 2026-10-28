import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { colors, ColorToken, typography, TypographyVariant } from '@/theme';

export interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  align?: TextStyle['textAlign'];
}

export function AppText({ variant = 'body', color = 'text', align, style, ...rest }: AppTextProps) {
  const isHeading = variant === 'display' || variant === 'title' || variant === 'heading';
  return (
    <Text
      accessibilityRole={isHeading ? 'header' : undefined}
      maxFontSizeMultiplier={1.6}
      style={[typography[variant], { color: colors[color], textAlign: align }, style]}
      {...rest}
    />
  );
}
