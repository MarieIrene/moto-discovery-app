import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/ui';
import { colors, spacing } from '@/theme';
import { AdminBanner } from './AdminBanner';

export function AdminScreen({ title, subtitle, back, right, children, scroll = true, footer }: {
  title: string; subtitle?: string; back?: boolean; right?: React.ReactNode; children: React.ReactNode; scroll?: boolean; footer?: React.ReactNode;
}) {
  const header = <ScreenHeader title={title} subtitle={subtitle} back={back} right={right} />;
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.root}>
      <AdminBanner />
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex]}>
          {header}
          {children}
        </View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.lg, width: '100%', maxWidth: 760, alignSelf: 'center' },
  footer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border,
    width: '100%', maxWidth: 760, alignSelf: 'center',
  },
});
