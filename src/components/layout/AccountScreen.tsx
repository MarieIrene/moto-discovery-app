import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppText, Avatar, Card, ConfirmDialog, Divider, ListRow, Screen, ScreenHeader, Section, SegmentedControl, SimulatedNote, SwitchRow, useToast,
} from '@/components/ui';
import { demoPlaceName } from '@/data/mock';
import { formatPhone } from '@/lib/format';
import { canUseRole, useSession } from '@/state/SessionProvider';
import { useSettings } from '@/state/SettingsProvider';
import { spacing } from '@/theme';

const ROLE_LABEL = { passenger: 'Passenger', driver: 'Driver', both: 'Passenger and driver' } as const;

/** Profile & settings, shared by passenger and driver modes. */
export function AccountScreen() {
  const { profile, activeRole, switchRole, signOut } = useSession();
  const { settings, updateSettings } = useSettings();
  const toast = useToast();
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  if (!profile) return null;

  const canSwitch = profile.rolePreference === 'both';
  const otherRole = activeRole === 'driver' ? 'passenger' : 'driver';

  const changeMode = (role: 'passenger' | 'driver') => {
    switchRole(role);
    toast(role === 'driver' ? 'Switched to driver mode' : 'Switched to passenger mode');
    router.replace('/');
  };

  return (
    <Screen scroll>
      <ScreenHeader title="Account" />
      <Card style={styles.profile}>
        <Avatar name={profile.fullName} size={60} />
        <View style={styles.flex}>
          <AppText variant="heading">{profile.fullName}</AppText>
          <AppText color="textMuted">{formatPhone(profile.phone)}</AppText>
          <AppText variant="caption" color="textMuted">{ROLE_LABEL[profile.rolePreference]} · {profile.district}</AppText>
        </View>
      </Card>

      <Section title="Mode" style={styles.first}>
        {canSwitch ? (
          <SegmentedControl
            accessibilityLabel="App mode"
            value={activeRole === 'driver' ? 'driver' : 'passenger'}
            onChange={changeMode}
            segments={[{ value: 'passenger', label: 'Passenger', icon: 'person' }, { value: 'driver', label: 'Driver', icon: 'bicycle' }]}
          />
        ) : (
          <ListRow
            icon={otherRole === 'driver' ? 'bicycle' : 'person'}
            title={otherRole === 'driver' ? 'Start driving' : 'Ride as a passenger'}
            subtitle={otherRole === 'driver' ? 'Add your motorcycle to register as a driver.' : 'Use the same account to find drivers.'}
            onPress={() => router.push({ pathname: '/edit-profile', params: { addRole: otherRole } })}
          />
        )}
      </Section>

      <Section title="Profile">
        <ListRow icon="create" title="Edit profile" subtitle={canUseRole(profile.rolePreference, 'driver') ? 'Name, district and motorcycle' : 'Name and district'} onPress={() => router.push('/edit-profile')} />
        <Divider />
        <ListRow icon="lock-closed" title="Privacy & location" subtitle="Permissions and data on this device" onPress={() => router.push('/privacy')} />
        <Divider />
        <ListRow icon="shield-checkmark" title="Safety" subtitle="Riding tips and how to report a driver" onPress={() => router.push('/safety')} />
      </Section>

      <Section title="Demo settings">
        <SwitchRow icon="pin" title={`Use ${demoPlaceName(profile.district)} demo location`} subtitle="Centre discovery on your district’s main town instead of your device" value={settings.useDemoLocation} onValueChange={(v) => updateSettings({ useDemoLocation: v })} />
        <Divider />
        <SwitchRow icon="map" title="Use schematic map" subtitle="Skip the map provider, e.g. without an API key" value={settings.preferFallbackMap} onValueChange={(v) => updateSettings({ preferFallbackMap: v })} />
        <Divider />
        <SwitchRow icon="bug" title="Simulate load errors" subtitle="Show the error state when drivers load" value={settings.simulateLoadErrors} onValueChange={(v) => updateSettings({ simulateLoadErrors: v })} />
        <SimulatedNote>These switches exist to demonstrate app states. They would not appear in a released app.</SimulatedNote>
      </Section>

      <Section>
        <ListRow icon="log-out" title="Sign out" destructive onPress={() => setConfirmSignOut(true)} />
      </Section>

      <ConfirmDialog
        visible={confirmSignOut}
        title="Sign out?"
        message="Your profile stays saved on this device. Sign in again with your phone number and password to restore it."
        confirmLabel="Sign out"
        destructive
        onCancel={() => setConfirmSignOut(false)}
        onConfirm={async () => {
          setConfirmSignOut(false);
          await signOut();
          router.replace('/');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl },
  first: { marginTop: 0 },
  flex: { flex: 1, gap: 2 },
});
