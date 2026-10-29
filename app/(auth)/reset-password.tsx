import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { FormTextField } from '@/components/forms/FormTextField';
import { PasswordField } from '@/components/forms/PasswordField';
import { AppText, Button, Screen, ScreenHeader, SimulatedNote } from '@/components/ui';
import { resetPasswordSchema } from '@/lib/validation';
import { useSession } from '@/state/SessionProvider';
import { spacing } from '@/theme';

type Input = z.input<typeof resetPasswordSchema>;
type Output = z.output<typeof resetPasswordSchema>;

/** Forgot password: prove you own the number with an SMS code, then choose a new password. */
export default function ResetPassword() {
  const { beginAuth } = useSession();
  const [error, setError] = useState<string>();
  const { control, handleSubmit, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ phone, password }) => {
    setError(undefined);
    const result = await beginAuth({ mode: 'reset', phone, password });
    if (!result.ok) return setError(result.message);
    router.push('/verify-otp');
  });

  return (
    <Screen
      scroll
      footer={<Button label="Send code" size="lg" fullWidth loading={formState.isSubmitting} onPress={onSubmit} testID="reset-submit" />}
    >
      <ScreenHeader back title="Reset your password" subtitle="We’ll text a code to your phone to check it’s you." />
      <View style={styles.form}>
        <FormTextField control={control} name="phone" label="Phone number" icon="call" placeholder="078 123 4567" keyboardType="phone-pad" autoComplete="tel" />
        <PasswordField control={control} name="password" label="New password" hint="At least 6 characters, with letters and a number." autoComplete="new-password" textContentType="newPassword" />
        <PasswordField control={control} name="confirmPassword" label="Confirm new password" autoComplete="new-password" textContentType="newPassword" />
        {error ? <AppText color="danger" accessibilityLiveRegion="polite">{error}</AppText> : null}
        <SimulatedNote>No SMS is sent in this demo. Use the code 123456 on the next screen.</SimulatedNote>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.lg } });
