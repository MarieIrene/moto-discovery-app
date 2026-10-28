import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';
import { FormTextField } from '@/components/forms/FormTextField';
import { AppText, Button, ChipGroup, EmptyState, Screen, ScreenHeader, SimulatedNote, useToast } from '@/components/ui';
import { CATEGORY_LABEL } from '@/lib/labels';
import { reportSchema } from '@/lib/validation';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useActorName, useSession } from '@/state/SessionProvider';
import { spacing } from '@/theme';
import { ReportCategory, ReportSeverity } from '@/types';

type Input = z.input<typeof reportSchema>;
type Output = z.output<typeof reportSchema>;

/** Severity is suggested from the category; admins can re-triage later. */
const SEVERITY_FOR: Record<ReportCategory, ReportSeverity> = {
  harassment: 'high', no_helmet: 'high', unsafe_riding: 'medium', overcharging: 'medium', no_show: 'low', other: 'low',
};

export default function ReportDriver() {
  const { driverId } = useLocalSearchParams<{ driverId: string }>();
  const { data, actions } = useAppData();
  const { profile } = useSession();
  const actor = useActorName();
  const toast = useToast();
  const driver = data.drivers.find((d) => d.id === driverId);
  const { control, handleSubmit, formState } = useForm<Input, unknown, Output>({
    resolver: zodResolver(reportSchema),
    defaultValues: { description: '' },
  });

  if (!driver || !profile) {
    return (
      <Screen>
        <ScreenHeader back title="Report" />
        <EmptyState title="Driver not found" action={{ label: 'Go back', onPress: () => router.back() }} />
      </Screen>
    );
  }

  const onSubmit = handleSubmit(({ category, description }) => {
    actions.submitReport(
      { reporterId: profile.id, reporterRole: 'passenger', subjectId: driver.id, subjectRole: 'driver', category, severity: SEVERITY_FOR[category], description },
      actor,
    );
    toast('Report submitted. Thank you.');
    router.back();
  });

  return (
    <Screen scroll footer={<Button label="Submit report" size="lg" fullWidth variant="danger" loading={formState.isSubmitting} onPress={onSubmit} testID="report-submit" />}>
      <ScreenHeader back title={`Report ${driver.fullName}`} subtitle={`${driver.motorcycle.plateNumber} · ${driver.motorcycle.make} ${driver.motorcycle.model}`} />
      <View style={styles.form}>
        <Controller
          control={control}
          name="category"
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <View style={styles.group}>
              <AppText variant="label">What happened?</AppText>
              <ChipGroup
                accessibilityLabel="Report category"
                value={value as ReportCategory}
                onChange={onChange}
                options={(Object.keys(CATEGORY_LABEL) as ReportCategory[]).map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))}
              />
              {error ? <AppText variant="caption" color="danger">{error.message}</AppText> : null}
            </View>
          )}
        />
        <FormTextField control={control} name="description" label="Details" multiline placeholder="Where and when did it happen? What did the driver do?" maxLength={500} />
        <AppText variant="caption" color="textMuted">If you are in danger, call Rwanda National Police on 112 first.</AppText>
        <SimulatedNote>Reports are saved on this device and appear in admin mode. Nothing is sent to a server.</SimulatedNote>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ form: { gap: spacing.lg }, group: { gap: spacing.xs } });
