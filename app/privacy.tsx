import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import {
  AppText, Button, Card, ConfirmDialog, Divider, ListRow, Screen, ScreenHeader, Section, StatusBadge, SwitchRow, useToast,
} from '@/components/ui';
import { demoPlaceName } from '@/data/mock';
import { getPermissionState, PermissionState, requestPermission } from '@/services/location';
import { useSession } from '@/state/SessionProvider';
import { useSettings } from '@/state/SettingsProvider';
import { spacing } from '@/theme';

const PERMISSION_LABEL: Record<PermissionState, string> = { granted: 'Allowed', denied: 'Blocked', undetermined: 'Not asked yet' };

export default function Privacy() {
  const { settings, updateSettings } = useSettings();
  const { session, profile, deleteLocalAccount } = useSession();
  const place = demoPlaceName(profile?.district);
  const toast = useToast();
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useFocusEffect(useCallback(() => { void getPermissionState().then(setPermission); }, []));

  const changePermission = async () => {
    if (permission === 'undetermined') setPermission(await requestPermission());
    else await Linking.openSettings();
  };

  return (
    <Screen scroll>
      <ScreenHeader back title="Privacy & location" />
      <Section title="Location permission">
        <Card tone="tint" style={styles.card}>
          <StatusBadge
            label={PERMISSION_LABEL[permission]}
            tone={permission === 'granted' ? 'success' : permission === 'denied' ? 'danger' : 'neutral'}
            icon={permission === 'granted' ? 'checkmark-circle' : 'location'}
          />
          <AppText color="textMuted">
            Moto Discovery reads your location only while the app is open, to sort drivers by distance or place you on the map while you’re online as a driver.
          </AppText>
          <Button
            label={permission === 'undetermined' ? 'Allow location' : 'Open system settings'}
            variant="secondary"
            onPress={changePermission}
          />
        </Card>
        <SwitchRow
          icon="pin"
          title={`Use ${place} demo location`}
          subtitle={`Never read device location; use ${place} town instead`}
          value={settings.useDemoLocation}
          onValueChange={(v) => updateSettings({ useDemoLocation: v })}
        />
      </Section>

      <Section title="Your data">
        <ListRow icon="phone-portrait" title="Stored on this device only" subtitle="Your profile and session are kept in the device’s secure storage. Demo records use app storage." />
        <Divider />
        {session && !session.isAdmin ? (
          <ListRow icon="trash" title="Delete my profile from this device" destructive onPress={() => setConfirmDelete(true)} />
        ) : null}
      </Section>

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete your profile?"
        message="This signs you out and removes your profile from this device. Demo records in admin mode are not affected."
        confirmLabel="Delete profile"
        destructive
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setConfirmDelete(false);
          await deleteLocalAccount();
          toast('Profile deleted from this device');
          router.replace('/');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({ card: { gap: spacing.md } });
