import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MIN_TOUCH, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, back, right }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      {back ? (
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={styles.back}
          hitSlop={8}
        >
          <Icon name="arrow-back" size={24} />
        </Pressable>
      ) : null}
      <View style={styles.text}>
        <AppText variant="title">{title}</AppText>
        {subtitle ? <AppText color="textMuted">{subtitle}</AppText> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  back: { width: MIN_TOUCH, height: MIN_TOUCH, marginLeft: -spacing.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
