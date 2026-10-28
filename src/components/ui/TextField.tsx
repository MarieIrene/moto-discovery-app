import React, { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, TextInputInstance, TextInputProps, View } from 'react-native';
import { colors, MIN_TOUCH, radius, spacing, typography } from '@/theme';
import { AppText } from './AppText';
import { Icon, IconName } from './Icon';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  icon?: IconName;
  prefix?: string;
}

export const TextField = forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  { label, error, hint, icon, prefix, style, onFocus, onBlur, multiline, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.borderStrong;
  return (
    <View style={styles.wrapper}>
      <AppText variant="label" style={styles.label}>{label}</AppText>
      <View style={[styles.field, multiline && styles.multiline, { borderColor, borderWidth: focused || error ? 2 : 1 }]}>
        {icon ? <Icon name={icon} size={18} color="textMuted" /> : null}
        {prefix ? <AppText color="textMuted" variant="bodyStrong">{prefix}</AppText> : null}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          placeholderTextColor={colors.textFaint}
          selectionColor={colors.primary}
          multiline={multiline}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          {...rest}
        />
      </View>
      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <Icon name="alert-circle" size={14} color="danger" />
          <AppText variant="caption" color="danger">{error}</AppText>
        </View>
      ) : hint ? (
        <AppText variant="caption" color="textMuted" style={styles.hint}>{hint}</AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  label: { marginBottom: 2 },
  field: {
    minHeight: MIN_TOUCH + 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
  },
  multiline: { alignItems: 'flex-start', paddingVertical: spacing.sm },
  input: { flex: 1, ...typography.body, color: colors.text, paddingVertical: spacing.sm },
  inputMultiline: { minHeight: 110, textAlignVertical: 'top' },
  message: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  hint: { marginTop: 2 },
});
