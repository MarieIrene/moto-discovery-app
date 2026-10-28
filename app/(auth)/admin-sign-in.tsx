import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { FormTextField } from '@/components/forms/FormTextField';
import { AppText, Button, Screen, ScreenHeader, SimulatedNote } from '@/components/ui';
import { DEMO_ADMIN } from '@/data/mock';
import { adminSignInSchema } from '@/lib/validation';
import { useSession } from '@/state/SessionProvider';
import { spacing } from '@/theme';

type Input = z.input<typeof adminSignInSchema>;

export default function AdminSignIn() {
  const { signInAdmin } = useSession();
  const [error, setError] = useState<string>();
  const { control, handleSubmit, formState } = useForm<Input>({ resolver: zodResolver(adminSignInSchema), defaultValues: { accessCode: '' } });

  const onSubmit = handleSubmit(async ({ accessCode }) => {
    setError(undefined);
    const result = await signInAdmin(accessCode);
    if (!result.ok) return setError(result.message);
    router.replace('/');
  });

  return (
    <Screen scroll footer={<Button label="Enter admin mode" size="lg" fullWidth loading={formState.isSubmitting} onPress={onSubmit} testID="admin-submit" />}>
      <ScreenHeader back title="Admin demo access" subtitle="Review drivers, manage accounts and handle reports." />
      <View style={styles.form}>
        <FormTextField control={control} name="accessCode" label="Access code" icon="key" autoCapitalize="characters" autoCorrect={false} placeholder="Enter access code" onSubmitEditing={() => onSubmit()} />
        {error ? <AppText color="danger">{error}</AppText> : null}
        <SimulatedNote>{`Demo code: ${DEMO_ADMIN.accessCode}. Entering it only unlocks screens on this device. A real admin console must check permissions on a server for every action.`}</SimulatedNote>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.lg } });
