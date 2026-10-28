import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { AppText, Avatar, Button, EmptyState, Screen, ScreenHeader, VerificationBadge } from '@/components/ui';
import { useCallDriver } from '@/hooks/useCallDriver';
import { formatPhone, relativeTime } from '@/lib/format';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useSession } from '@/state/SessionProvider';
import { colors, radius, spacing } from '@/theme';

export default function RecentContacts() {
  const { data } = useAppData();
  const { profile } = useSession();
  const call = useCallDriver();

  const rows = useMemo(() => {
    const seen = new Set<string>();
    return data.contacts
      .filter((c) => c.passengerId === profile?.id)
      .sort((a, b) => b.contactedAt.localeCompare(a.contactedAt))
      .filter((c) => (seen.has(c.driverId) ? false : (seen.add(c.driverId), true)))
      .map((c) => ({ contact: c, driver: data.drivers.find((d) => d.id === c.driverId) }))
      .filter((r): r is { contact: typeof r.contact; driver: NonNullable<typeof r.driver> } => !!r.driver);
  }, [data.contacts, data.drivers, profile?.id]);

  return (
    <Screen padded={false}>
      <View style={styles.head}>
        <ScreenHeader title="Recent drivers" subtitle="Drivers you’ve called from this device." />
      </View>
      <FlatList
        data={rows}
        keyExtractor={(r) => r.driver.id}
        contentContainerStyle={rows.length ? styles.list : styles.emptyList}
        ListEmptyComponent={
          <EmptyState
            icon="call"
            title="No calls yet"
            body="When you call a driver, they’ll appear here so you can reach them again quickly."
            action={{ label: 'Find a driver', onPress: () => router.navigate('/home') }}
          />
        }
        renderItem={({ item: { driver, contact } }) => {
          const reachable = driver.isAvailable && driver.accountStatus === 'active' && driver.verificationStatus === 'approved';
          return (
            <View style={styles.row}>
              <Avatar name={driver.fullName} uri={driver.photoUri} available={reachable} />
              <View style={styles.text}>
                <AppText variant="bodyStrong" onPress={() => router.push({ pathname: '/driver/[id]', params: { id: driver.id } })} accessibilityRole="link">
                  {driver.fullName}
                </AppText>
                <AppText variant="caption" color="textMuted">{formatPhone(driver.phone)} · called {relativeTime(contact.contactedAt)}</AppText>
                <VerificationBadge status={driver.verificationStatus} />
              </View>
              <Button label="Call" icon="call" variant={reachable ? 'primary' : 'secondary'} onPress={() => call(driver)} disabled={driver.accountStatus !== 'active'} />
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, width: '100%', maxWidth: 640, alignSelf: 'center' },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm, width: '100%', maxWidth: 640, alignSelf: 'center' },
  emptyList: { flexGrow: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  text: { flex: 1, gap: 3 },
});
