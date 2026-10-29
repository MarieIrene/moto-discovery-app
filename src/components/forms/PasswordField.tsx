import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { FieldValues } from 'react-hook-form';
import { Icon } from '@/components/ui';
import { FormTextField, FormTextFieldProps } from './FormTextField';

/** A password input with a button to show or hide what was typed. */
export function PasswordField<T extends FieldValues>(props: Omit<FormTextFieldProps<T>, 'secureTextEntry' | 'accessory'>) {
  const [visible, setVisible] = useState(false);
  return (
    <FormTextField
      icon="lock-closed"
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!visible}
      accessory={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          hitSlop={8}
          style={styles.toggle}
        >
          <Icon name={visible ? 'eye-off' : 'eye'} size={20} color="textMuted" />
        </Pressable>
      }
    />
  );
}

const styles = StyleSheet.create({ toggle: { padding: 4 } });
