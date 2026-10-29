import React from 'react';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors, MIN_TOUCH, radius, spacing, typography } from '@/theme';
import { Icon } from './Icon';

export interface SearchFieldProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  /** Called by the keyboard's search key and the search button. Results also update as you type. */
  onSubmit?: () => void;
  testID?: string;
}

export function SearchField({ value, onChangeText, placeholder = 'Search', onSubmit, testID }: SearchFieldProps) {
  const submit = () => {
    Keyboard.dismiss();
    onSubmit?.();
  };
  return (
    <View style={styles.field}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={submit}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        accessibilityLabel={placeholder}
        returnKeyType="search"
        autoCorrect={false}
        style={styles.input}
        testID={testID}
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText('')} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={12}>
          <Icon name="close-circle" size={18} color="textFaint" />
        </Pressable>
      ) : null}
      <Pressable
        onPress={submit}
        accessibilityRole="button"
        accessibilityLabel="Search"
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        testID={testID ? `${testID}-button` : undefined}
      >
        <Icon name="search" size={18} color="onPrimary" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: MIN_TOUCH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: 4,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.sm },
  button: { width: 40, height: 40, borderRadius: radius.md - 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: colors.primaryPressed },
});
