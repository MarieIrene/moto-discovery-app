import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

export interface ChipOption<T extends string | number> {
  value: T;
  label: string;
}

export interface ChipGroupProps<T extends string | number> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
  /** Wrap onto several lines instead of scrolling sideways, so every option is visible. */
  wrap?: boolean;
}

/** Single-select chips for list filters: one scrolling row, or wrapped lines with `wrap`. */
export function ChipGroup<T extends string | number>({ options, value, onChange, accessibilityLabel, wrap }: ChipGroupProps<T>) {
  const chips = options.map((opt) => {
    const selected = opt.value === value;
    return (
      <Pressable
        key={String(opt.value)}
        onPress={() => onChange(opt.value)}
        accessibilityRole="radio"
        accessibilityState={{ selected, checked: selected }}
        accessibilityLabel={opt.label}
        style={[styles.chip, selected ? styles.selected : styles.unselected]}
      >
        <AppText variant="label" color={selected ? 'onPrimary' : 'text'}>{opt.label}</AppText>
      </Pressable>
    );
  });
  if (wrap) {
    return <View style={[styles.row, styles.wrap]} accessibilityLabel={accessibilityLabel} accessibilityRole="radiogroup">{chips}</View>;
  }
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
    >
      {chips}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { minHeight: 40, paddingHorizontal: spacing.md, borderRadius: radius.pill, justifyContent: 'center', borderWidth: 1 },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  unselected: { backgroundColor: colors.background, borderColor: colors.borderStrong },
});
