import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export function SegmentedControl<T extends string>({ segments, value, onChange, accessibilityLabel }: {
  segments: Segment<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.track} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {segments.map((s) => {
        const selected = s.value === value;
        return (
          <Pressable
            key={s.value}
            onPress={() => onChange(s.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={s.label}
            style={[styles.segment, selected && styles.selected]}
          >
            {s.icon ? <Icon name={s.icon} size={16} color={selected ? 'onPrimary' : 'textMuted'} /> : null}
            <AppText variant="label" color={selected ? 'onPrimary' : 'textMuted'}>{s.label}</AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: 4, borderWidth: 1, borderColor: colors.border },
  segment: { flex: 1, minHeight: 40, flexDirection: 'row', gap: spacing.xs, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  selected: { backgroundColor: colors.primary },
});
