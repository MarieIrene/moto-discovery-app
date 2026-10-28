import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { FormTextField } from '@/components/forms/FormTextField';
import { AppText, Button, Icon, Screen, ScreenHeader, SimulatedNote } from '@/components/ui';
import { registerSchema } from '@/lib/validation';
import { useSession } from '@/state/SessionProvider';
import { colors, radius, spacing } from '@/theme';

type Input = z.input<typeof registerSchema>;
type Output = z.output<typeof registerSchema>;

export default function Register() {
  const { beginAuth } = useSession();
  const { control, handleSubmit, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', phone: '', acceptTerms: false },
  });

  const onSubmit = handleSubmit(async ({ fullName, phone }) => {
    await beginAuth({ mode: 'register', phone, fullName });
    router.push('/verify-otp');
  });

  return (
    <Screen
      scroll
      footer={
        <>
          <Button label="Continue" size="lg" fullWidth loading={formState.isSubmitting} onPress={onSubmit} testID="register-submit" />
          <Button label="Already have an account? Sign in" variant="ghost" onPress={() => router.replace('/sign-in')} />
        </>
      }
    >
      <ScreenHeader back title="Create your account" subtitle="One account works for riding and for driving." />
      <View style={styles.form}>
        <FormTextField control={control} name="fullName" label="Full name" icon="person" placeholder="e.g. Grace Ingabire" autoComplete="name" textContentType="name" autoCapitalize="words" />
        <FormTextField control={control} name="phone" label="Phone number" icon="call" placeholder="078 123 4567" keyboardType="phone-pad" autoComplete="tel" hint="Drivers call or are called on this number." />
        <Controller
          control={control}
          name="acceptTerms"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <View style={styles.termsWrap}>
              <Pressable
                onPress={() => onChange(!value)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: value }}
                accessibilityLabel="I agree to the terms and the privacy notice"
                style={styles.terms}
              >
                <View style={[styles.box, value && styles.boxOn]}>{value ? <Icon name="checkmark" size={16} color="onPrimary" /> : null}</View>
                <AppText style={styles.termsText}>I agree to the terms and understand how my location is used.</AppText>
              </Pressable>
              {error ? <AppText variant="caption" color="danger">{error.message}</AppText> : null}
            </View>
          )}
        />
        <SimulatedNote>Accounts are stored only on this device. There is no server.</SimulatedNote>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  termsWrap: { gap: spacing.xs },
  terms: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48 },
  box: { width: 26, height: 26, borderRadius: radius.sm, borderWidth: 2, borderColor: colors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsText: { flex: 1 },
});
