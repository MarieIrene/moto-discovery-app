import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { LiveMap } from '@/components/drivers/LiveMap';
import { AppText, Avatar, Button, Card, EmptyState, Icon, IconName, Screen, ScreenHeader, Section, SimulatedNote } from '@/components/ui';
import { useCanSeePassenger } from '@/hooks/useDriverPassengers';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { useSelfDriver } from '@/hooks/useSelfDriver';
import { formatPhone, relativeTime } from '@/lib/format';
import { distanceKm, estimateMinutes, formatDistance } from '@/lib/geo';
import { openDialer } from '@/services/phone';
import { useAppData } from '@/state/appData/AppDataProvider';
import { colors, radius, spacing } from '@/theme';
import { GeoPoint } from '@/types';

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.fact} accessible accessibilityLabel={`${label}: ${value}`}>
      <Icon name={icon} size={18} color="primary" />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="small" color="textMuted">{label}</AppText>
    </View>
  );
}

/** Opens turn-by-turn directions to the pickup point in Google Maps (app or website). */
function openDirections(to: GeoPoint) {
  void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${to.latitude},${to.longitude}&travelmode=driving`);
}

/** Driver view: where a passenger who contacted you is waiting, so you can go and pick them up. */
export default function PassengerLocation() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const contact = useCanSeePassenger(id);
  const { driver } = useSelfDriver();
  const { actions } = useAppData();
  // Follow the driver's own position on the map; while online it is also shared, as on the dashboard.
  const live = useLiveLocation((point) => {
    if (driver?.isAvailable) actions.setDriverLocation(driver.id, point);
  });

  if (!contact) {
    return (
      <Screen>
        <ScreenHeader back title="Passenger" />
        <EmptyState
          icon="lock-closed"
          title="Location not shared"
          body="You can only see where a passenger is after they call or message you."
          action={{ label: 'Go back', onPress: () => router.back() }}
        />
      </Screen>
    );
  }

  const { passenger } = contact;
  const me = live.point ?? driver?.location;
  const pickup = passenger.location;
  const km = me && pickup ? distanceKm(me, pickup) : null;

  return (
    <Screen
      scroll
      footer={
        <>
          {pickup ? <Button label="Directions to pickup" icon="navigate" size="lg" fullWidth onPress={() => openDirections(pickup)} testID="directions" /> : null}
          <View style={styles.actions}>
            <View style={styles.flex}>
              <Button label="Message" icon="chatbubbles" variant="secondary" fullWidth onPress={() => router.push({ pathname: '/chat/[peerId]', params: { peerId: passenger.id } })} />
            </View>
            <View style={styles.flex}>
              <Button label="Call" icon="call" variant="secondary" fullWidth onPress={() => openDialer(passenger.phone)} />
            </View>
          </View>
        </>
      }
    >
      <ScreenHeader back title="Pick up your passenger" />
      <Card style={styles.who}>
        <Avatar name={passenger.fullName} size={52} />
        <View style={styles.flex}>
          <AppText variant="heading">{passenger.fullName}</AppText>
          <AppText color="textMuted">{formatPhone(passenger.phone)} · {passenger.district}</AppText>
          <AppText variant="caption" color="textMuted">
            {contact.via === 'message' ? 'Messaged' : 'Called'} you {relativeTime(contact.lastContactAt).toLowerCase()}
          </AppText>
        </View>
      </Card>

      {pickup ? (
        <>
          <View style={styles.facts}>
            <Fact icon="navigate" label="Away" value={km != null ? formatDistance(km) : '—'} />
            <Fact icon="time" label="To reach them" value={km != null ? `${estimateMinutes(km)} min` : '—'} />
          </View>
          <Section title="Where they are">
            <LiveMap
              subject="passenger"
              driver={pickup}
              viewer={me}
              driverLabel={`${passenger.fullName}, pickup point`}
              height={280}
              live={!!passenger.locationUpdatedAt && Date.now() - new Date(passenger.locationUpdatedAt).getTime() < 15 * 60_000}
              status={`Pickup point${passenger.locationUpdatedAt ? ` updated ${relativeTime(passenger.locationUpdatedAt).toLowerCase()}` : ''} · the blue motorcycle is you`}
            />
          </Section>
        </>
      ) : (
        <EmptyState icon="location" title="No location yet" body="This passenger hasn’t shared a pickup point. Call or message them to ask where they are." />
      )}

      <SimulatedNote>
        Passengers share their pickup point only with drivers they call or message. In this demo, sample passengers have fixed positions.
      </SimulatedNote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  who: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  flex: { flex: 1, gap: 2 },
  facts: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  fact: { flex: 1, alignItems: 'center', gap: 2, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  actions: { flexDirection: 'row', gap: spacing.sm },
});
