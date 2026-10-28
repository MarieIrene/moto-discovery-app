import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdminScreen } from '@/components/admin/AdminScreen';
import { openAdminDriver, openAdminReport } from '@/components/admin/navigation';
import { ActivityItem, ReportRow } from '@/components/admin/rows';
import { AccountBadge, AppText, Avatar, Button, Card, ConfirmDialog, EmptyState, ListRow, Section, useToast } from '@/components/ui';
import { activityForSubject, contactsForPassenger, nameForUser, reportsAboutUser } from '@/features/admin/selectors';
import { formatDate, formatPhone, relativeTime } from '@/lib/format';
import { useAppData } from '@/state/appData/AppDataProvider';
import { useActorName } from '@/state/SessionProvider';
import { spacing } from '@/theme';

export default function AdminPassengerDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, actions } = useAppData();
  const actor = useActorName();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const passenger = data.passengers.find((p) => p.id === id);
  const contacts = useMemo(() => (passenger ? contactsForPassenger(data, passenger.id) : []), [data, passenger]);
  const reports = useMemo(() => (passenger ? reportsAboutUser(data, passenger.id) : []), [data, passenger]);
  const history = useMemo(() => (passenger ? activityForSubject(data, passenger.id) : []), [data, passenger]);

  if (!passenger) {
    return (
      <AdminScreen back title="Passenger">
        <EmptyState title="Passenger not found" action={{ label: 'Back to passengers', onPress: () => router.back() }} />
      </AdminScreen>
    );
  }

  const suspended = passenger.accountStatus === 'suspended';

  return (
    <AdminScreen
      back
      title="Passenger"
      footer={
        suspended
          ? <Button label="Reactivate account" icon="refresh" variant="secondary" onPress={() => setOpen(true)} fullWidth />
          : <Button label="Suspend account" icon="ban" variant="danger" onPress={() => setOpen(true)} fullWidth testID="admin-suspend-passenger" />
      }
    >
      <View style={styles.hero}>
        <Avatar name={passenger.fullName} size={72} />
        <View style={styles.flex}>
          <AppText variant="title">{passenger.fullName}</AppText>
          <AccountBadge status={passenger.accountStatus} />
        </View>
      </View>
      {passenger.statusReason ? (
        <Card tone="tint" style={styles.reason}>
          <AppText variant="label">Suspension reason</AppText>
          <AppText>{passenger.statusReason}</AppText>
        </Card>
      ) : null}

      <Section title="Summary">
        <ListRow icon="call" title="Phone" subtitle={formatPhone(passenger.phone)} />
        <ListRow icon="location" title="District" subtitle={passenger.district} />
        <ListRow icon="calendar" title="Joined" subtitle={formatDate(passenger.joinedAt)} />
        <ListRow icon="pulse" title="Last active" subtitle={relativeTime(passenger.lastActiveAt)} />
      </Section>

      <Section title={`Recent calls · ${contacts.length}`}>
        {contacts.length === 0 ? <AppText color="textMuted">No calls yet.</AppText> : contacts.slice(0, 5).map((c) => (
          <ListRow key={c.id} icon="bicycle" title={nameForUser(data, c.driverId)} subtitle={relativeTime(c.contactedAt)} onPress={() => openAdminDriver(c.driverId)} />
        ))}
      </Section>

      <Section title="Reports">
        {reports.length === 0 ? <AppText color="textMuted">No reports involve this passenger.</AppText> : (
          <View style={styles.stack}>{reports.map((r) => <ReportRow key={r.id} report={r} subjectName={nameForUser(data, r.subjectId)} onPress={() => openAdminReport(r.id)} />)}</View>
        )}
      </Section>

      <Section title="Account history">
        {history.length === 0 ? <AppText color="textMuted">No changes yet.</AppText> : history.map((a) => <ActivityItem key={a.id} event={a} />)}
      </Section>

      <ConfirmDialog
        visible={open}
        title={suspended ? 'Reactivate this passenger?' : 'Suspend this passenger?'}
        message={suspended ? 'They’ll be able to use the app again.' : 'In a real service they would be signed out and unable to contact drivers.'}
        confirmLabel={suspended ? 'Reactivate' : 'Suspend'}
        destructive={!suspended}
        reasonLabel={suspended ? undefined : 'Reason for suspending'}
        onCancel={() => setOpen(false)}
        onConfirm={(reason) => {
          actions.setPassengerAccountStatus(passenger.id, suspended ? 'active' : 'suspended', actor, reason);
          toast(suspended ? 'Passenger reactivated (simulated)' : 'Passenger suspended (simulated)');
          setOpen(false);
        }}
      />
    </AdminScreen>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl },
  flex: { flex: 1, gap: spacing.xs },
  reason: { gap: spacing.xs, marginBottom: spacing.xl },
  stack: { gap: spacing.sm },
});
