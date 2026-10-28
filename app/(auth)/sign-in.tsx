import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { FormTextField } from '@/components/forms/FormTextField';
import { AppText, Button, Screen, ScreenHeader, SimulatedNote } from '@/components/ui';
import { signInSchema } from '@/lib/validation';
import { useSession } from '@/state/SessionProvider';
import { spacing } from '@/theme';

type Input = z.input<typeof signInSchema>;
type Output = z.output<typeof signInSchema>;

export default function SignIn() {
  const { beginAuth } = useSession();
  const [error, setError] = useState<string>();
  const { control, handleSubmit, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(signInSchema),
    defaultValues: { phone: '' },
  });

  const onSubmit = handleSubmit(async ({ phone }) => {
    setError(undefined);
    try {
      await beginAuth({ mode: 'signin', phone });
      router.push('/verify-otp');
    } catch {
      setError('Could not send a code. Try again.');
    }
  });

  return (
    <Screen
      scroll
      footer={
        <>
          <Button label="Send code" size="lg" fullWidth loading={formState.isSubmitting} onPress={onSubmit} testID="sign-in-submit" />
          <Button label="New here? Create an account" variant="ghost" onPress={() => router.replace('/register')} />
        </>
      }
    >
      <ScreenHeader back title="Sign in" subtitle="We’ll text a 6-digit code to your phone." />
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
          returnKeyType="done"
          onSubmitEditing={() => onSubmit()}
          testID="sign-in-phone"
        />
        {error ? <AppText color="danger">{error}</AppText> : null}
        <SimulatedNote>No SMS is sent in this demo. Use the code 123456 on the next screen.</SimulatedNote>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.lg } });
