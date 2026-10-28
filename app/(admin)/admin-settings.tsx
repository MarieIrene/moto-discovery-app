import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdminScreen } from '@/components/admin/AdminScreen';
import { AppText, Avatar, Card, ChipGroup, ConfirmDialog, Divider, ListRow, Section, SimulatedNote, SwitchRow, useToast } from '@/components/ui';
import { DEMO_ADMIN } from '@/data/mock';
import { RADIUS_OPTIONS_KM } from '@/features/discovery/filterDrivers';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useSession } from '@/state/SessionProvider';
import { useSettings } from '@/state/SettingsProvider';
import { spacing } from '@/theme';

export default function AdminSettings() {
  const { settings, updateSettings } = useSettings();
  const { actions } = useAppData();
  const { signOut } = useSession();
  const toast = useToast();
  const [dialog, setDialog] = useState<'reset' | 'signout' | null>(null);

  return (
    <AdminScreen title="Settings">
      <Card style={styles.profile}>
        <Avatar name={DEMO_ADMIN.fullName} size={56} />
        <View style={styles.flex}>
          <AppText variant="heading">{DEMO_ADMIN.fullName}</AppText>
          <AppText color="textMuted">{DEMO_ADMIN.email}</AppText>
          <AppText variant="caption" color="textMuted">Demo administrator</AppText>
        </View>
      </Card>

      <Section title="Discovery">
        <AppText color="textMuted">Largest search radius passengers can choose.</AppText>
        <ChipGroup
          accessibilityLabel="Maximum discovery radius"
          value={settings.maxDiscoveryRadiusKm}
          onChange={(v) => { updateSettings({ maxDiscoveryRadiusKm: v }); toast(`Maximum radius set to ${v} km`); }}
          options={RADIUS_OPTIONS_KM.map((r) => ({ value: r, label: `${r} km` }))}
        />
      </Section>

      <Section title="Demo controls">
        <SwitchRow icon="bug" title="Simulate load errors" subtitle="Passenger discovery shows its error state" value={settings.simulateLoadErrors} onValueChange={(v) => updateSettings({ simulateLoadErrors: v })} />
        <Divider />
        <ListRow icon="refresh" title="Reset demo data" subtitle="Restore sample drivers, passengers, reports and activity" onPress={() => setDialog('reset')} />
      </Section>

      <Section title="About admin mode">
        <SimulatedNote>
          This admin mode is a front-end simulation. Opening it with a code and hiding screens by role is not security. In production, admin sign-in, every approval, suspension and report change must be authorised and recorded by a trusted backend.
        </SimulatedNote>
      </Section>

      <Section>
        <ListRow icon="log-out" title="Sign out of admin mode" destructive onPress={() => setDialog('signout')} />
      </Section>

      <ConfirmDialog
        visible={dialog === 'reset'}
        title="Reset demo data?"
        message="All approvals, suspensions, reports and notes you made will be replaced with the original sample data."
        confirmLabel="Reset data"
        destructive
        onCancel={() => setDialog(null)}
        onConfirm={() => { actions.resetDemoData(); setDialog(null); toast('Demo data reset'); }}
      />
      <ConfirmDialog
        visible={dialog === 'signout'}
        title="Sign out of admin mode?"
        message="You’ll return to the welcome screen."
        confirmLabel="Sign out"
        onCancel={() => setDialog(null)}
        onConfirm={async () => { setDialog(null); await signOut(); router.replace('/'); }}
      />
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl },
  flex: { flex: 1, gap: 2 },
});
