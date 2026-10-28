import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, MIN_TOUCH, radius, spacing, typography } from '@/theme';
import { Icon } from './Icon';

export function SearchField({ value, onChangeText, placeholder = 'Search' }: { value: string; onChangeText: (v: string) => void; placeholder?: string }) {
  return (
    <View style={styles.field}>
      <Icon name="search" size={18} color="textMuted" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={12}>
          <Icon name="close-circle" size={18} color="textFaint" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.sm },
});
