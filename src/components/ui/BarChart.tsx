import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export interface BarDatum { label: string; count: number }

/** Dependency-free bar chart. Values are also exposed as an accessibility summary. */
export function BarChart({ data, height = 120, summaryLabel }: { data: BarDatum[]; height?: number; summaryLabel: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const showEvery = data.length > 10 ? Math.ceil(data.length / 7) : 1;
  const summary = `${summaryLabel}. ${data.map((d) => `${d.label}: ${d.count}`).join(', ')}`;
  return (
    <View accessible accessibilityLabel={summary}>
      <View style={[styles.bars, { height }]}>
        {data.map((d, i) => (
          <View key={`${d.label}-${i}`} style={styles.col}>
            {d.count > 0 && data.length <= 10 ? <AppText variant="small" color="textMuted">{d.count}</AppText> : null}
            <View
              style={[
                styles.bar,
                { height: Math.max(3, (d.count / max) * (height - 20)), backgroundColor: d.count > 0 ? colors.primary : colors.border },
              ]}
            />
          </View>
        ))}
      </View>
      <View style={styles.labels}>
        {data.map((d, i) => (
          <AppText key={`${d.label}-l-${i}`} variant="small" color="textFaint" style={styles.label} numberOfLines={1}>
            {i % showEvery === 0 ? d.label : ''}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2 },
  bar: { width: '100%', maxWidth: 28, borderTopLeftRadius: radius.sm, borderTopRightRadius: radius.sm },
  labels: { flexDirection: 'row', gap: 3, marginTop: spacing.xs },
  label: { flex: 1, textAlign: 'center' },
});
