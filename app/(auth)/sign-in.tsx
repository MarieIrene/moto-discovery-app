import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { FormTextField } from '@/components/forms/FormTextField';
import { PasswordField } from '@/components/forms/PasswordField';
import { AppText, Button, Card, Screen, ScreenHeader, SimulatedNote } from '@/components/ui';
import { signInSchema } from '@/lib/validation';
import { useSession } from '@/state/SessionProvider';
import { spacing } from '@/theme';

type Input = z.input<typeof signInSchema>;
type Output = z.output<typeof signInSchema>;

export default function SignIn() {
  const { signIn, flags } = useSession();
  const createAccount = () => router.push(flags.onboardingComplete ? '/register' : '/onboarding');
  const [error, setError] = useState<string>();
  const { control, handleSubmit, formState, setFocus } = useForm<Input, unknown, Output>({
    resolver: zodResolver(signInSchema),
    defaultValues: { phone: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ phone, password }) => {
    setError(undefined);
    const result = await signIn(phone, password);
    if (!result.ok) return setError(result.message);
    router.replace('/');
  });

  return (
    <Screen
      scroll
      footer={<Button label="Sign in" size="lg" fullWidth loading={formState.isSubmitting} onPress={onSubmit} testID="sign-in-submit" />}
    >
      <ScreenHeader back title="Sign in" subtitle="Use the phone number and password you registered with." />
      <View style={styles.form}>
        <FormTextField
          control={control}
          name="phone"
          label="Phone number"
          icon="call"
          placeholder="078 123 4567"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="next"
          onSubmitEditing={() => setFocus('password')}
          testID="sign-in-phone"
        />
        <PasswordField
          control={control}
          name="password"
          label="Password"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={() => onSubmit()}
          testID="sign-in-password"
        />
        <Button label="Forgot password?" variant="ghost" onPress={() => router.push('/reset-password')} testID="forgot-password" />
        {error ? <AppText color="danger" accessibilityLiveRegion="polite" testID="sign-in-error">{error}</AppText> : null}
        <Card tone="tint" style={styles.create}>
          <AppText variant="heading">New to Moto Discovery?</AppText>
          <AppText color="textMuted">Create a free account with your phone number and a password. It takes about a minute.</AppText>
          <Button label="Create an account" icon="person-add" variant="secondary" fullWidth onPress={createAccount} testID="sign-in-create-account" />
        </Card>
        <SimulatedNote>Accounts and passwords are stored only on this device. A password is saved as a secure hash, never as plain text.</SimulatedNote>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.lg }, create: { gap: spacing.sm } });
