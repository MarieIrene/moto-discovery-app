import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DriverCard } from '@/components/drivers/DriverCard';
import { AppText, Avatar, Button, Card, Icon, IconName, OfflineBanner, Section } from '@/components/ui';
import { demoPlaceName } from '@/data/mock';
import { filterNearbyDrivers } from '@/features/discovery/filterDrivers';
import { useCallDriver } from '@/hooks/useCallDriver';
import { useUnreadMessages } from '@/hooks/useChat';
import { useUserLocation } from '@/hooks/useUserLocation';
import { pluralize } from '@/lib/format';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useSession } from '@/state/SessionProvider';
import { colors, radius, spacing } from '@/theme';

const NEAR_KM = 5;

function Shortcut({ icon, label, badge, onPress, testID }: { icon: IconName; label: string; badge?: number; onPress: () => void; testID?: string }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={badge ? `${label}, ${badge} unread` : label} testID={testID}>
      <View style={styles.shortcutIcon}>
        <Icon name={icon} size={22} color="primary" />
        {badge ? <View style={styles.badge}><AppText variant="small" color="onPrimary">{badge > 9 ? '9+' : badge}</AppText></View> : null}
      </View>
      <AppText variant="label" align="center">{label}</AppText>
    </Pressable>
  );
}

/** Passenger start page: a greeting, drivers close by right now, and shortcuts to the rest of the app. */
export default function PassengerStart() {
  const { profile } = useSession();
  const { data } = useAppData();
  const { state } = useUserLocation();
  const call = useCallDriver();
  const unread = useUnreadMessages();

  const origin = state.status === 'ready' ? state.point : null;
  const nearby = useMemo(
    () => (origin ? filterNearbyDrivers(data.drivers, origin, { radiusKm: NEAR_KM, availability: 'available', query: '' }, profile?.id) : []),
    [data.drivers, origin, profile?.id],
  );
  const first = profile?.fullName.split(' ')[0] ?? 'there';
  const where = state.status === 'ready' ? (state.isDemo ? `${demoPlaceName(profile?.district)} demo location` : 'your location') : 'you';
  const openNearby = () => router.navigate('/home');

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerInner}>
          <View style={styles.flex}>
            <AppText variant="small" color="onPrimaryMuted">Muraho,</AppText>
            <AppText variant="title" color="onPrimary">{first}</AppText>
            <View style={styles.place}>
              <Icon name="location" size={14} color="onPrimaryMuted" />
              <AppText variant="caption" color="onPrimaryMuted">{profile?.district ?? 'Rwanda'}</AppText>
            </View>
          </View>
          <Pressable onPress={() => router.navigate('/account')} accessibilityRole="button" accessibilityLabel="Your account">
            <Avatar name={profile?.fullName ?? 'You'} size={48} />
          </Pressable>
        </View>
      </SafeAreaView>
      <OfflineBanner />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.hero}>
          <AppText variant="small" color="onPrimaryMuted">Within {NEAR_KM} km of {where}</AppText>
          <AppText variant="display" color="onPrimary" testID="home-available-count">
            {origin ? pluralize(nearby.length, 'driver') : '…'}
          </AppText>
          <AppText color="onPrimaryMuted">available right now</AppText>
          <Button label="Find a moto" icon="bicycle" variant="inverse" size="lg" fullWidth onPress={openNearby} testID="home-find-moto" />
        </Card>

        <View style={styles.shortcuts}>
          <Shortcut icon="map" label="Nearby" onPress={openNearby} />
          <Shortcut icon="chatbubbles" label="Messages" badge={unread} onPress={() => router.navigate('/messages')} testID="home-messages" />
          <Shortcut icon="time" label="Recent" onPress={() => router.navigate('/recent')} />
          <Shortcut icon="shield-checkmark" label="Safety" onPress={() => router.push('/safety')} />
        </View>

        <Section title="Closest to you" action={nearby.length > 3 ? <Button label="See all" variant="ghost" onPress={openNearby} /> : undefined}>
          {!origin ? (
            <AppText color="textMuted">Finding your location…</AppText>
          ) : nearby.length === 0 ? (
            <AppText color="textMuted">No drivers are online within {NEAR_KM} km. Open Nearby to widen the search.</AppText>
          ) : (
            <View style={styles.list}>
              {nearby.slice(0, 3).map((d) => (
                <DriverCard key={d.id} driver={d} onPress={() => router.push({ pathname: '/driver/[id]', params: { id: d.id } })} onCall={() => call(d)} />
              ))}
            </View>
          )}
        </Section>

        <Card tone="tint" style={styles.tip}>
          <Icon name="bulb" size={20} color="primary" />
          <AppText style={styles.flex} color="textMuted">
            Check the plate number before you get on, wear the helmet the driver gives you, and agree the price before you leave.
          </AppText>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary },
  headerInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  flex: { flex: 1 },
  place: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  scroll: { padding: spacing.lg, gap: spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  hero: { backgroundColor: colors.primaryPressed, borderColor: colors.primaryPressed, gap: spacing.xs },
  shortcuts: { flexDirection: 'row', gap: spacing.sm },
  shortcut: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  pressed: { backgroundColor: colors.surface },
  shortcutIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryTint, alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', top: -4, right: -6, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  list: { gap: spacing.sm },
  tip: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
});
