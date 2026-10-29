import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  AppText, AvailabilityBadge, Avatar, Button, Card, EmptyState, Icon, IconName, ListRow, Screen, ScreenHeader, Section, SimulatedNote, VerificationBadge,
} from '@/components/ui';
import { LiveMap } from '@/components/drivers/LiveMap';
import { isDiscoverable } from '@/features/discovery/filterDrivers';
import { useCallDriver } from '@/hooks/useCallDriver';
import { useUserLocation } from '@/hooks/useUserLocation';
import { formatPhone, relativeTime } from '@/lib/format';
import { distanceKm, estimateMinutes, formatDistance } from '@/lib/geo';
import { useAppData } from '@/state/appData/AppDataProvider';
import { colors, radius, spacing } from '@/theme';

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={18} color="primary" />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="small" color="textMuted">{label}</AppText>
    </View>
  );
}

export default function DriverProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data } = useAppData();
  const { state } = useUserLocation();
  const call = useCallDriver();
  const driver = data.drivers.find((d) => d.id === id);

  if (!driver || !isDiscoverable(driver)) {
    return (
      <Screen>
        <ScreenHeader back title="Driver" />
        <EmptyState icon="person-remove" title="This driver isn’t available" body="Their profile may have been removed or is under review." action={{ label: 'Back to nearby drivers', onPress: () => router.back() }} />
      </Screen>
    );
  }

  const km = state.status === 'ready' ? distanceKm(state.point, driver.location) : null;
  const m = driver.motorcycle;

  return (
    <Screen
      scroll
      footer={
        <>
          <View style={styles.actions}>
            <View style={styles.flex}>
              <Button
                label="Message"
                icon="chatbubbles"
                size="lg"
                variant="secondary"
                fullWidth
                onPress={() => router.push({ pathname: '/chat/[peerId]', params: { peerId: driver.id } })}
                accessibilityHint="Opens a chat with this driver"
                testID="message-driver"
              />
            </View>
            <View style={styles.flex}>
              <Button
                label={driver.isAvailable ? `Call ${driver.fullName.split(' ')[0]}` : 'Offline'}
                icon="call"
                size="lg"
                fullWidth
                disabled={!driver.isAvailable}
                onPress={() => call(driver)}
                accessibilityHint="Opens your phone’s dialler with the driver’s number"
                testID="call-driver"
              />
            </View>
          </View>
          {!driver.isAvailable ? <AppText variant="caption" color="textMuted" align="center">Offline drivers may not answer calls. Send a message instead. Last active {relativeTime(driver.lastActiveAt)}.</AppText> : null}
        </>
      }
    >
      <ScreenHeader back title="Driver profile" />
      <View style={styles.hero}>
        <Avatar name={driver.fullName} uri={driver.photoUri ?? driver.documents?.selfieUri} size={104} available={driver.isAvailable} />
        <AppText variant="title" align="center">{driver.fullName}</AppText>
        <View style={styles.badges}>
          <VerificationBadge status={driver.verificationStatus} />
          <AvailabilityBadge available={driver.isAvailable} />
        </View>
        <AppText color="textMuted">{driver.sector}, {driver.district}</AppText>
      </View>

      <View style={styles.facts}>
        <Fact icon="navigate" label="Away" value={km != null ? formatDistance(km) : '—'} />
        <Fact icon="time" label="Est. pickup" value={km != null ? `${estimateMinutes(km)} min` : '—'} />
        <Fact icon="star" label="Rating" value={driver.rating ? driver.rating.toFixed(1) : 'New'} />
      </View>

      <Section title="Where they are">
        <LiveMap
          driver={driver.location}
          viewer={state.status === 'ready' ? state.point : undefined}
          driverLabel={driver.fullName}
          height={220}
          live={driver.isAvailable}
          status={driver.isAvailable
            ? `Online${km != null ? ` · ${formatDistance(km)} from you` : ''} · position from ${relativeTime(driver.lastActiveAt).toLowerCase()}`
            : `Offline · last seen ${relativeTime(driver.lastActiveAt).toLowerCase()}`}
        />
      </Section>

      <Section title="Motorcycle">
        <Card tone="tint">
          <View style={styles.plateRow}>
            <View style={styles.plate} accessibilityLabel={`Plate number ${m.plateNumber}`} accessible>
              <AppText variant="heading">{m.plateNumber}</AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">{m.make} {m.model}</AppText>
              <AppText variant="caption" color="textMuted">{m.color} · {m.year}</AppText>
            </View>
          </View>
          <AppText variant="caption" color="textMuted" style={styles.tip}>Check the plate before you get on.</AppText>
        </Card>
      </Section>

      <Section title="About">
        <ListRow icon="speedometer" title={`${driver.completedTrips.toLocaleString()} trips`} subtitle={`${driver.yearsRiding} years riding`} />
        <ListRow icon="chatbubbles" title="Languages" subtitle={driver.languages.join(', ')} />
        <ListRow icon="call" title="Phone" subtitle={formatPhone(driver.phone)} />
      </Section>

      <Section>
        <ListRow icon="flag" title="Report this driver" subtitle="Tell us about unsafe riding or other problems" onPress={() => router.push({ pathname: '/report/[driverId]', params: { driverId: driver.id } })} destructive />
        <ListRow icon="shield-checkmark" title="Safety tips" onPress={() => router.push('/safety')} />
      </Section>

      <SimulatedNote>Verification status and availability are demo data on this device, not live information.</SimulatedNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  badges: { flexDirection: 'row', gap: spacing.sm },
  facts: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  fact: { flex: 1, alignItems: 'center', gap: 2, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  plateRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  plate: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: '#FFD93B', borderRadius: radius.sm, borderWidth: 2, borderColor: colors.text },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  tip: { marginTop: spacing.sm },
});
