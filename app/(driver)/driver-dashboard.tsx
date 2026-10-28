import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  AppText, Avatar, Button, Card, Divider, ListRow, LoadingState, OfflineBanner, Section, SimulatedNote, StatusBadge, VerificationBadge, useToast,
} from '@/components/ui';
import { LiveMap } from '@/components/drivers/LiveMap';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { useSelfDriver } from '@/hooks/useSelfDriver';
import { formatPhone, relativeTime } from '@/lib/format';
import { getCurrentLocation, getPermissionState, PermissionState } from '@/services/location';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useActorName, useSession } from '@/state/SessionProvider';
import { useSettings } from '@/state/SettingsProvider';
import { colors, radius, spacing } from '@/theme';

const DAY = 86_400_000;

export default function DriverDashboard() {
  const { driver, contacts, passengerName } = useSelfDriver();
  const { actions } = useAppData();
  const { settings } = useSettings();
  const actor = useActorName();
  const { updateProfile } = useSession();
  const toast = useToast();
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [locating, setLocating] = useState(false);
  const [lastFix, setLastFix] = useState<string>();

  useFocusEffect(useCallback(() => { void getPermissionState().then(setPermission); }, []));

  // While online, every new position is published to the shared store, so passengers see you move.
  const live = useLiveLocation((point) => {
    if (driver?.isAvailable) actions.setDriverLocation(driver.id, point);
  });

  if (!driver) return <LoadingState label="Loading your driver profile" />;

  const canGoOnline = driver.verificationStatus === 'approved' && driver.accountStatus === 'active';
  const now = Date.now();
  const callsToday = contacts.filter((c) => now - new Date(c.contactedAt).getTime() < DAY).length;
  const callsWeek = contacts.filter((c) => now - new Date(c.contactedAt).getTime() < 7 * DAY).length;

  const toggle = async (next: boolean) => {
    if (next && !canGoOnline) return;
    if (next && !settings.useDemoLocation && permission === 'granted') {
      setLocating(true);
      const result = await getCurrentLocation();
      setLocating(false);
      if (result.status === 'ok') {
        actions.upsertSelfDriver({ ...driver, location: result.point }, false);
        setLastFix(new Date().toISOString());
      }
    }
    actions.setDriverAvailability(driver.id, next, actor);
    toast(next ? 'You’re online on this device' : 'You’re offline');
  };

  const online = driver.isAvailable;
  const locationLabel = settings.useDemoLocation
    ? 'Using Kigali demo location'
    : permission === 'granted' ? (lastFix ? `Position read ${relativeTime(lastFix)}` : 'Position is read when you go online')
    : 'Location permission is off';

  const liveStatus = live.source === 'off'
    ? 'Location is off, so this is your last saved position. Turn it on in Privacy & location.'
    : `${online ? 'Passengers see you here' : 'Only you can see this while offline'} · ${live.source === 'demo' ? 'simulated ride around Kigali' : live.updatedAt ? `updated ${relativeTime(live.updatedAt).toLowerCase()}` : 'finding you…'}`;

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerInner}>
          <Avatar name={driver.fullName} size={48} />
          <View style={styles.flex}>
            <AppText variant="small" color="onPrimaryMuted">Driver mode</AppText>
            <AppText variant="heading" color="onPrimary">{driver.fullName}</AppText>
          </View>
          <VerificationBadge status={driver.verificationStatus} />
        </View>
      </SafeAreaView>
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Pressable
          onPress={() => canGoOnline && !locating && toggle(!online)}
          disabled={!canGoOnline || locating}
          accessibilityRole="switch"
          accessibilityState={{ checked: online, disabled: !canGoOnline }}
          accessibilityLabel="Availability"
          accessibilityHint={canGoOnline ? 'Double tap to change' : 'Available after verification'}
          style={[styles.slab, online ? styles.slabOn : styles.slabOff, !canGoOnline && styles.slabDisabled]}
          testID="availability-toggle"
        >
          <View style={styles.flex}>
            <AppText variant="title" color={online ? 'onPrimary' : 'text'}>{online ? 'You’re online' : 'You’re offline'}</AppText>
            <AppText color={online ? 'onPrimaryMuted' : 'textMuted'}>
              {!canGoOnline
                ? driver.accountStatus === 'suspended' ? 'Your account is suspended.' : 'You can go online once you’re verified.'
                : online ? 'Nearby passengers can see and call you.' : 'Go online when you can take a trip.'}
            </AppText>
          </View>
          <Switch
            value={online}
            onValueChange={toggle}
            disabled={!canGoOnline || locating}
            trackColor={{ false: colors.borderStrong, true: colors.primaryTintStrong }}
            thumbColor={online ? colors.background : colors.background}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        </Pressable>
        <SimulatedNote>Availability changes only on this device. It is not published to a live platform, and other phones won’t see it.</SimulatedNote>

        {driver.verificationStatus === 'pending' ? (
          <Card tone="tint" style={styles.notice}>
            <StatusBadge label="Verification pending" tone="warning" icon="time" />
            <AppText color="textMuted">In a real service, the operations team checks your details before you can take passengers. Here you can approve yourself, or approve from admin mode.</AppText>
            <Button label="Simulate approval" icon="shield-checkmark" variant="secondary" onPress={() => { actions.setDriverVerification(driver.id, 'approved', 'Demo verification'); toast('Verified (simulated)'); }} testID="simulate-approval" />
          </Card>
        ) : null}
        {driver.verificationStatus === 'rejected' || driver.accountStatus === 'suspended' ? (
          <Card tone="tint" style={styles.notice}>
            <StatusBadge label={driver.accountStatus === 'suspended' ? 'Account suspended' : 'Registration rejected'} tone="danger" icon="alert-circle" />
            {driver.statusReason ? <AppText>{driver.statusReason}</AppText> : null}
            {driver.verificationStatus === 'rejected' ? (
              <>
                <Button label="Update details and resubmit" variant="secondary" onPress={() => { actions.setDriverVerification(driver.id, 'pending', actor); router.push('/edit-profile'); }} />
                <Button label="Submit new ID, permit and selfie" icon="camera" variant="ghost" onPress={async () => { await updateProfile({ documents: undefined }); router.replace('/'); }} />
              </>
            ) : (
              <AppText variant="caption" color="textMuted">Contact support to appeal. An admin can reactivate you in admin mode.</AppText>
            )}
          </Card>
        ) : null}

        <Section title="Your live location" style={styles.section}>
          <LiveMap
            driver={live.point ?? driver.location}
            trail={live.trail}
            accuracyM={live.accuracyM}
            driverLabel="your position"
            height={240}
            live={live.source !== 'off'}
            status={liveStatus}
          />
        </Section>

        <Section title="Location sharing" style={styles.section}>
          <ListRow
            icon={permission === 'granted' || settings.useDemoLocation ? 'navigate' : 'navigate-outline'}
            iconColor={permission === 'granted' || settings.useDemoLocation ? 'primary' : 'textMuted'}
            title={online ? 'Shown to nearby passengers' : 'Not shown while offline'}
            subtitle={locationLabel}
            onPress={() => router.push('/privacy')}
          />
        </Section>

        <View style={styles.stats}>
          <Card style={styles.stat}><AppText variant="display">{callsToday}</AppText><AppText variant="caption" color="textMuted">Calls in the last 24 h</AppText></Card>
          <Card style={styles.stat}><AppText variant="display">{callsWeek}</AppText><AppText variant="caption" color="textMuted">Calls this week</AppText></Card>
        </View>

        <Section title="Recent passenger calls" action={contacts.length > 3 ? <Button label="See all" variant="ghost" onPress={() => router.navigate('/driver-activity')} /> : undefined}>
          {contacts.length === 0 ? (
            <AppText color="textMuted">No calls yet. Passengers who call you will show here.</AppText>
          ) : (
            contacts.slice(0, 3).map((c, i) => (
              <View key={c.id}>
                {i > 0 ? <Divider /> : null}
                <ListRow icon="call" title={passengerName(c.passengerId)} subtitle={relativeTime(c.contactedAt)} />
              </View>
            ))
          )}
          <AppText variant="small" color="textFaint">Includes sample calls generated for this demo.</AppText>
        </Section>

        <Section title="Your motorcycle">
          <ListRow icon="bicycle" title={`${driver.motorcycle.make} ${driver.motorcycle.model}`} subtitle={`${driver.motorcycle.plateNumber} · ${driver.motorcycle.color} · ${driver.motorcycle.year}`} onPress={() => router.push('/edit-profile')} />
          <ListRow icon="call" title="Passengers call you on" subtitle={formatPhone(driver.phone)} />
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  flex: { flex: 1, gap: 2 },
  scroll: { padding: spacing.lg, gap: spacing.md, width: '100%', maxWidth: 640, alignSelf: 'center' },
  slab: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.xl, borderRadius: radius.lg, borderWidth: 2 },
  slabOn: { backgroundColor: colors.primaryPressed, borderColor: colors.primaryPressed },
  slabOff: { backgroundColor: colors.background, borderColor: colors.primary },
  slabDisabled: { borderColor: colors.border, backgroundColor: colors.surface },
  notice: { gap: spacing.md },
  section: { marginBottom: 0, marginTop: spacing.sm },
  stats: { flexDirection: 'row', gap: spacing.md },
  stat: { flex: 1, gap: 2 },
});
