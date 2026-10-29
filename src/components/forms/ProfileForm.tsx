import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, Section, SimulatedNote } from '@/components/ui';
import { ProfileFormOutput, profileFormSchema, ProfileFormValues } from '@/lib/validation';
import { spacing } from '@/theme';
import { DistrictPicker } from './DistrictPicker';
import { FormTextField } from './FormTextField';

export interface ProfileFormProps {
  defaultValues: ProfileFormValues;
  includeDriver: boolean;
  submitLabel: string;
  onSubmit: (values: ProfileFormOutput) => Promise<void> | void;
}

const EMPTY_MOTO = { make: '', model: '', plateNumber: '', color: '', year: '' };

export function ProfileForm({ defaultValues, includeDriver, submitLabel, onSubmit }: ProfileFormProps) {
  const resolver = useMemo(
    () => zodResolver(profileFormSchema(includeDriver)) as unknown as Resolver<ProfileFormValues>,
    [includeDriver],
  );
  const { control, handleSubmit, formState } = useForm<ProfileFormValues>({
    resolver,
    defaultValues: { ...defaultValues, motorcycle: includeDriver ? defaultValues.motorcycle ?? EMPTY_MOTO : undefined },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(values as unknown as ProfileFormOutput);
  });

  return (
    <View style={styles.form}>
      <Section title="About you">
        <View style={styles.fields}>
          <FormTextField control={control} name="fullName" label="Full name" icon="person" autoCapitalize="words" autoComplete="name" />
          <Controller
            control={control}
            name="district"
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <DistrictPicker value={value} onChange={onChange} error={error?.message} />
            )}
          />
          <FormTextField control={control} name="email" label="Email (optional)" icon="mail" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
        </View>
      </Section>

      {includeDriver ? (
        <Section title="Your motorcycle">
          <View style={styles.fields}>
            <View style={styles.row}>
              <View style={styles.half}><FormTextField control={control} name="motorcycle.make" label="Make" placeholder="TVS" /></View>
              <View style={styles.half}><FormTextField control={control} name="motorcycle.model" label="Model" placeholder="HLX 125" /></View>
            </View>
            <FormTextField control={control} name="motorcycle.plateNumber" label="Plate number" icon="card" placeholder="RD 123 A" autoCapitalize="characters" autoCorrect={false} />
            <View style={styles.row}>
              <View style={styles.half}><FormTextField control={control} name="motorcycle.color" label="Colour" placeholder="Red" /></View>
              <View style={styles.half}><FormTextField control={control} name="motorcycle.year" label="Year" placeholder="2022" keyboardType="number-pad" maxLength={4} /></View>
            </View>
            <SimulatedNote>Drivers also submit photos of their national ID and driving permit, plus a live selfie, for review. In this demo they stay on this device.</SimulatedNote>
          </View>
        </Section>
      ) : null}

      <Button label={submitLabel} size="lg" fullWidth loading={formState.isSubmitting} onPress={submit} testID="profile-submit" />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.sm },
  fields: { gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
});
