import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
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
}

/** Single-select horizontal chips for list filters. */
export function ChipGroup<T extends string | number>({ options, value, onChange, accessibilityLabel }: ChipGroupProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
    >
      {options.map((opt) => {
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
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingVertical: spacing.xs },
  chip: { minHeight: 40, paddingHorizontal: spacing.md, borderRadius: radius.pill, justifyContent: 'center', borderWidth: 1 },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  unselected: { backgroundColor: colors.background, borderColor: colors.borderStrong },
});
