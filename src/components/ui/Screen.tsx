import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme';

export interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  background?: string;
  contentStyle?: ViewStyle;
  footer?: React.ReactNode;
}

/** Safe-area aware page wrapper. Content is width-capped so tablets and wide screens stay readable. */
export function Screen({ children, scroll, padded = true, edges = ['top', 'left', 'right'], background = colors.background, contentStyle, footer }: ScreenProps) {
  const inner = <View style={[styles.inner, padded && styles.padded, contentStyle]}>{children}</View>;
  return (
    <SafeAreaView edges={edges} style={[styles.root, { backgroundColor: background }]}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {inner}
          </ScrollView>
        ) : (
          inner
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  inner: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center' },
  padded: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  footer: {
    width: '100%', maxWidth: 640, alignSelf: 'center',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background, gap: spacing.sm,
  },
});
