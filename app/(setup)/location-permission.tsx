import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText, Button, Icon, Screen } from '@/components/ui';
import { requestPermission } from '@/services/location';
import { useSession } from '@/state/SessionProvider';
import { useSettings } from '@/state/SettingsProvider';
import { colors, spacing } from '@/theme';

export default function LocationPermission() {
  const { markLocationPromptSeen, activeRole } = useSession();
  const { updateSettings } = useSettings();
  const [busy, setBusy] = useState(false);

  const finish = () => {
    markLocationPromptSeen();
    router.replace('/');
  };

  const allow = async () => {
    setBusy(true);
    const result = await requestPermission();
    setBusy(false);
    updateSettings({ useDemoLocation: result !== 'granted' });
    finish();
  };

  const skip = () => {
    updateSettings({ useDemoLocation: true });
    finish();
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <>
          <Button label="Allow location access" size="lg" fullWidth loading={busy} onPress={allow} testID="location-allow" />
          <Button label="Not now, use a Kigali demo location" variant="ghost" onPress={skip} />
        </>
      }
    >
      <View style={styles.center}>
        <View style={styles.badge}>
          <Icon name="navigate" size={44} color="onPrimary" />
        </View>
        <AppText variant="title" align="center">Show drivers near you</AppText>
        <AppText color="textMuted" align="center" style={styles.body}>
          {activeRole === 'driver'
            ? 'Your location places you on the map for nearby passengers while you are online. It is only read while the app is open.'
            : 'Your location is used to sort drivers by distance. It is read only while the app is open and never leaves this device in this demo.'}
        </AppText>
        <AppText variant="caption" color="textFaint" align="center" style={styles.body}>
          You can change this any time in Settings → Privacy & location.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  badge: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  body: { maxWidth: 340 },
});
